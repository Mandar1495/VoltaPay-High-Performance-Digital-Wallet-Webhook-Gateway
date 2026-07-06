import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { SendCard } from "../../../components/SendCard";
import { Suspense } from "react";

async function getRecentContacts() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) return [];

  // Query last 15 P2P transfers sent by this user
  const transfers = await prisma.p2pTransfer.findMany({
    where: {
      fromUserId: userId,
    },
    take: 15,
    orderBy: {
      timestamp: "desc",
    },
    include: {
      toUser: {
        select: {
          name: true,
          number: true,
        },
      },
    },
  });

  // Extract unique recipients
  const seenIds = new Set<number>();
  const uniqueContacts: { name: string; number: string }[] = [];

  for (const tx of transfers) {
    if (!seenIds.has(tx.toUserId)) {
      seenIds.add(tx.toUserId);
      uniqueContacts.push({
        name: tx.toUser.name || tx.toUser.number.substring(0, 4) + "...",
        number: tx.toUser.number,
      });
    }
  }

  return uniqueContacts.slice(0, 5); // Return up to 5 contacts
}

export default async function P2PPage() {
  const recentContacts = await getRecentContacts();

  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      }>
        <SendCard recentContacts={recentContacts} />
      </Suspense>
    </div>
  );
}