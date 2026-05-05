import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CloudUpload, Loader2 } from "lucide-react";

interface PremiumProgressBarProps {
  progress: number;
  status: "idle" | "uploading" | "processing" | "success" | "error";
  fileName?: string;
  className?: string;
}

export function PremiumProgressBar({ progress, status, fileName, className = "" }: PremiumProgressBarProps) {
  const isVisible = status !== "idle";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className={`relative w-full overflow-hidden rounded-xl border border-white/20 bg-slate-900/90 backdrop-blur-xl shadow-lg p-3.5 ${className}`}
        >
          {/* Background gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none rounded-xl" />

          <div className="relative z-10 space-y-2.5">
            {/* Header row: icon + name + percent */}
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg shrink-0 ${status === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                {status === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : status === "processing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate leading-tight">
                    {fileName || "Processing File..."}
                  </h4>
                  <span className="text-sm font-black text-white shrink-0 tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                  {status === "uploading"
                    ? "Vaulting Asset..."
                    : status === "processing"
                    ? "Encrypting & Securing..."
                    : status === "success"
                    ? "Secured in Cloud"
                    : "Awaiting Action"}
                </p>
              </div>
            </div>

            {/* Progress track */}
            <div className="relative h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
              {/* Shine sweep */}
              <motion.div
                animate={{ x: ["-100%", "300%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute top-0 left-0 h-full w-10 bg-white/25 skew-x-12 blur-sm"
              />
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-[0.15em]">
              <span>AES-256 Encrypted</span>
              <motion.span
                animate={status === "uploading" ? { opacity: [0.4, 1, 0.4] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {status === "uploading" ? "Active Uplink" : "Stationary"}
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
