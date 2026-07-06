"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { verifyMPin } from "./mpin";

export async function createBillSplit(amountInRs: number, description: string, phoneNumbers: string[]) {
  const session = await getServerSession(authOptions);
  const creatorId = session?.user?.id;
  if (!creatorId) {
    return { success: false, error: "Not authenticated" };
  }

  if (phoneNumbers.length === 0) {
    return { success: false, error: "Must specify at least one member to split with" };
  }

  const totalAmountInPaise = Math.round(amountInRs * 100);
  if (totalAmountInPaise <= 0) {
    return { success: false, error: "Invalid amount" };
  }

  try {
    // 1. Resolve phone numbers to users
    const members = await prisma.user.findMany({
      where: {
        number: { in: phoneNumbers },
      },
    });

    if (members.length !== phoneNumbers.length) {
      const foundNumbers = members.map((m) => m.number);
      const missing = phoneNumbers.filter((n) => !foundNumbers.includes(n));
      return { success: false, error: `Users not found for number(s): ${missing.join(", ")}` };
    }

    // Include the creator in the division, but create split members only for the others
    const divisions = phoneNumbers.length + 1;
    const splitAmountPerMember = Math.floor(totalAmountInPaise / divisions);

    // 2. Create the records
    const billSplit = await prisma.billSplit.create({
      data: {
        amount: totalAmountInPaise,
        description,
        creatorId: Number(creatorId),
        members: {
          create: members.map((member) => ({
            userId: member.id,
            amount: splitAmountPerMember,
            status: "PENDING",
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return { success: true, billSplit };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to split bill" };
  }
}

export async function getSplitBills() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, sentSplits: [], receivedSplits: [] };
  }

  // 1. Splits created by this user (Sent)
  const sentSplits = await prisma.billSplit.findMany({
    where: { creatorId: Number(userId) },
    include: {
      members: {
        include: {
          user: {
            select: { name: true, number: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Splits where the user is a member (Received)
  const receivedSplits = await prisma.billSplitMember.findMany({
    where: { userId: Number(userId) },
    include: {
      billSplit: {
        include: {
          creator: {
            select: { name: true, number: true },
          },
        },
      },
    },
    orderBy: {
      billSplit: {
        createdAt: "desc",
      },
    },
  });

  return { success: true, sentSplits, receivedSplits };
}

export async function payBillSplit(memberSplitId: number, pin: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  // 1. Verify MPIN first
  const pinValid = await verifyMPin(pin);
  if (!pinValid) {
    return { success: false, error: "Incorrect Transaction MPIN" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 2. Fetch the split member record
      const splitMember = await tx.billSplitMember.findUnique({
        where: { id: memberSplitId },
        include: {
          billSplit: true,
        },
      });

      if (!splitMember || splitMember.userId !== Number(userId)) {
        throw new Error("Request not found or access denied");
      }

      if (splitMember.status === "PAID") {
        throw new Error("Already paid");
      }

      const billSplit = splitMember.billSplit;

      // 3. Lock user balance and check funds
      await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(userId)} FOR UPDATE`;

      const payerBalance = await tx.balance.findUnique({
        where: { userId: Number(userId) },
      });

      if (!payerBalance || payerBalance.amount < splitMember.amount) {
        throw new Error("Insufficient funds in wallet");
      }

      // 4. Debit Payer
      await tx.balance.update({
        where: { userId: Number(userId) },
        data: { amount: { decrement: splitMember.amount } },
      });

      // 5. Credit Split Creator
      const creatorBalance = await tx.balance.findUnique({
        where: { userId: billSplit.creatorId },
      });

      if (!creatorBalance) {
        await tx.balance.create({
          data: {
            userId: billSplit.creatorId,
            amount: splitMember.amount,
            locked: 0,
          },
        });
      } else {
        await tx.balance.update({
          where: { userId: billSplit.creatorId },
          data: { amount: { increment: splitMember.amount } },
        });
      }

      // 6. Update Status
      await tx.billSplitMember.update({
        where: { id: memberSplitId },
        data: { status: "PAID" },
      });

      // 7. Log as a P2P Transfer for receipt and audit history
      await tx.p2pTransfer.create({
        data: {
          fromUserId: Number(userId),
          toUserId: billSplit.creatorId,
          amount: splitMember.amount,
          timestamp: new Date(),
        },
      });

      return { success: true };
    });

    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to pay split bill" };
  }
}
