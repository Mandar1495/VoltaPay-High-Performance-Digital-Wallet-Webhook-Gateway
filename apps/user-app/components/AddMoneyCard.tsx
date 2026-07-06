"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Smartphone, 
  Landmark, 
  ShieldCheck, 
  Check, 
  Loader2,
  Sparkles
} from "lucide-react";
import { createOnRampTransaction } from "../app/lib/actions/createOnRamptxn";

// Popular Indian Banks with their color palettes, mock redirects, and custom SVGs
const POPULAR_BANKS = [
  {
    name: "HDFC Bank",
    code: "HDFC",
    redirectUrl: "https://netbanking.hdfcbank.com",
    activeClass: "border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-600/20",
    color: "#004c8f"
  },
  {
    name: "Axis Bank",
    code: "AXIS",
    redirectUrl: "https://www.axisbank.com/",
    activeClass: "border-rose-900 bg-rose-50/50 text-rose-900 ring-2 ring-rose-900/20",
    color: "#841439"
  },
  {
    name: "State Bank of India",
    code: "SBI",
    redirectUrl: "https://www.onlinesbi.sbi/",
    activeClass: "border-cyan-600 bg-cyan-50/50 text-cyan-900 ring-2 ring-cyan-600/20",
    color: "#00b1ec"
  },
  {
    name: "ICICI Bank",
    code: "ICICI",
    redirectUrl: "https://www.icicibank.com/",
    activeClass: "border-orange-600 bg-orange-50/50 text-orange-950 ring-2 ring-orange-600/20",
    color: "#f37021"
  },
  {
    name: "Kotak Mahindra Bank",
    code: "KOTAK",
    redirectUrl: "https://www.kotak.com/",
    activeClass: "border-red-600 bg-red-50/50 text-red-950 ring-2 ring-red-600/20",
    color: "#e61c24"
  }
];

const OTHER_BANKS = [
  { name: "Punjab National Bank", redirectUrl: "https://www.pnbnet.org.in/" },
  { name: "Bank of Baroda", redirectUrl: "https://www.bobibanking.com/" },
  { name: "Canara Bank", redirectUrl: "https://canarabank.com/" },
  { name: "Union Bank of India", redirectUrl: "https://www.unionbankonline.co.in/" },
  { name: "IndusInd Bank", redirectUrl: "https://www.indusind.com/" },
  { name: "Yes Bank", redirectUrl: "https://www.yesbank.in/" }
];

