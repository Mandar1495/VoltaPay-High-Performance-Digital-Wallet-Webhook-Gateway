"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  RefreshCw,
  ArrowRight,
  Send,
  Download,
  Clock,
  Sparkles,
  DollarSign,
  Edit2,
  Check
} from "lucide-react";

interface DashboardClientProps {
  initialData: {
    name: string;
    availableBal: number;
    lockedBal: number;
    sentTotal: number;
    receivedTotal: number;
    depositTotal: number;
    recentActivity: any[];
    dailyVolumes: number[];
    dailyLabels: string[];
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [budget, setBudget] = useState<number>(5000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("5000");

  const totalBal = initialData.availableBal + initialData.lockedBal;
  const spentThisMonth = initialData.sentTotal; // Using total sent as proxy for monthly expense

  // Load budget from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("voltpay_monthly_budget");
      if (saved) {
        setBudget(Number(saved));
        setBudgetInput(saved);
      }
    }
  }, []);

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      localStorage.setItem("voltpay_monthly_budget", val.toString());
      setIsEditingBudget(false);
    }
  };

  // Calculate budget progress
  const budgetPercentage = Math.min((spentThisMonth / budget) * 100, 100);
  const budgetColor = 
    budgetPercentage < 50 
      ? "bg-emerald-500" 
      : budgetPercentage < 80 
        ? "bg-amber-500" 
        : "bg-rose-500";

  // Calculate dynamic SVG coordinates for the last 7 days of volumes
  const maxVol = Math.max(...initialData.dailyVolumes, 100); // minimum scale is 100
  const xCoords = [10, 90, 170, 250, 330, 410, 490];
  const chartPoints = initialData.dailyVolumes
    .map((vol, idx) => {
      const x = xCoords[idx] ?? 10;
      const y = 90 - (vol / maxVol) * 70; // Map range 0..maxVol to Y-coordinate 90..20
      return `${x},${y}`;
    })
    .join(" ");

  const chartAreaPoints = `10,95 ${chartPoints} 490,95`;

  // Calculate category breakdown percentages
  const grandTotalTx = initialData.depositTotal + initialData.sentTotal + initialData.receivedTotal;
  const depositPct = grandTotalTx > 0 ? (initialData.depositTotal / grandTotalTx) * 100 : 0;
  const sentPct = grandTotalTx > 0 ? (initialData.sentTotal / grandTotalTx) * 100 : 0;
  const receivedPct = grandTotalTx > 0 ? (initialData.receivedTotal / grandTotalTx) * 100 : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-slate-800 animate-fadeIn">
      {/* Header and Welcome */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, <span className="text-violet-600">{initialData.name}</span>
          </h1>
          <p className="text-slate-500 mt-1">Here is a snapshot of your VoltPay wallet analytics today.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/transfer" 
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all shadow-md shadow-violet-600/10 hover:shadow-lg text-xs"
          >
            <Download className="w-4 h-4" />
            Add Funds
          </Link>
          <Link 
            href="/p2p" 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-md shadow-slate-900/10 hover:shadow-lg text-xs"
          >
            <Send className="w-4 h-4" />
            Send P2P
          </Link>
        </div>
      </div>

      {/* Grid: Wallet balance cards & statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Main balance card */}
        <div className="bg-gradient-to-tr from-violet-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-violet-100 font-semibold tracking-wider text-xs uppercase">Available Wallet Balance</span>
            <Wallet className="w-6 h-6 text-violet-200" />
          </div>
          <div className="space-y-1 mb-8">
            <h2 className="text-4xl font-black">Rs. {initialData.availableBal.toLocaleString()}</h2>
            {initialData.lockedBal > 0 && (
              <p className="text-xs text-violet-200">
                + Rs. {initialData.lockedBal.toLocaleString()} Locked (Processing)
              </p>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/10 text-sm text-violet-100">
            <span>Total Account Value</span>
            <span className="font-bold">Rs. {totalBal.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Deposits Stat */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total On-Ramped</span>
              <h3 className="text-2xl font-black text-slate-800">Rs. {initialData.depositTotal.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mt-4">
            <TrendingUp className="w-4 h-4" />
            <span>Successful deposits via bank</span>
          </div>
        </div>

        {/* Total Sent Stat */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Sent (P2P)</span>
              <h3 className="text-2xl font-black text-slate-800">Rs. {initialData.sentTotal.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mt-4">
            <RefreshCw className="w-4 h-4" />
            <span>Instant peer-to-peer transfers</span>
          </div>
        </div>
      </div>

      {/* Monthly Budget Setter Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Monthly Expense Budget</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control your spending velocity</p>
          </div>
          <div className="flex items-center gap-2">
            {isEditingBudget ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value.replace(/\D/g, ""))}
                  className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-800 text-center outline-none font-bold"
                  maxLength={6}
                />
                <button
                  onClick={saveBudget}
                  className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                <Edit2 className="w-3 h-3" />
                Set Limit (Rs. {budget.toLocaleString()})
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${budgetColor}`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Spent: Rs. {spentThisMonth.toLocaleString()}</span>
            <span>Limit: Rs. {budget.toLocaleString()} ({budgetPercentage.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cashflow SVG Chart card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Cashflow Velocity</h3>
              <p className="text-xs text-slate-500">Real-time daily transaction aggregates (INR) for last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-violet-600 text-xs font-bold">
              <span className="w-2 h-2 bg-violet-600 rounded-full"></span>
              Live Volume
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="w-full h-64 relative bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100/50 p-4">
            <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="25" x2="500" y2="25" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3" />

              {/* Area under the line */}
              <polygon points={chartAreaPoints} fill="url(#chartGradient)" />

              {/* Chart line */}
              <polyline
                fill="none"
                stroke="#6d28d9"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints}
              />

              {/* Data points */}
              {xCoords.map((x, idx) => {
                const vol = initialData.dailyVolumes[idx] ?? 0;
                return (
                  <circle 
                    key={idx} 
                    cx={x} 
                    cy={90 - (vol / maxVol) * 70} 
                    r="3.5" 
                    fill="#6d28d9" 
                    stroke="#fff" 
                    strokeWidth="1.5" 
                  />
                );
              })}
            </svg>

            {/* Labels */}
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] font-bold text-slate-400">
              {initialData.dailyLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>

          {/* Categorized Bar segment */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transaction Categories</h4>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: `${depositPct}%` }} title={`Deposits: ${depositPct.toFixed(1)}%`} />
              <div className="h-full bg-indigo-500" style={{ width: `${sentPct}%` }} title={`Sent P2P: ${sentPct.toFixed(1)}%`} />
              <div className="h-full bg-teal-500" style={{ width: `${receivedPct}%` }} title={`Received P2P: ${receivedPct.toFixed(1)}%`} />
            </div>

            <div className="flex gap-4 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <span>Deposits ({depositPct.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                <span>Sent ({sentPct.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span>
                <span>Received ({receivedPct.toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Ledger Logs card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Logs</h3>
            <Link 
              href="/transactions" 
              className="text-xs font-semibold text-violet-600 hover:text-violet-500 flex items-center gap-1 group"
            >
              See Ledger
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {initialData.recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <Clock className="w-8 h-8 stroke-[1.5] mb-2" />
                <p className="text-xs">No recent ledger logs.</p>
              </div>
            ) : (
              initialData.recentActivity.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-55">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      item.type === "deposit" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                        : item.type === "p2p_sent" 
                          ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                          : "bg-teal-50 border-teal-100 text-teal-600"
                    }`}>
                      {item.type === "deposit" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : item.type === "p2p_sent" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black ${
                      item.type === "p2p_sent" ? "text-slate-700" : "text-emerald-600"
                    }`}>
                      {item.type === "p2p_sent" ? "-" : "+"} Rs. {(item.amount / 100).toLocaleString()}
                    </span>
                    <span className={`block text-[9px] font-semibold mt-0.5 ${
                      item.status === "Success" 
                        ? "text-emerald-500" 
                        : item.status === "Processing" 
                          ? "text-amber-500" 
                          : "text-rose-500"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
