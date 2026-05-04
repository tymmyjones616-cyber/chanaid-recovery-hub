import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getSupabaseBrowser } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2, Mail, Lock, User, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, Fingerprint, Zap, Globe, KeyRound, Eye, EyeOff
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) {
      setStep("credentials");
      setOtpCode("");
      setPassword("");
      setShowPassword(false);
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

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) toast.error(error.message || `${provider} sign-in failed`);
  };

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
            data: { full_name: fullName, role: "user" },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
        setStep("credentials");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully.");
        onClose();
      }
    } catch (error: any) {
      if (error.status === 429) {
        toast.error("Too many requests. Please wait a few minutes.");
      } else {
        toast.error(error.message || "Authentication error");
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
      const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "signup" });
      if (error) throw error;
      toast.success("Email verified — you're signed in!");
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
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      toast.success("New code sent — check your inbox");
    } catch (error: any) {
      toast.error(error.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email above first, then click Forgot Password");
      return;
    }
    const supabase = getSupabaseBrowser();
    try {
      const redirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset`
        : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast.success("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Could not send reset email");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-visible border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </DialogTitle>

        <div className="relative flex flex-col lg:flex-row w-full min-h-[600px] perspective-2000">

          {/* Left Side: 3D Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: 20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            className="hidden lg:flex flex-1 rounded-l-[3rem] p-12 flex-col justify-between relative overflow-hidden border-y border-l border-white/10"
            style={{
              background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
              transform: `rotateX(${-mousePos.y * 0.15}deg) rotateY(${mousePos.x * 0.15}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Animated orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ y: [0, -24, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[10%] w-48 h-48 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }}
              />
              <motion.div
                animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-[15%] right-[5%] w-56 h-56 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)" }}
              />
              <motion.div
                animate={{ x: [0, 15, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute top-[55%] left-[30%] w-32 h-32 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)" }}
              />
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "40px 40px"
                }}
              />
            </div>

            <div className="relative z-10" style={{ transform: "translateZ(50px)" }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(59,130,246,0.4))", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" }}>
                  <ShieldCheck className="w-6 h-6 text-violet-300" />
                </div>
                <span className="text-white font-black tracking-widest uppercase text-xs">ChanAid Secure</span>
              </div>

              <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
                Start Your <br />
                <span style={{ background: "linear-gradient(90deg, #a78bfa, #60a5fa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Recovery
                </span> <br />
                Journey.
              </h2>
              <p className="text-white/40 text-base max-w-xs font-medium leading-relaxed">
                The world's most trusted platform for high-value asset retrieval and blockchain forensics.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3" style={{ transform: "translateZ(30px)" }}>
              {[
                { icon: Zap, label: "Instant Case Review" },
                { icon: Globe, label: "Global Legal Support" },
                { icon: Fingerprint, label: "AI Forensic Analysis" },
                { icon: Sparkles, label: "98% Success Rate" }
              ].map((item, i) => (
                <div key={i}
                  className="flex items-center gap-3 p-3 rounded-2xl backdrop-blur-sm transition-colors hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <item.icon className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-white lg:rounded-r-[3rem] rounded-[3rem] lg:rounded-l-none p-8 lg:p-12 flex flex-col relative overflow-hidden border border-slate-100"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.025] pointer-events-none select-none">
              <Fingerprint className="w-64 h-64" />
            </div>

            <div className="relative z-10 mb-8 text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {step === "otp" ? "Verify Your Email" : mode === "signin" ? "Welcome Back" : "Create Account"}
              </h3>
              <p className="text-slate-400 font-semibold text-sm">
                {step === "otp"
                  ? `Enter the 6-digit code we sent to ${email}.`
                  : mode === "signin"
                    ? "Sign in to manage your recovery cases."
                    : "Begin your forensic audit in minutes."}
              </p>
            </div>

            {/* OAuth Providers */}
            {step === "credentials" && (
              <div className="relative z-10 mb-5">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-700 py-3.5 px-4 shadow-sm text-sm"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("github")}
                    className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-700 py-3.5 px-4 shadow-sm text-sm"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">or with email</span>
                  </div>
                </div>
              </div>
            )}

            {step === "otp" ? (
              <form onSubmit={handleVerifyOtp} className="relative z-10 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text" inputMode="numeric" autoComplete="one-time-code"
                      pattern="[0-9]*" maxLength={6} required placeholder="123456"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-violet-400 outline-none transition-all text-lg font-mono font-bold tracking-[0.5em] shadow-sm"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      autoFocus
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading || otpCode.length < 6}
                  className="w-full h-14 text-white font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Verify & Continue</>}
                </button>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <button type="button" onClick={() => { setStep("credentials"); setOtpCode(""); }} className="text-slate-500 hover:text-slate-900">
                    ← Use different email
                  </button>
                  <button type="button" disabled={resending} onClick={handleResendOtp} className="text-violet-600 hover:underline disabled:opacity-50">
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                </div>
              </form>
            ) : (
              <motion.form
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                onSubmit={handleSubmit}
                className="relative z-10 space-y-4"
              >
                <AnimatePresence mode="wait">
                  {mode === "signup" && (
                    <motion.div
                      variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" required placeholder="John Doe"
                          className="w-full h-13 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-violet-400 outline-none transition-all text-sm font-semibold shadow-sm py-3.5"
                          value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" required placeholder="name@example.com"
                      className="w-full h-13 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-violet-400 outline-none transition-all text-sm font-semibold shadow-sm py-3.5"
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }} className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                    {mode === "signin" && (
                      <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-violet-600 hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"} required placeholder="••••••••"
                      className="w-full h-13 pl-12 pr-12 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-violet-400 outline-none transition-all text-sm font-semibold shadow-sm py-3.5"
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  type="submit" disabled={isLoading}
                  className="w-full h-14 text-white font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-4 overflow-hidden relative"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">{mode === "signin" ? "Access Dashboard" : "Start My Recovery"}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {step === "credentials" && (
              <div className="mt-auto pt-8 text-center">
                <p className="text-xs text-slate-500 font-semibold">
                  {mode === "signin" ? "New to ChanAidRecovery?" : "Existing member?"}
                  <button
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="ml-2 text-violet-600 font-black hover:underline underline-offset-4"
                  >
                    {mode === "signin" ? "Create Account" : "Sign in here"}
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
