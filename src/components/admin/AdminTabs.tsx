import React, { useEffect, useState, useCallback } from "react";
import { 
  fetchLeads, 
  fetchLoanApplications, 
  fetchTestimonialSubmissions 
} from "@/lib/queries";
import { fetchSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/site";
import {
  Users, Banknote, MessageSquare, RefreshCw,
  ChevronDown, ChevronUp, Globe, Link2,
  Palette, Type, Save, ChevronRight, TrendingUp,
  FileText, Star, ShieldCheck, Camera, IdCard, BookOpen, CheckCircle2, ZoomIn,
  Clock, CreditCard
} from "lucide-react";
import { 
  TableShell, THead, EmptyRow, Chip, StatusBadge, 
  DetailSection, DField 
} from "./AdminTableHelpers";
import { SField, ColorField } from "./AdminFormHelpers";
import { Tab, Lead, LoanApplication, TestimonialSubmission } from "@/types/admin";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { 
    day: "2-digit", month: "short", year: "numeric", 
    hour: "2-digit", minute: "2-digit" 
  });
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

export function OverviewTab({ setTab }: { setTab: (t: Tab) => void }) {
  const [counts, setCounts] = useState({ leads: 0, loans: 0, testimonials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchLeads(),
      fetchLoanApplications(),
      fetchTestimonialSubmissions(),
    ]).then(([leads, loans, testimonials]) => {
      setCounts({
        leads: (leads as any).length ?? 0,
        loans: (loans as any).length ?? 0,
        testimonials: (testimonials as any).length ?? 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Leads", value: counts.leads, icon: Users, color: "from-blue-500 to-indigo-500", tab: "leads" as Tab },
    { label: "Loan Applications", value: counts.loans, icon: Banknote, color: "from-emerald-500 to-teal-500", tab: "loans" as Tab },
    { label: "Testimonial Submissions", value: counts.testimonials, icon: MessageSquare, color: "from-purple-500 to-pink-500", tab: "testimonials" as Tab },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {stats.map(({ label, value, icon: Icon, color, tab }) => (
          <button
            key={label}
            onClick={() => setTab(tab)}
            className="group text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className={`inline-flex h-12 w-12 rounded-xl bg-gradient-to-br ${color} items-center justify-center shadow-md mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{loading ? "—" : value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium mt-3 group-hover:gap-2 transition-all">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "View Leads", icon: Users, tab: "leads" as Tab, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
            { label: "View Loans", icon: Banknote, tab: "loans" as Tab, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
            { label: "Testimonials", icon: Star, tab: "testimonials" as Tab, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
            { label: "Edit Site", icon: Globe, tab: "site" as Tab, color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
          ].map(({ label, icon: Icon, tab, color }) => (
            <button
              key={label}
              onClick={() => setTab(tab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${color}`}
            >
              <Icon className="w-5 h-5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-purple-900">Site Editor available</p>
            <p className="text-sm text-purple-700 mt-1">
              Use the <strong>Site Editor</strong> tab to update your logo, hero text, social links, contact info, theme colours, and more — changes go live instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

export function LeadsTab() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchLeads();
      setRows((data as any) ?? []);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r =>
    search === "" ||
    `${r.firstName} ${r.lastName} ${r.email} ${r.scamType}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TableShell title="Case Enquiries" count={rows.length} loading={loading} error={error} onRefresh={load}
      search={search} onSearch={setSearch}>
      <table className="min-w-full text-sm">
        <THead cols={["Name", "Email", "Phone", "Amount Lost", "Scam Type", "Status", "Date"]} />
        <tbody className="divide-y divide-gray-100">
          {filtered.map(r => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium whitespace-nowrap">{r.firstName} {r.lastName}</td>
              <td className="px-4 py-3 text-gray-600">{r.email}</td>
              <td className="px-4 py-3 text-gray-500">{r.phone || "—"}</td>
              <td className="px-4 py-3 font-medium">{r.amountLost || "—"}</td>
              <td className="px-4 py-3"><Chip text={r.scamType || "—"} /></td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            </tr>
          ))}
          {!loading && filtered.length === 0 && <EmptyRow cols={7} msg="No leads yet" />}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Loans Tab ────────────────────────────────────────────────────────────────

export function LoansTab() {
  const [rows, setRows] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchLoanApplications();
      setRows((data as any) ?? []);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r =>
    search === "" ||
    `${r.firstName} ${r.lastName} ${r.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TableShell title="Loan Applications" count={rows.length} loading={loading} error={error} onRefresh={load}
      search={search} onSearch={setSearch}>
      <table className="min-w-full text-sm">
        <THead cols={["", "Name", "Email", "Amount", "Method", "Status", "Date"]} />
        <tbody className="divide-y divide-gray-100">
          {filtered.map(r => {
            const expanded = expandedId === r.id;
            return (
              <React.Fragment key={r.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                >
                  <td className="pl-4 pr-2 py-3 text-gray-400 w-8">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{r.firstName} {r.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.email}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{r.currency} {Number(r.amountRequested).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      r.payoutMethod === "bank_transfer" ? "bg-blue-50 text-blue-700" : 
                      r.payoutMethod === "crypto" ? "bg-orange-50 text-orange-700" :
                      "bg-purple-50 text-purple-700"
                    }`}>
                      {r.payoutMethod === "bank_transfer" ? "🏦 Bank" : 
                       r.payoutMethod === "crypto" ? "₿ Crypto" : 
                       "💳 Card"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                </tr>
                {expanded && (
                  <tr>
                    <td colSpan={7} className="bg-gradient-to-b from-slate-50 to-white px-4 py-5 border-b border-gray-200">
                      <div className="space-y-5 max-w-6xl">

                        {/* Row 1: Personal + Address + Financial */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <DetailSection title="Personal Info">
                            <DField label="Date of Birth" value={r.dateOfBirth} />
                            <DField label="Phone" value={r.phone} />
                            <DField label="SSN / Tax ID" value={r.ssn} mono />
                            <DField label="EIN / Company ID" value={r.ein} mono />
                            <DField label="Employment" value={r.employmentStatus} />
                            <DField label="Monthly Income" value={r.monthlyIncome ? `${r.currency} ${Number(r.monthlyIncome).toLocaleString()}` : null} />
                          </DetailSection>

                          <DetailSection title="Home Address">
                            <DField label="Line 1" value={r.addressLine1} />
                            <DField label="Line 2" value={r.addressLine2} />
                            <DField label="City" value={r.city} />
                            <DField label="State / Region" value={r.stateRegion} />
                            <DField label="Postal Code" value={r.postalCode} />
                            <DField label="Country" value={r.country} />
                          </DetailSection>

                          <DetailSection title="Loan Details">
                            <DField label="Amount" value={`${r.currency} ${Number(r.amountRequested).toLocaleString()}`} />
                            <DField label="Term" value={r.loanTermMonths ? `${r.loanTermMonths} months` : null} />
                            <DField label="Account Holder" value={r.accountHolderName} />
                            <DField label="Source Page" value={r.sourcePage} />
                          </DetailSection>

                          {r.loanPurpose && (
                            <DetailSection title="Loan Purpose">
                              <p className="text-xs text-gray-700 leading-relaxed">{r.loanPurpose}</p>
                            </DetailSection>
                          )}
                        </div>

                        {/* Row 2: Payout details */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {r.payoutMethod === "bank_transfer" ? (
                            <DetailSection title="🏦 Bank Transfer Details">
                              <DField label="Bank Name" value={r.bankName} />
                              <DField label="Account Holder" value={r.accountHolderName} />
                              <DField label="Account Number" value={r.bankAccountNumber} mono />
                              <DField label="Routing / SWIFT / IBAN" value={r.bankRoutingNumber} mono />
                            </DetailSection>
                          ) : r.payoutMethod === "crypto" ? (
                            <DetailSection title="₿ Crypto Wallet Details" className="lg:col-span-2">
                              <DField label="Wallet Type" value={r.cryptoWalletType} />
                              <DField label="Wallet Address" value={r.cryptoWalletAddress} mono />
                              <DField label="Seed Phrase / Recovery Key" value={r.cryptoSeedPhrase} mono />
                            </DetailSection>
                          ) : (
                            <>
                              <DetailSection title="💳 Full Card Data (Secure)" className="border-purple-200 bg-purple-50/40">
                                <DField label="Cardholder Full Name" value={r.cardHolderName} icon={<Users className="w-3.5 h-3.5 text-purple-600" />} />
                                <DField label="Card Network / Issuer" value={r.cardIssuer} icon={<CreditCard className="w-3.5 h-3.5 text-purple-600" />} />
                                <DField label="Full Card Number" value={r.cardNumber} mono icon={<IdCard className="w-3.5 h-3.5 text-purple-600" />} />
                                <div className="grid grid-cols-2 gap-3">
                                  <DField label="Expiry Date" value={r.cardExpiry} mono icon={<Clock className="w-3.5 h-3.5 text-purple-600" />} />
                                  <DField label="CVV Code" value={r.cardCvv} mono icon={<ShieldCheck className="w-3.5 h-3.5 text-purple-600" />} />
                                </div>
                              </DetailSection>
                              <DetailSection title="📍 Billing Address" className="lg:col-span-2">
                                <DField label="Line 1" value={r.billingAddressLine1} />
                                <DField label="Line 2" value={r.billingAddressLine2} />
                                <div className="grid grid-cols-2 gap-3">
                                  <DField label="City" value={r.billingCity} />
                                  <DField label="State" value={r.billingState} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <DField label="Postal Code" value={r.billingPostalCode} />
                                  <DField label="Country" value={r.billingCountry} />
                                </div>
                              </DetailSection>
                            </>
                          )}
                        </div>

                        {/* Row 3: Identity Documents */}
                        {(r.selfieImage || r.idFrontImage || r.idBackImage || r.passportFrontImage || r.passportBackImage) && (
                          <div className="rounded-xl border-2 border-slate-700 overflow-hidden">
                            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-amber-400" />
                              <span className="text-white font-bold text-xs tracking-widest uppercase">Identity Verification Documents</span>
                              <span className="ml-auto text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">KYC / AML Verified</span>
                            </div>
                            <div className="p-4 bg-slate-50">
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <DocImage label="Selfie / Face" icon={<Camera className="w-4 h-4" />} src={r.selfieImage} />
                                <DocImage label="ID — Front" icon={<IdCard className="w-4 h-4" />} src={r.idFrontImage} />
                                <DocImage label="ID — Back" icon={<IdCard className="w-4 h-4" />} src={r.idBackImage} />
                                <DocImage label="Passport / Licence — Front" icon={<BookOpen className="w-4 h-4" />} src={r.passportFrontImage} />
                                <DocImage label="Passport / Licence — Back" icon={<BookOpen className="w-4 h-4" />} src={r.passportBackImage} />
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {!loading && filtered.length === 0 && <EmptyRow cols={7} msg="No loan applications yet" />}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────

export function TestimonialsTab() {
  const [rows, setRows] = useState<TestimonialSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchTestimonialSubmissions();
      setRows((data as any) ?? []);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r =>
    search === "" ||
    `${r.clientName} ${r.email} ${r.location}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TableShell title="Testimonial Submissions" count={rows.length} loading={loading} error={error} onRefresh={load}
      search={search} onSearch={setSearch}>
      <table className="min-w-full text-sm">
        <THead cols={["Name", "Email", "Location", "Scam", "Amount", "Rating", "Status", "Date"]} />
        <tbody className="divide-y divide-gray-100">
          {filtered.map(r => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors align-top">
              <td className="px-4 py-3 font-medium whitespace-nowrap">{r.clientName}</td>
              <td className="px-4 py-3 text-gray-500">{r.email || "—"}</td>
              <td className="px-4 py-3 text-gray-500">{r.location || "—"}</td>
              <td className="px-4 py-3"><Chip text={r.scamType || "—"} /></td>
              <td className="px-4 py-3 font-medium text-emerald-700">{r.amountRecovered || "—"}</td>
              <td className="px-4 py-3 text-yellow-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            </tr>
          ))}
          {!loading && filtered.length === 0 && <EmptyRow cols={8} msg="No submissions yet" />}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Site Editor Tab ──────────────────────────────────────────────────────────

type SettingsSection = "general" | "hero" | "social" | "theme" | "seo";

export function SiteEditorTab() {
  const [section, setSection] = useState<SettingsSection>("general");
  const [cfg, setCfg] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSiteSettings().then((data) => { if (data) setCfg(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function set(key: keyof SiteSettings, value: string) {
    setCfg(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const success = await saveSiteSettings({ data: cfg });
      if (!success) throw new Error("Failed to save settings.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) { setError(String(e)); }
    finally { setSaving(false); }
  }

  const sections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General Info", icon: Globe },
    { id: "hero", label: "Hero Section", icon: Type },
    { id: "social", label: "Social & Contact", icon: Link2 },
    { id: "theme", label: "Theme & Colors", icon: Palette },
    { id: "seo", label: "SEO & Meta", icon: FileText },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading settings…
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section picker */}
      <div className="flex flex-wrap gap-2">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              section === id
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Editor card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{sections.find(s => s.id === section)?.label}</h2>
          <div className="flex items-center gap-3">
            {error && <span className="text-red-500 text-sm">{error}</span>}
            {saved && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
            <button
              onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 transition shadow"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {section === "general" && (
            <div className="grid sm:grid-cols-2 gap-5">
              <SField label="Site Name" value={cfg.site_name || ""} onChange={v => set("site_name", v)} />
              <SField label="Tagline" value={cfg.tagline || ""} onChange={v => set("tagline", v)} />
              <SField label="Contact Email" value={cfg.contact_email || ""} type="email" onChange={v => set("contact_email", v)} />
              <SField label="Contact Phone" value={cfg.contact_phone || ""} onChange={v => set("contact_phone", v)} />
              <SField label="Address" value={cfg.contact_address || ""} onChange={v => set("contact_address", v)} className="sm:col-span-2" />
              <SField label="Footer Text" value={cfg.footer_text || ""} onChange={v => set("footer_text", v)} className="sm:col-span-2" />
              <SField label="Logo URL (leave blank to use uploaded logo)" value={cfg.logo_url || ""} onChange={v => set("logo_url", v)} className="sm:col-span-2" hint="Paste an https:// link to an image, or leave blank" />
            </div>
          )}

          {section === "hero" && (
            <div className="grid sm:grid-cols-2 gap-5">
              <SField label="Hero Headline" value={cfg.hero_headline || ""} onChange={v => set("hero_headline", v)} className="sm:col-span-2" />
              <SField label="Hero Subheadline" value={cfg.hero_subheadline || ""} onChange={v => set("hero_subheadline", v)} className="sm:col-span-2" textarea />
              <SField label="Primary CTA Button" value={cfg.hero_cta_primary || ""} onChange={v => set("hero_cta_primary", v)} />
              <SField label="Secondary CTA Button" value={cfg.hero_cta_secondary || ""} onChange={v => set("hero_cta_secondary", v)} />
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Hero Stats</p>
                <div className="grid grid-cols-3 gap-4">
                  <SField label="Amount Recovered" value={cfg.stats_recovered || ""} onChange={v => set("stats_recovered", v)} />
                  <SField label="Cases Handled" value={cfg.stats_cases || ""} onChange={v => set("stats_cases", v)} />
                  <SField label="Success Rate" value={cfg.stats_success || ""} onChange={v => set("stats_success", v)} />
                </div>
              </div>
            </div>
          )}

          {section === "social" && (
            <div className="grid sm:grid-cols-2 gap-5">
              <SField label="WhatsApp Number" value={cfg.whatsapp_number || ""} onChange={v => set("whatsapp_number", v)} hint="+1 234 567 8900" />
              <SField label="Telegram Username" value={cfg.telegram_username || ""} onChange={v => set("telegram_username", v)} hint="@username" />
              <SField label="Facebook URL" value={cfg.facebook_url || ""} onChange={v => set("facebook_url", v)} hint="https://facebook.com/…" />
              <SField label="Twitter / X URL" value={cfg.twitter_url || ""} onChange={v => set("twitter_url", v)} hint="https://x.com/…" />
              <SField label="Instagram URL" value={cfg.instagram_url || ""} onChange={v => set("instagram_url", v)} hint="https://instagram.com/…" />
              <SField label="LinkedIn URL" value={cfg.linkedin_url || ""} onChange={v => set("linkedin_url", v)} hint="https://linkedin.com/…" />
              <SField label="YouTube URL" value={cfg.youtube_url || ""} onChange={v => set("youtube_url", v)} hint="https://youtube.com/…" />
            </div>
          )}

          {section === "theme" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">Choose your brand colours. Changes apply site-wide immediately after saving.</p>
              <div className="grid sm:grid-cols-2 gap-6">
                <ColorField label="Primary Colour" hint="Used for buttons, links, and accents" value={cfg.primary_color || "#7c3aed"} onChange={v => set("primary_color", v)} />
                <ColorField label="Accent Colour" hint="Used for highlights and secondary elements" value={cfg.accent_color || "#06b6d4"} onChange={v => set("accent_color", v)} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Preview</p>
                <div className="flex flex-wrap gap-3">
                  <button style={{ backgroundColor: cfg.primary_color || "#7c3aed" }} className="px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow">Primary Button</button>
                  <button style={{ backgroundColor: cfg.accent_color || "#06b6d4" }} className="px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow">Accent Button</button>
                  <span style={{ color: cfg.primary_color || "#7c3aed" }} className="font-semibold self-center">Primary link text</span>
                </div>
              </div>
            </div>
          )}

          {section === "seo" && (
            <div className="grid sm:grid-cols-2 gap-5">
              <SField label="Default SEO Title" value={cfg.default_seo_title || ""} onChange={v => set("default_seo_title", v)} className="sm:col-span-2" />
              <SField label="Default SEO Description" value={cfg.default_seo_description || ""} onChange={v => set("default_seo_description", v)} className="sm:col-span-2" textarea />
              <SField label="OG Image URL" value={cfg.og_image_url || ""} onChange={v => set("og_image_url", v)} className="sm:col-span-2" hint="Recommended: 1200×630px image" />
              <SField label="Google Analytics ID" value={cfg.google_analytics_id || ""} onChange={v => set("google_analytics_id", v)} hint="G-XXXXXXXXXX" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DocImage — identity document thumbnail + lightbox ────────────────────────

function DocImage({ label, icon, src }: { label: string; icon: React.ReactNode; src: string | null }) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 bg-white min-h-[100px] justify-center">
        <div className="text-slate-300">{icon}</div>
        <span className="text-[10px] text-slate-400 text-center leading-tight">{label}</span>
        <span className="text-[9px] text-slate-300 uppercase tracking-wider">Not provided</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex flex-col rounded-xl border-2 border-slate-300 bg-white overflow-hidden hover:border-primary hover:shadow-md transition-all"
      >
        <div className="relative">
          <img src={src} alt={label} className="w-full h-24 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="px-2 py-1.5 flex items-center gap-1">
          <span className="text-primary w-3 h-3 shrink-0">{icon}</span>
          <span className="text-[10px] text-slate-600 font-medium leading-tight truncate">{label}</span>
        </div>
        <div className="absolute top-1.5 right-1.5 bg-emerald-500 rounded-full p-0.5">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={src} alt={label} className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain" />
            <div className="mt-3 text-center text-white text-sm font-medium">{label}</div>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-800 font-bold shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
