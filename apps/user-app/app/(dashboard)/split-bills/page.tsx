import { getSplitBills } from "../../lib/actions/splitBills";
import { SplitBillsClient } from "./SplitBillsClient";

export default async function SplitBillsPage() {
  const data = await getSplitBills();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Split <span className="text-violet-600">Bills</span>
        </h1>
        <p className="text-slate-500 mt-1">Split expenses easily with friends and track pending payouts.</p>
      </div>

      <SplitBillsClient 
        initialSentSplits={data.sentSplits || []} 
        initialReceivedSplits={data.receivedSplits || []} 
      />
    </div>
  );
}
