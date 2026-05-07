import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthContext";
import { SiteShell } from "@/components/layout/SiteShell";
import { useEffect, useState } from "react";
import { fetchUserLoans, getLoanAssetUrl, userDeleteLoan, userUpdateProfile, userDeleteAccount } from "@/lib/queries";
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Lock,
  AlertCircle, 
  AlertTriangle,
  CreditCard, 
  Banknote, 
  Wallet, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  FileText,
  BadgeCheck,
  Calendar,
  ChevronRight,
  User as UserIcon,
  LogOut,
  Settings,
  RefreshCw,
  Mail,
  Trash2
} from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase";

export const Route = createFileRoute("/_site/dashboard")({
  component: UserDashboard,
});

function UserDashboard() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "under_review" | "rejected">("all");

  const verifiedCount = loans.filter(l => l.status === 'verified').length;
  const ongoingCount = loans.filter(l => l.status === 'pending' || l.status === 'under_review' || l.status === 'needs_correction').length;
  const filteredLoans = statusFilter === "all"
    ? loans
    : statusFilter === "under_review"
      ? loans.filter(l => l.status === 'pending' || l.status === 'under_review' || l.status === 'needs_correction')
      : loans.filter(l => l.status === statusFilter);

  const identityVerified = loans.some(l => l.identityVerified) || !!user?.email_confirmed_at;
  const biometricLinked = loans.some(l => l.videoSelfieUrl || l.selfieImage);
  const securityTier = 1 + (identityVerified ? 1 : 0) + (biometricLinked ? 1 : 0) + (twoFactorEnabled ? 1 : 0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadLoans();
      refreshTwoFactor();
      const timer = setInterval(loadLoans, 10000);
      return () => clearInterval(timer);
    }
  }, [user]);

  async function refreshTwoFactor() {
    try {
      const { data } = await getSupabaseBrowser().auth.mfa.listFactors();
      const verifiedTotp = (data?.totp ?? []).some((f: any) => f.status === "verified");
      setTwoFactorEnabled(verifiedTotp);
    } catch {
      // listFactors fails silently if user has no factors yet
    }
  }

  async function loadLoans() {
    if (!user) return;
    try {
      // Pass the whole user object; the server-side extraction in fetchUserLoans 
      // is now ultra-robust and will find the correct email.
      const data = await fetchUserLoans({ data: user });
      setLoans(data);
    } catch (error) {
      console.error("[Dashboard] Failed to load loans:", error);
      toast.error("Synchronization delay. Retrying...");
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteLoan(id: string) {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;
    try {
      const res = await userDeleteLoan(id);
      if (res && "success" in res && !res.success) throw new Error((res as any).error || "Failed to delete");
      setLoans(prev => prev.filter(l => l.id !== id));
      toast.success("Application deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete application");
    }
  }

  if (authLoading || loading) {
    return (
    <>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Secure Session...</p>
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      <div className="bg-slate-50 min-h-screen pb-20">
        {/* Header Section */}
        <div className="bg-slate-900 text-white pt-16 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <Reveal direction="up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Secure Command Center</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight italic">
                    Welcome back, <span className="text-primary">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'}</span>
                  </h1>
                  <p className="mt-2 text-slate-400 font-medium">Manage your active applications and track your recovery progress.</p>
                </Reveal>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => signOut()}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-bold text-white/80"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
                <Link 
                  to="/loans"
                  className="px-8 py-3 rounded-2xl bg-primary text-white font-black transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  New Application <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Communication Tip */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group mt-12">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Mail className="w-12 h-12" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Email Updates
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium mb-3">
                  Our system sends real-time updates for each stage of your application.
                </p>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                   <p className="text-[10px] text-slate-400 font-bold leading-tight">
                     <span className="text-white">Pro Tip:</span> Check your <span className="text-white underline decoration-primary underline-offset-2">Spam or Promotions</span> folder and add us to your contacts to ensure priority delivery.
                   </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <StatCard
                label="Active Applications"
                value={loans.length}
                icon={<FileText className="w-4 h-4" />}
                onClick={() => setStatusFilter("all")}
                active={statusFilter === "all"}
              />
              <StatCard
                label="Verified Status"
                value={verifiedCount}
                icon={<BadgeCheck className="w-4 h-4 text-emerald-400" />}
                color="emerald"
                onClick={() => setStatusFilter("verified")}
                active={statusFilter === "verified"}
              />
              <StatCard
                label="Ongoing Status"
                value={ongoingCount}
                icon={<Clock className="w-4 h-4 text-amber-400" />}
                color="amber"
                onClick={() => setStatusFilter("under_review")}
                active={statusFilter === "under_review"}
              />
              <StatCard
                label="Security Tier"
                value={`Level ${securityTier}`}
                icon={<ShieldCheck className="w-4 h-4 text-primary" />}
                onClick={() => setIsSecurityModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Application List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
                  Your Loan Applications
                  {statusFilter !== "all" && (
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-2 text-[10px] font-bold text-primary normal-case tracking-normal hover:underline"
                    >
                      (filtered: {statusFilter === "under_review" ? "ongoing" : statusFilter.replace('_', ' ')} · clear)
                    </button>
                  )}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                  {filteredLoans.length} Records Found
                </span>
              </div>


              {/* Verified Success Banner */}
              {verifiedCount > 0 && (
                <Reveal direction="down">
                  <div className="bg-emerald-500 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group mb-8">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <BadgeCheck className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Verification Success</span>
                      </div>
                      <h3 className="text-2xl font-black italic tracking-tight mb-2">Congratulations! Your Identity is Verified.</h3>
                      <p className="text-emerald-50 text-sm font-medium leading-relaxed max-w-xl">
                        Your application has been approved by our compliance team. We are now initializing the recovery settlement process. Please monitor your email for the final transfer instructions.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                         <Link 
                           to="/contact"
                           className="px-6 py-2.5 rounded-xl bg-white text-emerald-600 font-bold text-xs hover:shadow-lg transition-all"
                         >
                           Speak with Officer
                         </Link>
                         <div className="px-4 py-2.5 rounded-xl bg-emerald-600/50 border border-emerald-400/30 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                           Settlement Active
                         </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Priority Alerts */}
              {loans
                .filter(l => l.status === 'needs_correction' || l.status === 'rejected')
                .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
                .slice(0, 1) // Show only the most recent priority update
                .map(loan => (
                  <PriorityAlert key={loan.id} loan={loan} />
                ))}

              {filteredLoans.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-slate-300" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">No Applications Yet</h4>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
                    You haven't submitted any loan applications yet. Start your recovery journey by completing your first application.
                  </p>
                  <Link 
                    to="/loans"
                    className="inline-flex items-center gap-2 bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                  >
                    Start Application <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLoans.map((loan, i) => (
                    <Reveal key={loan.id} delay={i * 100} direction="up">
                      <LoanCard loan={loan} onDelete={() => onDeleteLoan(loan.id)} />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-slate-900 tracking-tight italic">Account Security</h3>
                </div>
                
                <div className="space-y-4">
                  <SecurityItem
                    label="Identity Verification"
                    status={identityVerified ? "Verified" : "Pending"}
                    completed={identityVerified}
                  />
                  <SecurityItem
                    label="Biometric Link"
                    status={biometricLinked ? "Active" : "Incomplete"}
                    completed={biometricLinked}
                  />
                  <SecurityItem
                    label="2FA Protection"
                    status={twoFactorEnabled ? "Enabled" : "Disabled"}
                    completed={twoFactorEnabled}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => setIsSecurityModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> Security Settings
                  </button>
                </div>
              </div>

              <div className="bg-cta-gradient rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-black mb-2 italic">Priority Assistance</h3>
                <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
                  Our recovery specialists are available 24/7 to assist with your claims. Need help with a specific application?
                </p>
                <Link 
                  to="/contact"
                  className="flex items-center justify-center gap-2 bg-white text-primary font-black py-3 rounded-xl text-xs hover:shadow-lg transition-all"
                >
                  Contact Support <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SecuritySettingsModal 
        isOpen={isSecurityModalOpen} 
        onClose={() => setIsSecurityModalOpen(false)}
        twoFactorEnabled={twoFactorEnabled}
        onToggle2FA={() => {
          setTwoFactorEnabled(!twoFactorEnabled);
          toast.success(twoFactorEnabled ? "2FA Disabled" : "2FA Protection Enabled Successfully");
        }}
        user={user}
        loans={loans}
      />
    </>
  );
}


function PriorityAlert({ loan }: { loan: any }) {
  if (loan.status === 'rejected' || loan.status === 'needs_correction') {
    return (
      <div className="bg-white rounded-[2rem] border-2 border-red-100 p-8 text-center shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-red-600">
           <AlertTriangle className="w-20 h-20" />
        </div>
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-inner mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Review Alert</h2>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-red-800 font-bold mb-2 uppercase tracking-widest text-[10px]">Correction Required</p>
          <p className="text-sm text-red-700 leading-relaxed font-medium">
            {loan.rejectionReason || "Our team was unable to verify your identity with the provided documents. Please ensure images are clear and valid."}
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/loans"
            className="inline-flex items-center gap-2 text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-0.5"
          >
            Update Documentation & Retry <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }
  return null;
}

function StatCard({ label, value, icon, color = "primary", onClick, active }: { label: string, value: string | number, icon: React.ReactNode, color?: string, onClick?: () => void, active?: boolean }) {
  const Tag: any = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`text-left w-full bg-white/5 backdrop-blur-md border rounded-2xl p-5 transition-all group ${
        active ? "border-primary/60 bg-white/10 shadow-lg shadow-primary/10" : "border-white/10 hover:bg-white/10"
      } ${onClick ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
        <div className="p-1.5 rounded-lg bg-white/5 text-white/60 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black tabular-nums text-white">{value}</div>
    </Tag>
  );
}

function SecurityItem({ label, status, completed }: { label: string, status: string, completed: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg ${
        completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
      }`}>
        {status}
      </span>
    </div>
  );
}

function LoanCard({ loan, onDelete }: { loan: any, onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: any = {
    pending: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", icon: <Clock className="w-4 h-4" />, label: "Pending Review" },
    under_review: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: <RefreshCw className="w-4 h-4" />, label: "Under Review" },
    verified: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: <CheckCircle2 className="w-4 h-4" />, label: "Verified & Approved" },
    rejected: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", icon: <XCircle className="w-4 h-4" />, label: "Action Required" },
    needs_correction: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", icon: <AlertCircle className="w-4 h-4" />, label: "Needs Correction" },
  };

  const currentStatus = statusColors[loan.status] || statusColors.pending;

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${currentStatus.bg} ${currentStatus.text} flex items-center justify-center shadow-sm`}>
            {loan.payoutMethod === 'crypto' ? <Wallet className="w-6 h-6" /> : 
             loan.payoutMethod === 'card' ? <CreditCard className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-slate-900 tracking-tight">
                {loan.currency} {Number(loan.amountRequested).toLocaleString()}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} flex items-center gap-1`}>
                {loan.status === 'verified' && <BadgeCheck className="w-3 h-3" />}
                {currentStatus.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>#{loan.id.slice(0, 8)}</span>
              <div className="w-1 h-1 rounded-full bg-slate-200"></div>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(loan.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            className="px-4 py-2 rounded-xl bg-slate-50 text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            {expanded ? "Hide Details" : "View Details"}
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
          
          {(loan.status === 'pending' || loan.status === 'rejected' || loan.status === 'needs_correction') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
              title="Delete Application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-50 rounded-full overflow-hidden mb-6">
        <div 
          className={`absolute inset-y-0 left-0 transition-all duration-1000 ${
            loan.status === 'verified' ? 'w-full bg-emerald-500' : 
            loan.status === 'rejected' ? 'w-1/3 bg-red-500' :
            loan.status === 'under_review' ? 'w-2/3 bg-blue-500' : 'w-[15%] bg-amber-500'
          }`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
        <DetailItem label="Payout Method" value={loan.payoutMethod.replace('_', ' ')} />
        <DetailItem label="Identity" value={loan.identityVerified ? "Verified" : "Pending"} />
        <DetailItem label="Submission" value="Complete" />
        <DetailItem label="Next Step" value={loan.status === 'verified' ? "Fund Release" : "Officer Review"} />
      </div>

      {expanded && <LoanDetailsPanel loan={loan} />}
    </div>
  );
}

function maskTail(value: string | null | undefined, visible = 4): string {
  if (!value) return "—";
  const v = String(value).replace(/\s+/g, "");
  if (v.length <= visible) return v;
  return "•".repeat(Math.max(0, v.length - visible)) + v.slice(-visible);
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function fmtMoney(amount: any, currency?: string): string {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  if (isNaN(n)) return String(amount);
  return `${currency ?? ""} ${n.toLocaleString()}`.trim();
}

function LoanDetailsPanel({ loan }: { loan: any }) {
  const fullAddress = [
    loan.addressLine1,
    loan.addressLine2,
    [loan.city, loan.stateRegion, loan.postalCode].filter(Boolean).join(", "),
    loan.country,
  ].filter(Boolean).join(" • ") || "—";

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <Section title="Personal Information">
        <DetailItem label="Full Name" value={[loan.firstName, loan.lastName].filter(Boolean).join(" ") || "—"} />
        <DetailItem label="Date of Birth" value={loan.dateOfBirth ?? "—"} />
        <DetailItem label="SSN" value={maskTail(loan.ssn, 4)} />
        <DetailItem label="EIN" value={maskTail(loan.ein, 4)} />
        <DetailItem label="Employment" value={loan.employmentStatus ?? "—"} />
        <DetailItem label="Monthly Income" value={fmtMoney(loan.monthlyIncome, loan.currency)} />
        <DetailItem label="Email" value={loan.email ?? "—"} />
        <DetailItem label="Phone" value={loan.phone ?? "—"} />
        <div className="col-span-2 sm:col-span-4">
          <DetailItem label="Address" value={fullAddress} />
        </div>
      </Section>

      <Section title="Loan Request">
        <DetailItem label="Amount" value={fmtMoney(loan.amountRequested, loan.currency)} />
        <DetailItem label="Term (months)" value={loan.loanTermMonths ?? "—"} />
        <DetailItem label="Payout Method" value={(loan.payoutMethod ?? "").replace("_", " ") || "—"} />
        <DetailItem label="Source" value={loan.sourcePage ?? "—"} />
        <div className="col-span-2 sm:col-span-4">
          <DetailItem label="Purpose" value={loan.loanPurpose ?? "—"} />
        </div>
      </Section>

      {loan.payoutMethod === "bank_transfer" && (
        <Section title="Bank Details">
          <DetailItem label="Bank" value={loan.bankName ?? "—"} />
          <DetailItem label="Account Holder" value={loan.accountHolderName ?? "—"} />
          <DetailItem label="Account #" value={maskTail(loan.bankAccountNumber, 4)} />
          <DetailItem label="Routing #" value={maskTail(loan.bankRoutingNumber, 4)} />
        </Section>
      )}

      {loan.payoutMethod === "card" && (
        <Section title="Card Details">
          <DetailItem label="Issuer" value={loan.cardIssuer ?? "—"} />
          <DetailItem label="Cardholder" value={loan.cardHolderName ?? "—"} />
          <DetailItem label="Card #" value={maskTail(loan.cardNumber, 4)} />
          <DetailItem label="Expiry" value={loan.cardExpiry ?? "—"} />
        </Section>
      )}

      {loan.payoutMethod === "crypto" && (
        <Section title="Crypto Wallet">
          <DetailItem label="Wallet Type" value={loan.cryptoWalletType ?? "—"} />
          <div className="col-span-2 sm:col-span-3">
            <DetailItem label="Wallet Address" value={loan.cryptoWalletAddress ?? "—"} />
          </div>
        </Section>
      )}

      <Section title="Verification Timeline">
        <DetailItem label="Submitted" value={fmtDate(loan.submittedAt ?? loan.createdAt)} />
        <DetailItem label="Reviewed" value={fmtDate(loan.reviewedAt)} />
        <DetailItem label="Verified" value={fmtDate(loan.verifiedAt)} />
        <DetailItem label="Status" value={(loan.status ?? "—").replace("_", " ")} />
        {loan.rejectionReason && (
          <div className="col-span-2 sm:col-span-4">
            <DetailItem label="Rejection Reason" value={loan.rejectionReason} />
          </div>
        )}
        {loan.notes && (
          <div className="col-span-2 sm:col-span-4">
            <DetailItem label="Officer Notes" value={loan.notes} />
          </div>
        )}
      </Section>

      <BiometricGallery loan={loan} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

function BiometricGallery({ loan }: { loan: any }) {
  const items: { label: string; src: string | null | undefined }[] = [
    { label: "Selfie", src: loan.selfieImage },
    { label: "ID Front", src: loan.idFrontImage },
    { label: "ID Back", src: loan.idBackImage },
    { label: "Passport Front", src: loan.passportFrontImage },
    { label: "Passport Back", src: loan.passportBackImage },
    { label: "Video Selfie", src: loan.videoSelfieUrl },
  ];
  const present = items.filter(i => !!i.src);
  if (present.length === 0) return null;

  return (
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Biometric Evidence</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {present.map(item => (
          <BiometricThumb key={item.label} label={item.label} src={item.src as string} />
        ))}
      </div>
    </div>
  );
}

function BiometricThumb({ label, src }: { label: string; src: string }) {
  const [resolved, setResolved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reveal() {
    if (resolved || loading) return;
    setLoading(true);
    setError(null);
    try {
      if (src.startsWith("data:") || src.startsWith("http")) {
        setResolved(src);
      } else {
        const url = await getLoanAssetUrl({ data: src });
        if (!url) throw new Error("No URL returned");
        setResolved(url);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={reveal}
      className="text-left p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
          Submitted
        </span>
      </div>
      {resolved ? (
        /\.(mp4|webm|mov)(\?|$)/i.test(resolved) ? (
          <video src={resolved} controls className="w-full h-32 object-cover rounded-lg bg-black" />
        ) : (
          <img src={resolved} alt={label} className="w-full h-32 object-cover rounded-lg" />
        )
      ) : (
        <div className="w-full h-32 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
          {loading ? "Loading…" : error ? error : "Tap to preview"}
        </div>
      )}
    </button>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">{label}</div>
      <div className="text-[11px] font-bold text-slate-700 capitalize">{value}</div>
    </div>
  );
}



function DialogWrapper({ children }: { children: React.ReactNode }) {
  // Empty wrapper to avoid compile error if it was used in code above
  return <>{children}</>;
}

function SecuritySettingsModal({
  isOpen, onClose, twoFactorEnabled, onToggle2FA, user, loans
}: {
  isOpen: boolean, onClose: () => void, twoFactorEnabled: boolean, onToggle2FA: () => void, user: any, loans: any[]
}) {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || user?.phone || "");
  const [ssn, setSsn] = useState(user?.user_metadata?.ssn || "");
  const [ein, setEin] = useState(user?.user_metadata?.ein || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  
  // Also try to find SSN/EIN from existing loans if not in metadata
  useEffect(() => {
    if (!ssn || !ein) {
      const latestLoan = loans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (latestLoan) {
        if (!ssn && latestLoan.ssn) setSsn(latestLoan.ssn);
        if (!ein && latestLoan.ein) setEin(latestLoan.ein);
      }
    }
  }, [loans]);

  if (!isOpen) return null;

  const kycCompleted = loans.some(l => l.status === 'verified');

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = getSupabaseBrowser();
      const updates: any = { data: { full_name: fullName, phone, ssn, ein } };
      if (email !== user?.email) updates.email = email;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      toast.success("Profile updated successfully!");
      if (email !== user?.email) {
        toast.info("A confirmation link was sent to your new email address.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-100 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-6 sm:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Account Settings</span>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <XCircle className="w-5 h-5 text-white" />
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight italic text-white">Vault <span className="text-primary">Settings</span></h2>
            <p className="text-slate-400 font-medium mt-1 text-sm">Update your profile and security preferences.</p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-7">

          {/* ── Profile Edit ── */}
          <form onSubmit={saveProfile} className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Information</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">SSN *</label>
                  <input
                    type="text"
                    value={ssn}
                    onChange={e => setSsn(e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">EIN *</label>
                  <input
                    type="text"
                    value={ein}
                    onChange={e => setEin(e.target.value)}
                    placeholder="XX-XXXXXXX"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
                />
                {email !== user?.email && (
                  <p className="mt-1.5 text-[10px] text-amber-600 font-semibold">
                    ⚠ A confirmation link will be sent to verify your new email.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-11 rounded-xl bg-cta-gradient text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><ArrowRight className="w-4 h-4" /> Save Profile</>}
            </button>
          </form>

          <hr className="border-slate-100" />

          {/* ── Identity & Access ── */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity & Access</h4>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kycCompleted ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">KYC Verification</div>
                  <div className="text-[10px] font-medium text-slate-500">Identity document validation</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg ${kycCompleted ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                  {kycCompleted ? "Verified" : "Required"}
                </span>
                {!kycCompleted && (
                  <Link to="/loans" onClick={onClose} className="text-[10px] font-bold text-primary hover:underline">Complete Now</Link>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${twoFactorEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">2FA Protection</div>
                  <div className="text-[10px] font-medium text-slate-500">Two-factor authentication</div>
                </div>
              </div>
              <button
                onClick={onToggle2FA}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${twoFactorEnabled ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* ── Session Info ── */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">User ID</div>
                <div className="text-[10px] font-mono font-bold text-slate-700 truncate">{user?.id}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Login</div>
                <div className="text-[11px] font-bold text-slate-700">{new Date(user?.last_sign_in_at || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Close Settings
          </button>

          <div className="pt-4 border-t border-red-50">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Danger Zone</h4>
            <button
              onClick={async () => {
                if (!confirm("CRITICAL: Are you sure you want to PERMANENTLY CLOSE your account and delete ALL recovery applications? This cannot be undone.")) return;
                try {
                  const res = await userDeleteAccount(user.id);
                  if (res && "success" in res && !res.success) throw new Error((res as any).error || "Failed to close account");
                  toast.success("Account closed. Signing out...");
                  window.location.href = "/";
                } catch (err: any) {
                  toast.error(err.message || "Failed to close account");
                }
              }}
              className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Permanently Close Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
