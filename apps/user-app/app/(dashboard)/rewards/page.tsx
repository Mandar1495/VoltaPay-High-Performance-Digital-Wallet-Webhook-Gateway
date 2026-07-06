import { getUserRewards } from "../../lib/actions/rewards";
import { RewardsClient } from "./RewardsClient";

export default async function RewardsPage() {
  const data = await getUserRewards();
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          My <span className="text-violet-600">Rewards</span>
        </h1>
        <p className="text-slate-500 mt-1">Scratch cards and cashback earned from your VoltPay transactions.</p>
      </div>

      <RewardsClient 
        initialRewards={data.rewards || []} 
        initialTotalEarned={data.totalEarned || 0} 
      />
    </div>
  );
}
