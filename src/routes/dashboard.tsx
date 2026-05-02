import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthContext";
import { SiteShell } from "@/components/layout/SiteShell";
import { useEffect, useState } from "react";
import { fetchUserLoans, getLoanAssetUrl } from "@/lib/queries";
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Banknote, 
  Wallet, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  FileText,
  BadgeCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  User as UserIcon,
  LogOut,
  Settings
} from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: UserDashboard,
});

function UserDashboard() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadLoans();
    }
  }, [user]);

  async function loadLoans() {
    try {
      const data = await fetchUserLoans({ data: user!.id });
      setLoans(data);
    } catch (error) {
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <SiteShell>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Secure Session...</p>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
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
                    Welcome back, <span className="text-primary">{user?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</span>
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

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <StatCard 
                label="Active Applications" 
                value={loans.length} 
                icon={<FileText className="w-4 h-4" />} 
              />
              <StatCard 
                label="Verified Status" 
                value={loans.filter(l => l.status === 'verified').length} 
                icon={<BadgeCheck className="w-4 h-4 text-emerald-400" />} 
                color="emerald"
              />
              <StatCard 
                label="Under Review" 
                value={loans.filter(l => l.status === 'pending' || l.status === 'under_review').length} 
                icon={<Clock className="w-4 h-4 text-amber-400" />} 
                color="amber"
              />
              <StatCard 
                label="Security Tier" 
                value="Level 3" 
                icon={<ShieldCheck className="w-4 h-4 text-primary" />} 
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
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Your Loan Applications</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                  {loans.length} Records Found
                </span>
              </div>

              {loans.length === 0 ? (
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
                  {loans.map((loan, i) => (
                    <Reveal key={loan.id} delay={i * 100} direction="up">
                      <LoanCard loan={loan} />
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
                    status={user?.email_confirmed_at ? "Verified" : "Pending"} 
                    completed={!!user?.email_confirmed_at}
                  />
                  <SecurityItem 
                    label="Biometric Link" 
                    status={loans.some(l => l.status === 'verified') ? "Active" : "Incomplete"} 
                    completed={loans.some(l => l.status === 'verified')}
                  />
                  <SecurityItem 
                    label="2FA Protection" 
                    status="Disabled" 
                    completed={false}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" /> Security Settings
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
    </SiteShell>
  );
}

function StatCard({ label, value, icon, color = "primary" }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
        <div className={`p-1.5 rounded-lg bg-white/5 text-white/60 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black tabular-nums">{value}</div>
    </div>
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

function LoanCard({ loan }: { loan: any }) {
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
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
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
           <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
             View Details <ChevronRight className="w-3 h-3" />
           </button>
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
    </div>
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

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function DialogWrapper({ children }: { children: React.ReactNode }) {
  // Empty wrapper to avoid compile error if it was used in code above
  return <>{children}</>;
}
