import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { DashboardClient } from "./DashboardClient";

async function getDashboardAnalytics() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) {
    return null;
  }

  // 1. Get user name
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, number: true }
  });

  // 2. Get balances
  const balance = await prisma.balance.findFirst({
    where: { userId }
  });

  // 3. Aggregate totals
  const sentAgg = await prisma.p2pTransfer.aggregate({
    where: { fromUserId: userId },
    _sum: { amount: true }
  });

  const receivedAgg = await prisma.p2pTransfer.aggregate({
    where: { toUserId: userId },
    _sum: { amount: true }
  });

  const depositAgg = await prisma.onRampTransaction.aggregate({
    where: { userId, status: "Success" },
    _sum: { amount: true }
  });

  // 4. Get recent transactions
  const p2pSent = await prisma.p2pTransfer.findMany({
    where: { fromUserId: userId },
    take: 4,
    orderBy: { timestamp: "desc" },
    include: { toUser: { select: { name: true, number: true } } }
  });

  const p2pReceived = await prisma.p2pTransfer.findMany({
    where: { toUserId: userId },
    take: 4,
    orderBy: { timestamp: "desc" },
    include: { fromUser: { select: { name: true, number: true } } }
  });

  const onRamp = await prisma.onRampTransaction.findMany({
    where: { userId },
    take: 4,
    orderBy: { startTime: "desc" }
  });

  // Format activities list
  const activities: any[] = [];

  p2pSent.forEach(tx => {
    activities.push({
      id: `p2p-s-${tx.id}`,
      type: "p2p_sent",
      title: `Sent to ${tx.toUser.name || tx.toUser.number}`,
      amount: tx.amount,
      date: tx.timestamp.toISOString(),
      status: "Success"
    });
  });

  p2pReceived.forEach(tx => {
    activities.push({
      id: `p2p-r-${tx.id}`,
      type: "p2p_received",
      title: `Received from ${tx.fromUser.name || tx.fromUser.number}`,
      amount: tx.amount,
      date: tx.timestamp.toISOString(),
      status: "Success"
    });
  });

  onRamp.forEach(tx => {
    activities.push({
      id: `ramp-${tx.id}`,
      type: "deposit",
      title: `Added via ${tx.provider}`,
      amount: tx.amount,
      date: tx.startTime.toISOString(),
      status: tx.status
    });
  });

  // Sort activities by date desc
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 5. Calculate daily cashflow volumes for the last 7 days
  const dailyVolumes = [];
  const dailyLabels = [];
  
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const dayP2pSent = await prisma.p2pTransfer.aggregate({
      where: {
        fromUserId: userId,
        timestamp: { gte: start, lt: end }
      },
      _sum: { amount: true }
    });

    const dayP2pRec = await prisma.p2pTransfer.aggregate({
      where: {
        toUserId: userId,
        timestamp: { gte: start, lt: end }
      },
      _sum: { amount: true }
    });

    const dayDeposit = await prisma.onRampTransaction.aggregate({
      where: {
        userId,
        status: "Success",
        startTime: { gte: start, lt: end }
      },
      _sum: { amount: true }
    });

    const totalDayVolume = 
      ((dayP2pSent._sum.amount || 0) + 
       (dayP2pRec._sum.amount || 0) + 
       (dayDeposit._sum.amount || 0)) / 100; // in Rupees

    dailyVolumes.push(totalDayVolume);
    dailyLabels.push(start.toLocaleDateString("en-US", { weekday: "short" }));
  }

  return {
    name: user?.name || user?.number || "User",
    availableBal: (balance?.amount || 0) / 100,
    lockedBal: (balance?.locked || 0) / 100,
    sentTotal: (sentAgg._sum.amount || 0) / 100,
    receivedTotal: (receivedAgg._sum.amount || 0) / 100,
    depositTotal: (depositAgg._sum.amount || 0) / 100,
    recentActivity: activities.slice(0, 5),
    dailyVolumes,
    dailyLabels
  };
}

export default async function DashboardPage() {
  const data = await getDashboardAnalytics();

  if (!data) {
    return (
      <div className="w-full text-center py-20">
        <p className="text-slate-500">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return <DashboardClient initialData={data} />;
}