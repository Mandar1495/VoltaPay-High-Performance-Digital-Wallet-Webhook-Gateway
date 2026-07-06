"use client";

import { useState, useEffect } from "react";
import { X, Delete, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { hasMPin, setMPin } from "../app/lib/actions/mpin";

interface MPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  actionText?: string;
}

export function MPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Enter Transaction MPIN",
  actionText = "Confirm Transaction",
}: MPinModalProps) {
  const [pin, setPin] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<"enter" | "confirm">("enter");
  const [setupPin, setSetupPin] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check if the user needs to set up an MPIN
  useEffect(() => {
    if (isOpen) {
      setError("");
      setPin("");
      setSetupPin("");
      setSetupStep("enter");
      setChecking(true);
      hasMPin()
        .then((res) => {
          setIsSetup(!res.hasPin);
          setChecking(false);
        })
        .catch(() => {
          setChecking(false);
        });
    }
  }, [isOpen]);

  const handleKeyPress = (num: string) => {
    setError("");
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setError("");
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN.");
      return;
    }

    if (isSetup) {
      if (setupStep === "enter") {
        setSetupPin(pin);
        setPin("");
        setSetupStep("confirm");
      } else {
        // Confirm step
        if (pin !== setupPin) {
          setError("PINs do not match. Start over.");
          setPin("");
          setSetupPin("");
          setSetupStep("enter");
          return;
        }

        setSubmitting(true);
        try {
          const res = await setMPin(pin);
          if (res.success) {
            setSuccessMsg("MPIN created successfully!");
            setTimeout(() => {
              setIsSetup(false);
              setSuccessMsg("");
              setPin("");
              setSubmitting(false);
            }, 1500);
          } else {
            setError(res.error || "Failed to set MPIN.");
            setSubmitting(false);
          }
        } catch (err) {
          setError("Failed to set MPIN. Please try again.");
          setSubmitting(false);
        }
      }
    } else {
      // Direct verification callback
      onSuccess(pin);
    }
  };

  // Submit automatically when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">VoltPay Secure</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {checking ? (
          <div className="h-72 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
            <p className="text-xs">Securing session...</p>
          </div>
        ) : (
          <div className="text-center">
            {/* Instruction Title */}
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {isSetup
                ? setupStep === "enter"
                  ? "Set 4-Digit MPIN"
                  : "Confirm 4-Digit MPIN"
                : title}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {isSetup
                ? setupStep === "enter"
                  ? "Create a PIN to secure your transfers"
                  : "Enter the PIN again to verify"
                : "Required to authorize this transfer"}
            </p>

            {/* Error / Success Display */}
            {error && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 animate-shake">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Pin dots */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    index < pin.length
                      ? "bg-violet-600 border-violet-600 scale-110 shadow-md shadow-violet-600/30"
                      : "border-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mb-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  disabled={submitting}
                  className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 text-slate-800 text-xl font-bold transition-all focus:outline-none flex items-center justify-center disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-16 h-16 text-slate-400 hover:text-slate-600 text-xs font-semibold focus:outline-none flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                disabled={submitting}
                className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 text-slate-800 text-xl font-bold transition-all focus:outline-none flex items-center justify-center disabled:opacity-50"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                disabled={submitting}
                className="w-16 h-16 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center active:scale-95 transition-transform"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400">
              Your MPIN is securely encrypted and never stored in plain text.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
