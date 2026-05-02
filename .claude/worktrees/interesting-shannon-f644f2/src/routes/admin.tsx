import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LogOut,
  ChevronRight,
  Menu, X,
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

// ─── constants ────────────────────────────────────────────────────────────────

const ADMIN_KEY = "admin_session_v1";
const CORRECT_PW = import.meta.env.VITE_ADMIN_PASSWORD || "admin2024";

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

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === CORRECT_PW) { sessionStorage.setItem(ADMIN_KEY, "1"); onLogin(); }
    else setErr("Incorrect password.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Logo className="h-14 w-auto brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Dashboard</h1>
          <p className="text-white/60 text-sm text-center mb-8">Enter your password to continue</p>
          <form onSubmit={submit} className="space-y-4">
            <input
              type="password" value={pw} autoFocus
              onChange={e => { setPw(e.target.value); setErr(""); }}
              placeholder="Password"
              className="w-full h-12 rounded-xl bg-white/10 border border-white/20 px-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition"
            />
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition shadow-lg">
              Sign in
            </button>
          </form>
          <p className="text-white/30 text-xs text-center mt-6">Set VITE_ADMIN_PASSWORD in .env to change password</p>
        </div>
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
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_KEY) === "1") setAuthed(true);
  }, []);

  function logout() { sessionStorage.removeItem(ADMIN_KEY); setAuthed(false); }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Logo className="h-9 w-auto brightness-0 invert" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="px-5 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Management</p>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {tab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-white/10 pt-3">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">{NAV.find(n => n.id === tab)?.label}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">ChanAidRecovery Admin</p>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {tab === "overview" && <OverviewTab setTab={setTab} />}
          {tab === "leads" && <LeadsTab />}
          {tab === "loans" && <LoansTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "site" && <SiteEditorTab />}
        </main>
      </div>
    </div>
  );
}
