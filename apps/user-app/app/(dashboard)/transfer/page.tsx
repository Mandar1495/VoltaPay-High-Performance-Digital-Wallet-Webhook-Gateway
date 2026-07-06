import prisma from "@repo/db/client";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { ArrowLeftRight } from "lucide-react";

async function getBalance() {
  const session = await getServerSession(authOptions);
  const balance = await prisma.balance.findFirst({
    where: {
      userId: Number(session?.user?.id),
    },
  });
  return {
    amount: balance?.amount || 0,
    locked: balance?.locked || 0,
  };
}

async function getOnRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.onRampTransaction.findMany({
    where: {
      userId: Number(session?.user?.id),
    },
    orderBy: {
      startTime: "desc",
    },
  });
  return txns.map((t) => ({
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider,
  }));
}

export default async function TransferPage() {
  const balance = await getBalance();
  const transactions = await getOnRampTransactions();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl border border-violet-200">
          <ArrowLeftRight className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">External On-Ramp</h1>
          <p className="text-slate-500 text-sm mt-0.5">Deposit money into your wallet instantly from a linked bank account.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Add Money form */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <AddMoney />
        </div>

        {/* Right Side: Balances and Transactions ledger logs */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <BalanceCard amount={balance.amount} locked={balance.locked} />
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <OnRampTransactions transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}