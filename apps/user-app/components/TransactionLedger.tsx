"use client";

import { useState } from "react";
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  History
} from "lucide-react";
import { ReceiptModal } from "./ReceiptModal";

interface Transaction {
  id: string;
  amount: number;
  timestamp: string;
  status: string;
  type: string;
  detail: string;
  reference: string;
}

export function TransactionLedger({ transactions = [] }: { transactions: Transaction[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const itemsPerPage = 8;

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // 1. Search Query
    const searchMatch = 
      tx.detail.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference.toLowerCase().includes(search.toLowerCase());

    // 2. Type Filter
    const typeMatch = 
      typeFilter === "all" || 
      tx.type === typeFilter;

    // 3. Status Filter
    const statusMatch = 
      statusFilter === "all" || 
      tx.status === statusFilter;

    return searchMatch && typeMatch && statusMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl border border-violet-200">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Ledger</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and filter audit logs of all wallet activities.</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-1">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          Filter Settings
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by provider, destination number or token..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-violet-500/50 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/10 text-slate-800"
            />
          </div>

          {/* Type Dropdown */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium outline-none focus:border-violet-500/50 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits (Bank)</option>
              <option value="p2p_sent">P2P Transfers (Sent)</option>
              <option value="p2p_received">P2P Transfers (Received)</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium outline-none focus:border-violet-500/50 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Processing">Processing</option>
              <option value="Failure">Failure</option>
            </select>
          </div>
        </div>

        {/* Clear filters button */}
        {(search || typeFilter !== "all" || statusFilter !== "all") && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-violet-600 hover:text-violet-500 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Activity Type</th>
                <th className="py-4 px-6">Reference / Account</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No transactions match your search settings.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => {
                      setSelectedTx({
                        id: tx.reference,
                        type: tx.type,
                        title: tx.detail,
                        amount: tx.amount,
                        date: tx.timestamp,
                        status: tx.status
                      });
                      setIsReceiptOpen(true);
                    }}
                    className="hover:bg-violet-50/20 active:bg-violet-50/40 cursor-pointer transition-colors"
                  >
                    {/* Date */}
                    <td className="py-4.5 px-6 text-xs text-slate-500">
                      {new Date(tx.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Type */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg border ${
                          tx.type === "deposit" 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                            : tx.type === "p2p_sent" 
                              ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                              : "bg-teal-50 border-teal-100 text-teal-600"
                        }`}>
                          {tx.type === "deposit" ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : tx.type === "p2p_sent" ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="capitalize font-bold text-xs text-slate-800">
                          {tx.type.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Detail/Ref */}
                    <td className="py-4.5 px-6">
                      <div>
                        <span className="text-slate-800">{tx.detail}</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5 select-all">
                          Ref: {tx.reference}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        tx.status === "Success"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : tx.status === "Processing"
                            ? "bg-amber-50 border-amber-100 text-amber-700"
                            : "bg-rose-50 border-rose-100 text-rose-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4.5 px-6 text-right font-black text-slate-800">
                      <span className={tx.type === "p2p_sent" ? "text-slate-700" : "text-emerald-600"}>
                        {tx.type === "p2p_sent" ? "-" : "+"} Rs. {(tx.amount / 100).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-bold">
            <div>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedTx(null);
        }}
        transaction={selectedTx}
      />
    </div>
  );
}
