"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, DollarSign, Plus, X, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createBillSplit, payBillSplit } from "../../lib/actions/splitBills";
import { MPinModal } from "../../../components/MPinModal";
import confetti from "canvas-confetti";

interface MemberDetail {
  id: number;
  userId: number;
  amount: number;
  status: "PENDING" | "PAID";
  user: {
    name: string | null;
    number: string;
  };
}

interface SentSplit {
  id: number;
  amount: number;
  description: string;
  creatorId: number;
  createdAt: Date;
  members: MemberDetail[];
}

interface ReceivedSplit {
  id: number;
  billSplitId: number;
  userId: number;
  amount: number;
  status: "PENDING" | "PAID";
  billSplit: {
    id: number;
    amount: number;
    description: string;
    createdAt: Date;
    creator: {
      name: string | null;
      number: string;
    };
  };
}

interface SplitBillsClientProps {
  initialSentSplits: any[];
  initialReceivedSplits: any[];
}

export function SplitBillsClient({ initialSentSplits, initialReceivedSplits }: SplitBillsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "pending" | "sent">("create");
  const [sentSplits, setSentSplits] = useState<SentSplit[]>(initialSentSplits);
  const [receivedSplits, setReceivedSplits] = useState<ReceivedSplit[]>(initialReceivedSplits);

  // Split Form State
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });

  // MPIN & Payment states
  const [isMpinOpen, setIsMpinOpen] = useState(false);
  const [payingSplitId, setPayingSplitId] = useState<number | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payStatus, setPayStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });

  // Add friend to split list
  const addMember = () => {
    const formatted = phoneInput.trim().replace(/\D/g, "");
    if (formatted.length !== 10) {
      setFormStatus({ type: "error", message: "Phone number must be exactly 10 digits." });
      return;
    }
    if (members.includes(formatted)) {
      setFormStatus({ type: "error", message: "Number already added." });
      return;
    }
    setMembers((prev) => [...prev, formatted]);
    setPhoneInput("");
    setFormStatus({ type: "", message: "" });
  };

  const removeMember = (num: string) => {
    setMembers((prev) => prev.filter((m) => m !== num));
  };

  // Create Bill Split Action
  const handleCreateSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || members.length === 0) {
      setFormStatus({ type: "error", message: "Please fill all fields and add at least one member." });
      return;
    }
    const amtVal = parseFloat(amount);
    if (isNaN(amtVal) || amtVal <= 0) {
      setFormStatus({ type: "error", message: "Enter a valid amount." });
      return;
    }

    setCreateLoading(true);
    setFormStatus({ type: "", message: "" });

    try {
      const res = await createBillSplit(amtVal, description, members);
      if (res.success && res.billSplit) {
        setFormStatus({
          type: "success",
          message: `Split request created successfully! Individual share: Rs. ${(
            res.billSplit.amount /
            100 /
            (members.length + 1)
          ).toFixed(2)}`,
        });
        setAmount("");
        setDescription("");
        setMembers([]);
        router.refresh();
      } else {
        setFormStatus({ type: "error", message: res.error || "Failed to split bill." });
      }
    } catch (e: any) {
      setFormStatus({ type: "error", message: e.message || "Failed to create split." });
    } finally {
      setCreateLoading(false);
    }
  };

  // Pay Split Action Flow
  const initiatePay = (splitId: number) => {
    setPayingSplitId(splitId);
    setPayStatus({ type: "", message: "" });
    setIsMpinOpen(true);
  };

  const confirmPay = async (pin: string) => {
    if (payingSplitId === null) return;
    setIsMpinOpen(false);
    setPayLoading(true);
    setPayStatus({ type: "", message: "" });

    try {
      const res: any = await payBillSplit(payingSplitId, pin);
      if (res.success) {
        setPayStatus({ type: "success", message: "Bill Split paid successfully!" });
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
        });

        // Update local status to avoid manual reload
        setReceivedSplits((prev) =>
          prev.map((s) => (s.id === payingSplitId ? { ...s, status: "PAID" } : s))
        );
        router.refresh();
      } else {
        setPayStatus({ type: "error", message: res.error || "Payment failed." });
      }
    } catch (e: any) {
      setPayStatus({ type: "error", message: e.message || "Failed to pay split." });
    } finally {
      setPayLoading(false);
      setPayingSplitId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 space-y-4">
        <button
          onClick={() => setActiveTab("create")}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
            activeTab === "create"
              ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/10"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider opacity-90">Split Request</span>
              <span className="text-[10px] opacity-75">Divide costs with groups</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
            activeTab === "pending"
              ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/10"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <ArrowDownLeft className="w-5 h-5" />
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider opacity-90">Pending Requests</span>
              <span className="text-[10px] opacity-75">
                {receivedSplits.filter((s) => s.status === "PENDING").length} active requests
              </span>
            </div>
          </div>
          <ArrowDownLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
            activeTab === "sent"
              ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/10"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider opacity-90">Activity Details</span>
              <span className="text-[10px] opacity-75">Track bills you created</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-2">
        {activeTab === "create" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Split a New Bill</h3>
              <p className="text-xs text-slate-400">Specify details, add members, and VoltPay splits the bill automatically.</p>
            </div>

            {formStatus.type && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-medium ${
                  formStatus.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                    : "bg-rose-50 border-rose-100 text-rose-800"
                }`}
              >
                {formStatus.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{formStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateSplit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Total Amount (INR)</label>
                  <input
                    type="text"
                    placeholder="e.g. 300"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-violet-500/50 rounded-xl text-slate-800 outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Bill Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner at Domino's"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-violet-500/50 rounded-xl text-slate-800 outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Members input block */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Add Members (Phone Number)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. 9999999999"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-violet-500/50 rounded-xl text-slate-800 outline-none text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={addMember}
                    className="px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Friend Chips */}
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    {members.map((num) => (
                      <div
                        key={num}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold rounded-full"
                      >
                        <span>{num}</span>
                        <button type="button" onClick={() => removeMember(num)}>
                          <X className="w-3.5 h-3.5 text-violet-500 hover:text-violet-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Create Split Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === "pending" && (
          <div className="space-y-4">
            {payStatus.type && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-medium ${
                  payStatus.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800 animate-fadeIn"
                    : "bg-rose-50 border-rose-100 text-rose-800 animate-fadeIn"
                }`}
              >
                {payStatus.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{payStatus.message}</span>
              </div>
            )}

            {receivedSplits.filter((s) => s.status === "PENDING").length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700">All paid up!</h4>
                <p className="text-xs text-slate-500 mt-1">You have no pending bill split requests.</p>
              </div>
            ) : (
              receivedSplits
                .filter((s) => s.status === "PENDING")
                .map((split) => (
                  <div
                    key={split.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Owed to {split.billSplit.creator.name || split.billSplit.creator.number}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{split.billSplit.description}</h4>
                      <p className="text-xs text-slate-400">
                        Total Bill: Rs. {(split.billSplit.amount / 100).toFixed(2)} •{" "}
                        {new Date(split.billSplit.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-3 md:pt-0">
                      <div className="text-right md:text-right">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                          Your Share
                        </span>
                        <span className="text-lg font-black text-rose-600">
                          Rs. {(split.amount / 100).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => initiatePay(split.id)}
                        disabled={payLoading}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        {payLoading && payingSplitId === split.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Pay Now"
                        )}
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className="space-y-4">
            {sentSplits.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700">No requests sent yet</h4>
                <p className="text-xs text-slate-500 mt-1">Split requests created by you will show up here.</p>
              </div>
            ) : (
              sentSplits.map((split) => {
                const paidCount = split.members.filter((m) => m.status === "PAID").length;
                const totalMembers = split.members.length;

                return (
                  <div key={split.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm mb-1">{split.description}</h4>
                        <p className="text-[10px] text-slate-400">
                          Created on {new Date(split.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                          Total Bill
                        </span>
                        <span className="text-md font-extrabold text-slate-800">
                          Rs. {(split.amount / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100">
                      <span className="text-slate-500 font-medium">Payment status</span>
                      <span className="font-bold text-violet-600">
                        {paidCount} of {totalMembers} members paid
                      </span>
                    </div>

                    {/* Member checklist */}
                    <div className="space-y-2">
                      {split.members.map((member) => (
                        <div key={member.id} className="flex justify-between items-center text-xs">
                          <span className="text-slate-600">
                            {member.user.name || member.user.number}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-700">
                              Rs. {(member.amount / 100).toFixed(2)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                member.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}
                            >
                              {member.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MPIN secure validation modal */}
      <MPinModal
        isOpen={isMpinOpen}
        onClose={() => {
          setIsMpinOpen(false);
          setPayingSplitId(null);
        }}
        onSuccess={confirmPay}
        title="Verify Split Bill Payment"
        actionText="Pay Split Bill"
      />
    </div>
  );
}
