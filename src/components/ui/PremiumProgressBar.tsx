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
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-white/20 bg-slate-900/40 backdrop-blur-xl shadow-2xl p-6 ${className}`}
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                   status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                   <CloudUpload className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                    {fileName || "Processing File..."}
                  </h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    {status === 'uploading' ? 'Vaulting Asset...' : 
                     status === 'processing' ? 'Encrypting & Compressing...' :
                     status === 'success' ? 'Secured in Cloud' : 
                     'Awaiting Action'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="relative h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
              />
              
              {/* Shine effect */}
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
                className="absolute top-0 left-0 h-full w-20 bg-white/20 skew-x-12 blur-sm"
              />
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              <span>AES-256 Encrypted</span>
              <motion.span
                animate={status === 'uploading' ? { opacity: [0.4, 1, 0.4] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {status === 'uploading' ? 'Active Uplink' : 'Stationary'}
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
