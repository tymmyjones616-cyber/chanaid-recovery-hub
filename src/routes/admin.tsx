import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LogOut,
  ChevronRight,
  Menu, X,
  ShieldAlert,
  Loader2,
  Lock,
  Mail
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Tab } from "@/types/admin";
import {
  OverviewTab,
  LeadsTab,
  LoansTab,
  TestimonialsTab,
  SiteEditorTab
} from "@/components/admin/AdminTabs";
import {
  LayoutDashboard,
  Users,
  Banknote,
  MessageSquare,
  Settings
} from "lucide-react";
import { useAuth } from "@/components/layout/AuthContext";
import { Reveal } from "@/components/effects/Reveal";
import { getSupabaseBrowser } from "@/lib/supabase";
import { toast } from "sonner";

// ─── route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin")({
  head: () => ({ 
    meta: [
      { title: "Admin Dashboard | ChanAidRecovery" }, 
      { name: "description", content: "Management dashboard for ChanAidRecovery leads, loans, and testimonials." },
      { property: "og:title", content: "Admin Dashboard | ChanAidRecovery" },
      { property: "og:description", content: "Secure administration area for managing recovery cases and site settings." },
      { name: "robots", content: "noindex, nofollow" }
    ] 
  }),
  component: AdminPage,
});

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = getSupabaseBrowser();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      
      if (error) throw error;

      // Check if user is admin
      const role = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
      if (role !== "admin") {
        await supabase.auth.signOut();
        toast.error("Access denied: You do not have administrative privileges.");
        return;
      }

      toast.success("Welcome, Administrator.");
      // Set super admin fallback cookie
      document.cookie = `chanaid_super_admin=${pw}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } catch (error: any) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
          <div className="flex justify-center mb-10">
            <img src="/admin-logo.png" alt="Admin Logo" className="h-20 w-auto" />
          </div>
          
          <div className="space-y-2 text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-2">
              <ShieldAlert className="w-3 h-3" /> Secure Entry
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tight">Admin <span className="text-primary">Portal</span></h1>
            <p className="text-white/40 text-xs font-medium">Restricted access area. Authorized personnel only.</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@chanaidrecovery.com"
                  className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Secret Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password" value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={busy} 
              className="w-full h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              {busy ? "Authenticating..." : "Establish Secure Session"}
            </button>
          </form>
          
          <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-center gap-6">
             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-white/20">
               <div className="w-1 h-1 rounded-full bg-emerald-500"></div> System Active
             </div>
             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-white/20">
               <div className="w-1 h-1 rounded-full bg-emerald-500"></div> DB Connected
             </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-white/20 text-[10px] font-medium uppercase tracking-[0.2em]">
          Powered by ChanAidRecovery Core Security
        </p>
      </div>
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
  { id: "leads" as Tab, label: "Leads", icon: Users },
  { id: "loans" as Tab, label: "Loans", icon: Banknote },
  { id: "testimonials" as Tab, label: "Testimonials", icon: MessageSquare },
  { id: "site" as Tab, label: "Site Editor", icon: Settings },
];

// ─── Main admin page ──────────────────────────────────────────────────────────

function AdminPage() {
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white/30 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Validating Administrative Credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
          <img src="/admin-logo.png" alt="Admin Logo" className="h-12 w-auto" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="px-6 pt-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Recovery Operations</p>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                tab === id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {tab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="px-6 py-6 border-t border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                 <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                 <div className="text-xs font-black text-white truncate">{user.user_metadata?.full_name || 'Admin User'}</div>
                 <div className="text-[10px] font-bold text-white/30 truncate">{user.email}</div>
              </div>
           </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 sm:px-10 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Control Panel</div>
              <h1 className="font-black text-slate-900 tracking-tight italic text-xl">
                {NAV.find(n => n.id === tab)?.label}
                <span className="ml-2 text-[8px] font-mono text-slate-300 not-italic uppercase tracking-widest">v1.2.0-secure</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end">
                <div className="text-[9px] font-black uppercase tracking-tighter text-slate-400">System Status</div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-slate-700">Operational</span>
                </div>
             </div>
             <div className="h-8 w-px bg-slate-100"></div>
             <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-slate-400" />
             </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
          <Reveal direction="up">
            {tab === "overview" && <OverviewTab setTab={setTab} />}
            {tab === "leads" && <LeadsTab />}
            {tab === "loans" && <LoansTab />}
            {tab === "testimonials" && <TestimonialsTab />}
            {tab === "site" && <SiteEditorTab />}
          </Reveal>
        </main>
      </div>
    </div>
  );
}
