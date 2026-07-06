"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, Phone, AlertCircle, Eye, EyeOff, User, Sparkles } from "lucide-react";

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const getErrorMessage = () => {
    if (error === "CredentialsSignin") {
      return "Invalid phone number or password. Please check credentials and try again.";
    }
    if (error) {
      return "An authentication error occurred. Please try again.";
    }
    return localError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setLocalError("Please fill in all fields.");
      return;
    }
    if (phone.length < 10) {
      setLocalError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setLocalError("Please enter your name to register your wallet.");
      return;
    }

    setLocalError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        phone,
        password,
        action: mode,
        name: mode === "signup" ? name : undefined,
        redirect: false,
      });

      if (res?.error) {
        // If the credentials signIn failed, display error message
        if (res.error.includes("user already exists")) {
          setLocalError("An account with this number already exists. Please Sign In.");
        } else if (res.error.includes("No account found")) {
          setLocalError("No wallet found with this number. Please Sign Up to get started!");
        } else {
          setLocalError(res.error || "Authentication failed. Please verify credentials.");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setLocalError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing border effect */}
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-violet-500/10 to-transparent rotate-45 pointer-events-none animate-pulse"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 mb-4">
            <span className="text-xl font-black tracking-wider">V</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === "signin" ? "Welcome back to VoltPay" : "Create VoltPay Wallet"}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {mode === "signin" 
              ? "Access your dashboard, P2P transfers, and rewards" 
              : "Register your account instantly and receive a ₹500 starter balance!"}
          </p>
        </div>

        {getErrorMessage() && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{getErrorMessage()}</span>
          </div>
        )}

        {mode === "signup" && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] font-semibold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Bonus: New signups receive ₹500 starter wallet balance!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
          {mode === "signup" && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="10 digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                maxLength={10}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-violet-500/20 text-sm font-medium"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* mode switcher link block */}
        <div className="mt-6 text-center text-xs text-slate-400 relative z-10">
          {mode === "signin" ? (
            <span>
              Don't have a wallet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setLocalError("");
                }}
                className="text-violet-400 hover:text-violet-300 font-bold transition-colors underline underline-offset-4"
              >
                Sign Up Now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setLocalError("");
                }}
                className="text-violet-400 hover:text-violet-300 font-bold transition-colors underline underline-offset-4"
              >
                Sign In Instead
              </button>
            </span>
          )}
        </div>

        <div className="mt-8 text-center relative z-10 text-[10px] text-slate-500 border-t border-white/5 pt-4">
          Secure, direct wallet transactions powered by VoltPay Core.
        </div>
      </div>
    </div>
  );
}

export default function Signin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4 text-white">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin text-violet-500"></div>
      </div>
    }>
      <SigninContent />
    </Suspense>
  );
}
