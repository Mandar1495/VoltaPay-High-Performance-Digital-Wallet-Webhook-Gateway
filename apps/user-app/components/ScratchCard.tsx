"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Trophy, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { scratchCardAction } from "../app/lib/actions/rewards";

interface ScratchCardProps {
  rewardId: number;
  amount: number; // in paise
  onComplete?: () => void;
  onClose: () => void;
}

export function ScratchCard({ rewardId, amount, onComplete, onClose }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");
  const isDrawingRef = useRef(false);

  const amountInRs = amount / 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on container
    const width = 280;
    const height = 280;
    canvas.width = width;
    canvas.height = height;

    // Fill background with elegant dark gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#7c3aed"); // violet-600
    gradient.addColorStop(0.5, "#6366f1"); // indigo-500
    gradient.addColorStop(1, "#4f46e5"); // indigo-600
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw overlay patterns (Fintech style)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 4;
    for (let i = -100; i < width + 100; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 100, height);
      ctx.stroke();
    }

    // Add text on the scratch card
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VoltPay Cash Reward", width / 2, height / 2 - 20);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "medium 12px sans-serif";
    ctx.fillText("Scratch to reveal cashback", width / 2, height / 2 + 15);
  }, []);

  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleStart = (e: MouseEvent | TouchEvent) => {
    if (isScratched || claiming || claimed) return;
    isDrawingRef.current = true;
    handleScratch(e);
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
    checkScratchPercentage();
  };

  const handleScratch = (e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current || isScratched || claiming || claimed) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getMousePos(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkScratchPercentage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || isScratched) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let clearedPixels = 0;

    // Check transparency in alpha channel
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) {
        clearedPixels++;
      }
    }

    const percentage = (clearedPixels / (width * height)) * 100;

    // Scratch finished at 45% cleared
    if (percentage > 45) {
      setIsScratched(true);
      setClaiming(true);

      // Secure claim in DB via Server Action
      try {
        const res = await scratchCardAction(rewardId);
        if (res.success) {
          setClaimed(true);
          
          // Boom! Trigger fireworks confetti!
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#7c3aed", "#6366f1", "#fbbf24", "#34d399"],
          });

          if (onComplete) onComplete();
        } else {
          setError(res.error || "Failed to claim reward.");
        }
      } catch (err: any) {
        setError("Failed to claim reward.");
      } finally {
        setClaiming(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col items-center max-w-sm w-full px-4">
        {/* Confetti container & outer card wrapper */}
        <div
          ref={containerRef}
          className="relative w-[280px] h-[280px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6"
        >
          {/* Back layer: Revealed reward */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-amber-950/30 to-amber-900/50 p-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center mb-4 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Cashback Earned
            </span>
            <h2 className="text-4xl font-black text-white mt-2">
              Rs. {amountInRs.toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-400 mt-2">
              Deposited instantly to your VoltPay Wallet
            </p>

            {claiming && (
              <div className="mt-4 flex items-center gap-2 text-xs text-violet-400 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                Claiming cashback...
              </div>
            )}

            {error && (
              <p className="mt-3 text-xs text-rose-500 font-bold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                {error}
              </p>
            )}

            {claimed && (
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 text-xs transition-all"
              >
                Awesome!
              </button>
            )}
          </div>

          {/* Front layer: Scratch Canvas */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 cursor-crosshair z-10 rounded-3xl touch-none transition-opacity duration-300 ${
              isScratched && claimed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            onMouseDown={(e) => handleStart(e.nativeEvent)}
            onMouseMove={(e) => handleScratch(e.nativeEvent)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.nativeEvent)}
            onTouchMove={(e) => handleScratch(e.nativeEvent)}
            onTouchEnd={handleEnd}
          />
        </div>

        {!isScratched && (
          <p className="text-sm text-slate-400 font-semibold mt-6 animate-pulse">
            Use your mouse or finger to scratch!
          </p>
        )}
      </div>
    </div>
  );
}
