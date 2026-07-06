"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Trophy, Gift, ArrowRight, Sparkles } from "lucide-react";
import { ScratchCard } from "../../../components/ScratchCard";

interface Reward {
  id: number;
  userId: number;
  amount: number;
  isScratched: boolean;
  createdAt: Date;
  scratchedAt: Date | null;
}

interface RewardsClientProps {
  initialRewards: any[];
  initialTotalEarned: number;
}

export function RewardsClient({ initialRewards, initialTotalEarned }: RewardsClientProps) {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [totalEarned, setTotalEarned] = useState(initialTotalEarned);
  const [activeScratchCard, setActiveScratchCard] = useState<Reward | null>(null);

  const unscratchedCount = rewards.filter((r) => !r.isScratched).length;

  const handleScratchComplete = () => {
    if (!activeScratchCard) return;

    // Update local state for immediate feedback
    setRewards((prev) =>
      prev.map((r) =>
        r.id === activeScratchCard.id
          ? { ...r, isScratched: true, scratchedAt: new Date() }
          : r
      )
    );
    setTotalEarned((prev) => prev + activeScratchCard.amount);
    
    // Sync with server state
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Analytics header card */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-widest text-xs">
            <Sparkles className="w-4 h-4" />
            VoltPay Club Rewards
          </div>
          <h2 className="text-4xl font-black">
            Rs. {(totalEarned / 100).toLocaleString()}
          </h2>
          <p className="text-xs text-slate-400">Total cashbacks earned and deposited to your wallet.</p>
        </div>

        <div className="flex gap-4">
          <div className="px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-center">
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total Cards Won</span>
            <span className="text-xl font-bold">{rewards.length}</span>
          </div>
          <div className="px-5 py-4 bg-violet-950/30 border border-violet-900/30 rounded-2xl text-center">
            <span className="block text-[10px] text-violet-400 uppercase font-bold tracking-wider mb-1">Unscratched</span>
            <span className="text-xl font-bold text-violet-300">{unscratchedCount}</span>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-600" />
          Your Scratch Cards
        </h3>

        {rewards.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 max-w-md mx-auto">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mx-auto mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-700">No reward cards yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Complete peer-to-peer transfers of ₹100 or more for a chance to win cashback rewards!
            </p>
            <button
              onClick={() => router.push("/p2p")}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              Send P2P Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {rewards.map((reward) => {
              if (reward.isScratched) {
                return (
                  <div
                    key={reward.id}
                    className="aspect-square bg-gradient-to-tr from-amber-500/5 to-yellow-500/5 border border-amber-500/20 rounded-3xl p-5 flex flex-col justify-between items-center text-center shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">
                        Rs. {(reward.amount / 100).toLocaleString()}
                      </h4>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Claimed</p>
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {new Date(reward.scratchedAt || reward.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              } else {
                return (
                  <button
                    key={reward.id}
                    type="button"
                    onClick={() => setActiveScratchCard(reward)}
                    className="aspect-square bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-violet-500/20 rounded-3xl p-5 flex flex-col justify-between items-center text-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold animate-pulse">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold tracking-tight">VoltPay Mystery Card</h4>
                      <p className="text-[10px] text-violet-200 mt-1">Tap to scratch</p>
                    </div>
                    <span className="text-[9px] text-violet-200 bg-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Ready
                    </span>
                  </button>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Modal scratch animation */}
      {activeScratchCard && (
        <ScratchCard
          rewardId={activeScratchCard.id}
          amount={activeScratchCard.amount}
          onComplete={handleScratchComplete}
          onClose={() => setActiveScratchCard(null)}
        />
      )}
    </div>
  );
}
