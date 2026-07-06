"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function getUserRewards() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, rewards: [], totalEarned: 0 };
  }

  const rewards = await prisma.reward.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
  });

  const totalEarned = rewards
    .filter((r) => r.isScratched)
    .reduce((sum, r) => sum + r.amount, 0);

  return { success: true, rewards, totalEarned };
}

export async function scratchCardAction(rewardId: number) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const res = await prisma.$transaction(async (tx) => {
      // 1. Fetch reward
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || reward.userId !== Number(userId)) {
        throw new Error("Reward not found or access denied");
      }

      if (reward.isScratched) {
        throw new Error("Reward already claimed");
      }

      // 2. Mark card as scratched
      const updatedReward = await tx.reward.update({
        where: { id: rewardId },
        data: {
          isScratched: true,
          scratchedAt: new Date(),
        },
      });

      // 3. Lock user's balance & update
      // Find or create balance
      const balance = await tx.balance.findUnique({
        where: { userId: Number(userId) },
      });

      if (!balance) {
        // Create balance if it doesn't exist
        await tx.balance.create({
          data: {
            userId: Number(userId),
            amount: reward.amount,
            locked: 0,
          },
        });
      } else {
        await tx.balance.update({
          where: { userId: Number(userId) },
          data: {
            amount: { increment: reward.amount },
          },
        });
      }

      return updatedReward;
    });

    return { success: true, reward: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to scratch reward card" };
  }
}
