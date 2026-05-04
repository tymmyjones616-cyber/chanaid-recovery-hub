import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getSupabaseBrowser } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2, Mail, Lock, User, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, Fingerprint, Zap, Globe, KeyRound
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpType, setOtpType] = useState<"signup" | "email">("email");
  const [otpCode, setOtpCode] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) {
      setStep("credentials");
      setOtpCode("");
      setPassword("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = getSupabaseBrowser();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: "user",
            },
          },
        });
        if (error) throw error;
        toast.success("We sent a 6-digit code to your email. Enter it to finish signup.");
        setOtpType("signup");
        setStep("otp");
      } else {
        const { error: pwErr } = await supabase.auth.signInWithPassword({ email, password });
        if (pwErr) throw pwErr;
        await supabase.auth.signOut();
        const { error: otpErr } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        if (otpErr) throw otpErr;
        toast.success("We sent a 6-digit code to your email. Enter it to sign in.");
        setOtpType("email");
        setStep("otp");
      }
    } catch (error: any) {
      if (error.status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        toast.error(error.message || "An error occurred during authentication");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) { toast.error("Enter the 6-digit code from your email"); return; }
    setIsLoading(true);
    const supabase = getSupabaseBrowser();
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: otpType,
      });
      if (error) throw error;
      toast.success(otpType === "signup" ? "Email verified — you're signed in!" : "Verified — signed in!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    const supabase = getSupabaseBrowser();
    try {
      if (otpType === "signup") {
        const { error } = await supabase.auth.resend({ type: "signup", email });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        if (error) throw error;
      }
      toast.success("New code sent — check your inbox");
    } catch (error: any) {
      toast.error(error.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-visible border-none bg-transparent shadow-none">
        <div className="relative flex flex-col lg:flex-row w-full min-h-[600px] perspective-2000">
          
          {/* Left Side: 3D Visual Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotateY: 20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            className="hidden lg:flex flex-1 bg-slate-950 rounded-l-[3rem] p-12 flex-col justify-between relative overflow-hidden border-y border-l border-white/10"
            style={{
              transform: `rotateX(${-mousePos.y * 0.2}deg) rotateY(${mousePos.x * 0.2}deg)`,
              transformStyle: "preserve-3d"
            }}
          >
            {/* 3D Floating Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-[15%] w-32 h-32 bg-primary/20 blur-[60px] rounded-full"
              />
              <motion.div 
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -10, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full"
              />
            </div>

            <div className="relative z-10" style={{ transform: "translateZ(50px)" }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <span className="text-white font-black tracking-widest uppercase text-xs">ChanAid Secure</span>
              </div>

              <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
                Start Your <br />
                <span className="text-gradient">Recovery</span> <br />
                Journey.
              </h2>
              <p className="text-white/40 text-lg max-w-xs font-medium">
                The world's most trusted platform for high-value asset retrieval and blockchain forensics.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4" style={{ transform: "translateZ(30px)" }}>
              {[
                { icon: Zap, label: "Instant Case Review" },
                { icon: Globe, label: "Global Legal Support" },
                { icon: Fingerprint, label: "AI Forensic Analysis" },
                { icon: Sparkles, label: "98% Success Rate" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                  <item.icon className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Auth Form Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-white lg:rounded-r-[3rem] rounded-[3rem] lg:rounded-l-none p-8 lg:p-16 flex flex-col relative overflow-hidden border border-slate-100"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Fingerprint className="w-64 h-64" />
            </div>

            <div className="relative z-10 mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {step === "otp"
                  ? "Verify Your Email"
                  : mode === "signin" ? "Welcome Back" : "Create Account"}
              </h3>
              <p className="text-slate-400 font-bold text-sm">
                {step === "otp"
                  ? `Enter the 6-digit code we sent to ${email}.`
                  : mode === "signin"
                    ? "Sign in to manage your recovery cases."
                    : "Begin your forensic audit in minutes."}
              </p>
            </div>

            {step === "otp" ? (
              <form onSubmit={handleVerifyOtp} className="relative z-10 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      placeholder="123456"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/50 outline-none transition-all text-lg font-mono font-bold tracking-[0.5em] shadow-sm"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Verify & Continue</>}
                </button>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <button type="button" onClick={() => { setStep("credentials"); setOtpCode(""); }} className="text-slate-500 hover:text-slate-900">
                    ← Use different email
                  </button>
                  <button type="button" disabled={resending} onClick={handleResendOtp} className="text-primary hover:underline disabled:opacity-50">
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                </div>
              </form>
            ) : (
            <motion.form
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              onSubmit={handleSubmit} 
              className="relative z-10 space-y-5"
            >
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <div className="group relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text" required
                          placeholder="John Doe"
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/50 outline-none transition-all text-sm font-bold shadow-sm"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="group relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email" required
                      placeholder="name@example.com"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/50 outline-none transition-all text-sm font-bold shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  {mode === "signin" && (
                    <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot Password?</button>
                  )}
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password" required
                      placeholder="••••••••"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/50 outline-none transition-all text-sm font-bold shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-8 overflow-hidden relative"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">{mode === "signin" ? "Access Dashboard" : "Start My Recovery"}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                    <motion.div 
                      className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"
                      initial={false}
                      whileTap={{ scale: 0.95 }}
                    />
                  </>
                )}
              </motion.button>
            </motion.form>
            )}

            {step === "credentials" && (
            <div className="mt-auto pt-10 text-center">
              <p className="text-xs text-slate-500 font-bold">
                {mode === "signin" ? "New to ChanAidRecovery?" : "Existing forensic member?"}
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="ml-2 text-primary font-black hover:underline underline-offset-4"
                >
                  {mode === "signin" ? "Create Secure Account" : "Sign in here"}
                </button>
              </p>
            </div>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
