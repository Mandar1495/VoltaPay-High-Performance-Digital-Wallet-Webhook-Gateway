"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, Suspense } from "react";
import { simulateBankWebhook, simulateBankWebhookFailure } from "../lib/actions/simulateBankWebhook";
import { CheckCircle2, XCircle, Landmark, ShieldAlert, Loader2 } from "lucide-react";

function BankRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

  const token = searchParams.get("token") || "";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const provider = searchParams.get("provider") || "HDFC Bank";

  const [loading, setLoading] = useState(false);
  const [txnStatus, setTxnStatus] = useState<"pending" | "success" | "failure">("pending");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSimulateSuccess = async () => {
    const user = session.data?.user as any;
    if (!user || !user.id) {
      setStatusMessage("Unauthenticated request. Cannot verify user.");
      return;
    }
    setLoading(true);
    setStatusMessage("Authorizing funds with bank networks...");

    // Webhook expects amount in cents/paise
    const amountInCents = amount * 100;

    const res = await simulateBankWebhook(token, user.id, amountInCents);

    if (res.success) {
      setTxnStatus("success");
      setStatusMessage("Funds approved! Redirecting back to VoltPay...");
      setTimeout(() => {
        router.push("/transfer");
        router.refresh();
      }, 3000);
    } else {
      setTxnStatus("failure");
      setStatusMessage(res.message);
    }
    setLoading(false);
  };

  const handleSimulateFailure = async () => {
    setLoading(true);
    setStatusMessage("Cancelling transaction request...");

    const res = await simulateBankWebhookFailure(token);

    if (res.success) {
      setTxnStatus("failure");
      setStatusMessage("Transaction declined by user/bank. Redirecting back...");
      setTimeout(() => {
        router.push("/transfer");
        router.refresh();
      }, 3000);
    } else {
      setStatusMessage(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Header styling mimics a banking terminal */}
        <div className="flex items-center gap-3 border-b border-slate-700 pb-6 mb-6">
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-2xl border border-violet-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{provider} NetBanking</h3>
            <p className="text-xs text-slate-400">Secure Payment Sandbox Gateway</p>
          </div>
        </div>

        {txnStatus === "pending" && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Merchant</span>
                <span className="font-semibold text-slate-200">VoltPay Wallet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Payment Reference</span>
                <span className="font-mono text-slate-200 select-all">{token.substring(0, 10)}...</span>
              </div>
              <div className="border-t border-slate-800 my-2 pt-2 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Amount to Deposit</span>
                <span className="text-2xl font-black text-violet-400">Rs. {amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
              <span>
                This is a secure local simulation sandbox. You can choose to approve the request (to increment your wallet balance) or decline it to test handling failure states.
              </span>
            </div>

            {statusMessage && (
              <div className="text-center text-sm text-violet-300 animate-pulse flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {statusMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleSimulateFailure}
                disabled={loading}
                className="py-3.5 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold rounded-xl transition-all duration-200 hover:text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Decline
              </button>
              <button
                onClick={handleSimulateSuccess}
                disabled={loading}
                className="py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                Approve Payment
              </button>
            </div>
          </div>
        )}

        {txnStatus === "success" && (
          <div className="text-center py-8 space-y-4 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-400">Payment Captured</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">{statusMessage}</p>
            <div className="pt-4 text-xs text-slate-500">
              Transaction token: <span className="font-mono">{token}</span>
            </div>
          </div>
        )}

        {txnStatus === "failure" && (
          <div className="text-center py-8 space-y-4 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-full mb-2">
              <XCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-rose-400">Payment Declined</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">{statusMessage}</p>
            <button
              onClick={() => router.push("/transfer")}
              className="mt-4 px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Return to Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BankRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          <span>Connecting secure bank gateway...</span>
        </div>
      </div>
    }>
      <BankRedirectContent />
    </Suspense>
  );
}