export const AddMoney = () => {
  const [activeTab, setActiveTab] = useState<"netbanking" | "card" | "upi">("netbanking");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState<(typeof POPULAR_BANKS)[number]>(POPULAR_BANKS[0]!);
  const [otherBankName, setOtherBankName] = useState("");

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // UPI Form State
  const [upiId, setUpiId] = useState("");
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000];

  const handleQuickAdd = (val: number) => {
    setAmount((prev) => prev + val);
    setErrorMessage("");
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = raw;
    if (raw.length > 2) {
      formatted = raw.slice(0, 2) + "/" + raw.slice(2, 4);
    }
    setCardExpiry(formatted.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCardCvv(raw.slice(0, 3));
  };

  const getProviderName = () => {
    if (activeTab === "netbanking") {
      if (otherBankName) return otherBankName;
      return selectedBank?.name || "HDFC Bank";
    }
    if (activeTab === "card") {
      // Determine card brand from number
      if (cardNumber.startsWith("4")) return "Visa Card";
      if (cardNumber.startsWith("5")) return "Mastercard";
      return "Credit/Debit Card";
    }
    return "UPI Transfer";
  };

  const handleAddMoney = async () => {
    if (amount <= 0) {
      setErrorMessage("Please enter an amount greater than ₹0.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const provider = getProviderName();
      const res = await createOnRampTransaction(provider, amount);

      if (res?.token) {
        // Redirect to sandbox redirect page
        window.location.href = `/bank-redirect?token=${res.token}&amount=${amount}&provider=${encodeURIComponent(provider)}`;
      } else {
        setErrorMessage(res?.message || "Failed to initiate transfer. Please try again.");
        setLoading(false);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex justify-between items-center">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Wallet Top-up
          </span>
          <h2 className="text-xl font-bold tracking-tight">Select Deposit Option</h2>
          <p className="text-violet-100 text-xs mt-0.5 font-medium">Add funds safely with direct banking links</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
          <Landmark className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Large Amount Input Container */}
      <div className="p-6 border-b border-slate-100">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
          Enter Deposit Amount
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-3xl font-black text-slate-800">₹</span>
          <input
            type="text"
            placeholder="0"
            value={amount || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setAmount(val ? parseInt(val) : 0);
              setErrorMessage("");
            }}
            className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-violet-500/50 rounded-2xl text-2xl font-black outline-none transition-all focus:ring-4 focus:ring-violet-500/5 text-slate-800"
          />
        </div>

        {/* Quick Add Chips */}
        <div className="flex gap-2.5 mt-3">
          {quickAmounts.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAdd(val)}
              className="flex-1 py-2 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-600 hover:text-violet-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              +₹{val.toLocaleString()}
            </button>
          ))}
          {amount > 0 && (
            <button
              type="button"
              onClick={() => setAmount(0)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mt-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Main Body: Tabs and Content Panels */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
        {/* Left Side: Navigation Tabs */}
        <div className="md:col-span-4 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
          <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 px-3.5 mb-2">
            Payment Options
          </span>
          <button
            onClick={() => {
              setActiveTab("netbanking");
              setOtherBankName("");
            }}
            className={`w-full py-3.5 px-4 rounded-2xl text-left font-bold text-xs flex items-center gap-3 transition-all ${
              activeTab === "netbanking"
                ? "bg-white border border-slate-200/80 shadow-md text-violet-700"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "netbanking" ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500"}`}>
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="block">Net Banking</span>
              <span className="text-[9px] text-slate-400 font-semibold">Popular banks direct link</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("card")}
            className={`w-full py-3.5 px-4 rounded-2xl text-left font-bold text-xs flex items-center gap-3 transition-all ${
              activeTab === "card"
                ? "bg-white border border-slate-200/80 shadow-md text-violet-700"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "card" ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500"}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="block">Debit / Credit Card</span>
              <span className="text-[9px] text-slate-400 font-semibold">Visa, Mastercard, RuPay</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("upi")}
            className={`w-full py-3.5 px-4 rounded-2xl text-left font-bold text-xs flex items-center gap-3 transition-all ${
              activeTab === "upi"
                ? "bg-white border border-slate-200/80 shadow-md text-violet-700"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "upi" ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500"}`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="block">UPI (Instant Deposit)</span>
              <span className="text-[9px] text-slate-400 font-semibold">GPay, PhonePe, Paytm, VPA</span>
            </div>
          </button>
        </div>

        {/* Right Side: Tab Panels */}
        <div className="md:col-span-8 p-6 flex flex-col justify-between">
          {/* NET BANKING PANEL */}
          {activeTab === "netbanking" && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Select Popular Bank</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Transfers are processed via secure encrypted bank networks</p>
              </div>

              {/* Grid of Bank Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {POPULAR_BANKS.map((bank) => {
                  const isSelected = selectedBank.code === bank.code && !otherBankName;
                  return (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => {
                        setSelectedBank(bank);
                        setOtherBankName("");
                      }}
                      className={`relative p-3 rounded-2xl border-2 text-left flex flex-col justify-between h-20 transition-all duration-200 hover:shadow-sm ${
                        isSelected 
                          ? bank.activeClass 
                          : "border-slate-100 bg-white hover:border-slate-300"
                      }`}
                    >
                      {/* Brand SVG icon simulation */}
                      <div className="flex justify-between items-start w-full">
                        {bank.code === "HDFC" && (
                          <svg viewBox="0 0 24 24" className="w-7 h-7 rounded-md" fill="currentColor">
                            <rect width="24" height="24" rx="4" fill="#004c8f" />
                            <text x="3" y="15" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">HDFC</text>
                          </svg>
                        )}
                        {bank.code === "AXIS" && (
                          <svg viewBox="0 0 24 24" className="w-7 h-7 rounded-md" fill="currentColor">
                            <rect width="24" height="24" rx="4" fill="#841439" />
                            <path d="M5 18L12 6L19 18H15L12 12.5L9 18H5Z" fill="white" />
                          </svg>
                        )}
                        {bank.code === "SBI" && (
                          <svg viewBox="0 0 24 24" className="w-7 h-7 rounded-md" fill="currentColor">
                            <rect width="24" height="24" rx="4" fill="#00b1ec" />
                            <circle cx="12" cy="11" r="5" fill="none" stroke="white" strokeWidth="2" />
                            <line x1="12" y1="13.5" x2="12" y2="18.5" stroke="white" strokeWidth="2.5" />
                          </svg>
                        )}
                        {bank.code === "ICICI" && (
                          <svg viewBox="0 0 24 24" className="w-7 h-7 rounded-md" fill="currentColor">
                            <rect width="24" height="24" rx="4" fill="#f37021" />
                            <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="1.5" />
                            <text x="9" y="16" fill="white" fontSize="11" fontWeight="black" fontFamily="sans-serif">i</text>
                          </svg>
                        )}
                        {bank.code === "KOTAK" && (
                          <svg viewBox="0 0 24 24" className="w-7 h-7 rounded-md" fill="currentColor">
                            <rect width="24" height="24" rx="4" fill="#e61c24" />
                            <text x="4" y="15" fill="white" fontSize="10" fontWeight="black" fontFamily="sans-serif">k</text>
                            <path d="M15 5H17V17H15V12L11 17H9L14 10.5L10 5H12L15 9.5V5Z" fill="white" />
                          </svg>
                        )}
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="block font-bold text-slate-800 text-[10px] truncate mt-1">
                        {bank.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Other Banks Dropdown */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Or select another bank</label>
                <select
                  value={otherBankName}
                  onChange={(e) => {
                    setOtherBankName(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl focus:border-violet-500/50 block p-3 outline-none focus:ring-4 focus:ring-violet-500/5"
                >
                  <option value="">-- Choose from other popular banks --</option>
                  {OTHER_BANKS.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* CARD PANEL */}
          {activeTab === "card" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Credit or Debit Card</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Enter card details to securely proceed with addition</p>
              </div>

              {/* High-Fidelity Credit Card Mockup */}
              <div 
                className="relative h-40 w-full rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 flex flex-col justify-between shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
              >
                {/* Chip & Logo background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                {!isCardFlipped ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300/40 relative overflow-hidden flex flex-col justify-between p-1">
                        <div className="grid grid-cols-3 gap-0.5 opacity-40 h-full w-full">
                          <div className="bg-slate-950/40 rounded-sm"></div>
                          <div className="bg-slate-950/40 rounded-sm"></div>
                          <div className="bg-slate-950/40 rounded-sm"></div>
                        </div>
                      </div>
                      <span className="text-xs italic font-black text-indigo-200 tracking-wider">VoltPay Platinum</span>
                    </div>

                    <div className="text-lg font-mono tracking-[0.2em] font-semibold text-slate-100 text-center my-1 select-all">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-indigo-300">Card Holder</span>
                        <span className="font-medium tracking-wide uppercase truncate max-w-[150px] block">
                          {cardHolder || "Your Name"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] uppercase font-bold text-indigo-300">Expiry</span>
                        <span className="font-mono font-medium">{cardExpiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col justify-between py-2">
                    <div className="h-8 bg-slate-950 -mx-5"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex-1 bg-white/20 h-8 rounded px-3 flex items-center text-slate-300 text-[10px] font-mono">
                        Signature Panel - Non Transferable
                      </div>
                      <div className="bg-amber-400 text-slate-950 px-2 py-1.5 rounded font-mono font-black text-xs ml-3">
                        {cardCvv || "•••"}
                      </div>
                    </div>
                    <span className="text-[7px] text-center text-slate-400 mt-2">Click to flip card and view front</span>
                  </div>
                )}
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsCardFlipped(false)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 text-slate-800"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.replace(/[^A-Za-z ]/g, ""))}
                    onFocus={() => setIsCardFlipped(false)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 text-slate-800"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Expiry (MM/YY)"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    onFocus={() => setIsCardFlipped(false)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 text-slate-800 text-center"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={handleCvvChange}
                    onFocus={() => setIsCardFlipped(true)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 text-slate-800 text-center"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI PANEL */}
          {activeTab === "upi" && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Unified Payments Interface</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Deposit using any UPI application or your Virtual Address</p>
              </div>

              {/* Popular UPI Apps Shortcuts */}
              <div className="flex gap-4 items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Popular Apps</span>
                <div className="flex gap-3">
                  {/* Custom icons representing Google Pay, PhonePe, Paytm */}
                  <button
                    type="button"
                    onClick={() => {
                      setUpiId("wallet@okaxis");
                      setIsUpiVerified(true);
                    }}
                    className="p-2 bg-white border border-slate-200 hover:border-violet-300 rounded-xl text-[10px] font-bold text-blue-600 transition-colors shadow-sm"
                  >
                    GPay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUpiId("wallet@ybl");
                      setIsUpiVerified(true);
                    }}
                    className="p-2 bg-white border border-slate-200 hover:border-violet-300 rounded-xl text-[10px] font-bold text-purple-600 transition-colors shadow-sm"
                  >
                    PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUpiId("wallet@paytm");
                      setIsUpiVerified(true);
                    }}
                    className="p-2 bg-white border border-slate-200 hover:border-violet-300 rounded-xl text-[10px] font-bold text-cyan-600 transition-colors shadow-sm"
                  >
                    Paytm
                  </button>
                </div>
              </div>

              {/* UPI ID input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">Enter UPI ID / VPA</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. username@upi"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setIsUpiVerified(false);
                    }}
                    className="w-full pl-3 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setIsUpiVerified(true)}
                    className={`absolute right-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      isUpiVerified 
                        ? "bg-emerald-500 text-white" 
                        : "bg-violet-600 text-white hover:bg-violet-700"
                    }`}
                  >
                    {isUpiVerified ? "Verified" : "Verify ID"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CHECKOUT SUMMARY FOOTER CARD */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-4">
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600 font-semibold">
              <div className="flex justify-between items-center">
                <span>Payment Destination</span>
                <span className="text-slate-900 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  VoltPay Wallet
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Transaction Convenience Fee</span>
                <span className="text-emerald-600 font-black">₹0.00 (FREE)</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-200/50 pt-2 text-slate-800">
                <span className="font-extrabold">Total Pay Amount</span>
                <span className="text-base font-black text-violet-700">₹{amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Pay Securely Button */}
            <button
              onClick={handleAddMoney}
              disabled={loading || amount <= 0}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Proceed to Securely Add ₹{amount.toLocaleString()}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>SSL 256-bit Encrypted Transaction. Powered by PCI-DSS.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};