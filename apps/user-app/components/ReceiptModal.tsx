"use client";

import { X, Download, CheckCircle2, AlertCircle, Clock, FileText } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string | number;
    type: "deposit" | "p2p_sent" | "p2p_received";
    title: string;
    amount: number; // in paise
    date: Date | string;
    status: string;
  } | null;
}

export function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  const dateObj = new Date(transaction.date);
  const formattedDate = dateObj.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const amountInRs = transaction.amount / 100;
  const isP2pSent = transaction.type === "p2p_sent";
  const isDeposit = transaction.type === "deposit";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn print:bg-white print:inset-auto print:relative print:z-0">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:border-none print:max-w-full">
        {/* Modal Header (Hidden on print) */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt content wrapper */}
        <div id="receipt-card-content" className="p-6 text-center print:p-0">
          {/* Brand Logo */}
          <div className="flex justify-center items-center gap-1 mb-4">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-violet-600/10">
              V
            </div>
            <span className="font-black text-slate-800 text-lg tracking-tight">Volt<span className="text-violet-600">Pay</span></span>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-3">
            {transaction.status === "Success" ? (
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-scaleIn">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
            ) : transaction.status === "Processing" ? (
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-100 animate-pulse">
                <Clock className="w-10 h-10 stroke-[2.5]" />
              </div>
            ) : (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                <AlertCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Status Label */}
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider inline-block mb-4 ${
              transaction.status === "Success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : transaction.status === "Processing"
                  ? "bg-amber-50 border-amber-100 text-amber-700 animate-pulse"
                  : "bg-rose-50 border-rose-100 text-rose-700"
            }`}
          >
            Payment {transaction.status}
          </span>

          {/* Transaction Amount */}
          <div className="space-y-1 mb-6">
            <h2 className="text-3xl font-black text-slate-800">
              {isP2pSent ? "-" : "+"} Rs. {amountInRs.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-400">{transaction.title}</p>
          </div>

          {/* Receipt details */}
          <div className="border-t border-dashed border-slate-200 py-4 space-y-3.5 text-xs text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Transaction ID</span>
              <span className="font-bold text-slate-700 uppercase select-all tracking-wider font-mono">
                {transaction.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Date & Time</span>
              <span className="font-semibold text-slate-700">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Payment Type</span>
              <span className="font-semibold text-slate-700 capitalize">
                {isDeposit ? "Bank Deposit" : isP2pSent ? "P2P Transfer Sent" : "P2P Transfer Received"}
              </span>
            </div>
            {isDeposit ? (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Payment Source</span>
                <span className="font-semibold text-slate-700">Linked Bank Account</span>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  {isP2pSent ? "Recipient" : "Sender"}
                </span>
                <span className="font-semibold text-slate-700">
                  {transaction.title.replace(/Sent to |Received from /, "")}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Barcode simulation */}
          <div className="border-t border-dashed border-slate-200 pt-6 pb-2 print:border-none flex flex-col items-center">
            {/* Simple barcode using CSS grids */}
            <div className="flex justify-center h-8 w-48 mb-2 opacity-50">
              {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 1, 3, 2, 4, 1, 2, 1, 3].map((val, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800"
                  style={{ width: `${val}px`, marginLeft: `${idx % 2 === 0 ? 1 : 2}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] font-mono">
              VOLTPAY-{transaction.id}
            </span>
          </div>

          {/* Download/Print Action (Hidden on print) */}
          <div className="mt-6 flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              type="button"
              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl transition-colors text-xs border border-slate-200 flex items-center justify-center gap-1.5"
            >
              Print Invoice
            </button>
            <button
              onClick={handlePrint} // Triggers print (which allows PDF export naturally in browsers)
              type="button"
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all shadow-md shadow-violet-600/10 hover:shadow-lg text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
