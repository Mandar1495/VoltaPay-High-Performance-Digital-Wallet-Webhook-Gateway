"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Copy, Check, Camera, QrCode, FileImage } from "lucide-react";

interface QRClientProps {
  name: string;
  number: string;
}

export function QRClient({ name, number }: QRClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"show" | "scan">("show");
  const [copied, setCopied] = useState(false);
  const [scanError, setScanError] = useState("");
  
  // Reference for scanner element
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Generate Payment Link
  const [origin, setOrigin] = useState("http://localhost:3000");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const paymentLink = `${origin}/p2p?phone=${number}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Initialize and clean up camera scanner
  useEffect(() => {
    if (activeTab === "scan") {
      setScanError("");
      
      const onScanSuccess = (decodedText: string) => {
        // Stop scanner before redirecting
        try {
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        } catch (err) {
          console.error("Failed to clear scanner", err);
        }

        // Check if text is a URL containing phone parameter or just a 10-digit number
        try {
          const url = new URL(decodedText);
          const phone = url.searchParams.get("phone");
          if (phone) {
            router.push(`/p2p?phone=${phone}`);
          } else {
            router.push(`/p2p?phone=${decodedText}`);
          }
        } catch (e) {
          // If not a URL, check if it looks like a phone number
          const digits = decodedText.replace(/\D/g, "");
          if (digits.length === 10) {
            router.push(`/p2p?phone=${digits}`);
          } else {
            setScanError(`Scanned content is not a valid VoltPay link: ${decodedText}`);
          }
        }
      };

      const onScanFailure = (error: any) => {
        // Silent failure for matching frames, but log errors if critical
      };

      // Delay start slightly to allow element to render in DOM
      const timer = setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            "qr-reader-element",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true
            },
            /* verbose= */ false
          );
          
          scanner.render(onScanSuccess, onScanFailure);
          scannerRef.current = scanner;
        } catch (err: any) {
          setScanError("Failed to initialize scanner. Make sure camera access is allowed.");
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (err) {
            console.error("Cleanup scan clear error", err);
          }
        }
      };
    }
  }, [activeTab, router]);

  return (
    <div className="max-w-md mx-auto">
      {/* Tabs Menu */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
        <button
          onClick={() => setActiveTab("show")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "show"
              ? "bg-white text-slate-900 shadow-md shadow-slate-200/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <QrCode className="w-4 h-4" />
          My QR Code
        </button>
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "scan"
              ? "bg-white text-slate-900 shadow-md shadow-slate-200/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Camera className="w-4 h-4" />
          Scan QR Code
        </button>
      </div>

      {activeTab === "show" ? (
        /* Show QR tab */
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-scaleIn">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">{name}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Phone: {number}</p>
          </div>

          {/* QR Code Container */}
          <div className="inline-block p-5 bg-slate-55 rounded-3xl border border-slate-100/50 shadow-inner">
            <QRCodeSVG
              value={paymentLink}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#1e293b"} // slate-800
              level={"H"}
              includeMargin={true}
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>

          <p className="text-[10px] text-slate-400 font-medium px-4">
            Show this QR to any VoltPay user. Scanning it will redirect them to send money to you instantly.
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex-1 text-left bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] text-slate-500 font-mono truncate select-all">
              {paymentLink}
            </div>
            <button
              onClick={handleCopy}
              className={`p-3 rounded-xl border transition-all ${
                copied
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
              }`}
              title="Copy payment link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        /* Scan QR Code Tab */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6 animate-scaleIn">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800">Scan & Pay</h3>
            <p className="text-xs text-slate-400">Position the QR code within the frame to scan</p>
          </div>

          {scanError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 font-medium flex items-start gap-2">
              <Camera className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{scanError}</span>
            </div>
          )}

          {/* html5-qrcode scan window */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 relative min-h-[300px]">
            <div id="qr-reader-element" className="w-full"></div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-semibold">
            Supported formats: standard VoltPay QR links and raw contact phone numbers.
          </div>
        </div>
      )}
    </div>
  );
}
