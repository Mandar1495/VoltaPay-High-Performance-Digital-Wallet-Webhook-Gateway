import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { TransactionLedger } from "../../../components/TransactionLedger";

async function getTransactions() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) return [];

  // 1. Fetch on-ramp transactions
  const onRamp = await prisma.onRampTransaction.findMany({
    where: { userId },
  });

  // 2. Fetch P2P transfers sent
  const p2pSent = await prisma.p2pTransfer.findMany({
    where: { fromUserId: userId },
    include: { toUser: { select: { number: true, name: true } } },
  });

  // 3. Fetch P2P transfers received
  const p2pReceived = await prisma.p2pTransfer.findMany({
    where: { toUserId: userId },
    include: { fromUser: { select: { number: true, name: true } } },
  });

  // Unified shape list
  const txs = [
    ...onRamp.map((t) => ({
      id: `ramp-${t.id}`,
      amount: t.amount,
      timestamp: t.startTime.toISOString(),
      status: t.status,
      type: "deposit",
      detail: t.provider,
      reference: t.token,
    })),
    ...p2pSent.map((t) => ({
      id: `sent-${t.id}`,
      amount: t.amount,
      timestamp: t.timestamp.toISOString(),
      status: "Success",
      type: "p2p_sent",
      detail: t.toUser.name || t.toUser.number,
      reference: t.toUser.number,
    })),
    ...p2pReceived.map((t) => ({
      id: `received-${t.id}`,
      amount: t.amount,
      timestamp: t.timestamp.toISOString(),
      status: "Success",
      type: "p2p_received",
      detail: t.fromUser.name || t.fromUser.number,
      reference: t.fromUser.number,
    })),
  ];

  // Sort by date desc
  return txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="w-full">
      <TransactionLedger transactions={transactions} />
    </div>
  );
}