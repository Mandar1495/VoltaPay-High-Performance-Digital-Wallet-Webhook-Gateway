"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";
import { User, AlertCircle, CheckCircle, Send, Loader2, Award } from "lucide-react";
import { MPinModal } from "./MPinModal";
import { ScratchCard } from "./ScratchCard";

interface Contact {
  name: string;
  number: string;
}

export function SendCard({ recentContacts = [] }: { recentContacts?: Contact[] }) {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });

  // MPIN modal state
  const [isMpinOpen, setIsMpinOpen] = useState(false);

  // Scratch card reward state
  const [rewardData, setRewardData] = useState<{ id: number; amount: number } | null>(null);

  // Extract phone number from QR Code scan if present in the URL query params
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone");

  useEffect(() => {
    if (phoneParam) {
      setNumber(phoneParam);
    }
  }, [phoneParam]);

  const initiateSend = () => {
    if (!number || !amount) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount." });
      return;
    }
    setIsMpinOpen(true);
  };

  const confirmSend = async (pin: string) => {
    setIsMpinOpen(false);
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const amountVal = parseFloat(amount);
      const res = await p2pTransfer(number, amountVal * 100, pin);

      if (res?.message) {
        setStatus({ type: "error", message: res.message });
      } else {
        setStatus({
          type: "success",
          message: `Successfully sent Rs. ${amountVal} to ${number}!`,
        });
        setAmount("");
        setNumber("");

        // Check if user won a scratch card!
        if (res.wonReward && res.rewardId && res.rewardAmount) {
          setRewardData({ id: res.rewardId, amount: res.rewardAmount });
        }
      }
    } catch (e: any) {
      setStatus({ type: "error", message: e.message || "Failed to process transfer." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl mb-3">
            <Send className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Send Money</h2>
          <p className="text-xs text-slate-400 mt-1">Instant peer-to-peer wallet transfer</p>
        </div>

        {/* Recent Contacts */}
        {recentContacts.length > 0 && (
          <div className="mb-6">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recent Contacts
            </label>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {recentContacts.map((contact) => (
                <button
                  key={contact.number}
                  type="button"
                  onClick={() => {
                    setNumber(contact.number);
                    setStatus({ type: "", message: "" });
                  }}
                  className="flex flex-col items-center shrink-0 group focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-violet-50 group-hover:border-violet-300 group-hover:text-violet-600 transition-all font-semibold text-xs shadow-sm">
                    {contact.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1.5 group-hover:text-slate-800 transition-colors">
                    {contact.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {status.type && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-xs font-medium animate-fadeIn ${
              status.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. 1111111111"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value.replace(/\D/g, ""));
                setStatus({ type: "", message: "" });
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-violet-500/50 rounded-xl text-slate-800 outline-none transition-all focus:ring-2 focus:ring-violet-500/10 text-sm font-medium"
              disabled={loading}
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Amount (INR)</label>
            <input
              type="text"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                setStatus({ type: "", message: "" });
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-violet-500/50 rounded-xl text-slate-800 outline-none transition-all focus:ring-2 focus:ring-violet-500/10 text-sm font-medium"
              disabled={loading}
            />
          </div>

          {/* Reward alert for amounts >= 10 */}
          {parseFloat(amount) >= 10 && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] font-semibold text-amber-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You are eligible to win a cashback scratch card on this transfer!</span>
            </div>
          )}

          <button
            onClick={initiateSend}
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Funds
              </>
            )}
          </button>
        </div>
      </div>

      {/* MPIN Entry Modal */}
      <MPinModal
        isOpen={isMpinOpen}
        onClose={() => setIsMpinOpen(false)}
        onSuccess={confirmSend}
      />

      {/* Interactive scratch card when won */}
      {rewardData && (
        <ScratchCard
          rewardId={rewardData.id}
          amount={rewardData.amount}
          onClose={() => setRewardData(null)}
        />
      )}
    </div>
  );
}