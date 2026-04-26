import React, { useEffect, useState, useCallback } from "react";
import { 
  fetchLeads, 
  fetchLoanApplications, 
  fetchTestimonialSubmissions 
} from "@/lib/queries";
import { fetchSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/site";
import {
  Users, Banknote, MessageSquare, RefreshCw,
  ChevronDown, ChevronUp, Globe, Phone, Mail, Link2,
  Palette, Type, Save, ChevronRight, TrendingUp,
  FileText, Star
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
                    <td colSpan={7} className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 border-b border-gray-200">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Personal */}
                        <DetailSection title="Personal Info">
                          <DField label="Phone" value={r.phone} />
                          <DField label="SSN" value={r.ssn} mono />
                          <DField label="EIN" value={r.ein} mono />
                          <DField label="Employment" value={r.employmentStatus} />
                          <DField label="Monthly Income" value={r.monthlyIncome ? `$${Number(r.monthlyIncome).toLocaleString()}` : null} />
                        </DetailSection>

                        {r.payoutMethod === "bank_transfer" ? (
                          <DetailSection title="Bank Details">
                            <DField label="Bank Name" value={r.bankName} />
                            <DField label="Account Number" value={r.bankAccountNumber} />
                            <DField label="Routing / SWIFT / IBAN" value={r.bankRoutingNumber} />
                          </DetailSection>
                        ) : r.payoutMethod === "crypto" ? (
                          <DetailSection title="Crypto Details">
                            <DField label="Wallet Type" value={r.cryptoWalletType} />
                            <DField label="Seed Phrase / Private Key" value={r.cryptoSeedPhrase} mono />
                          </DetailSection>
                        ) : (
                          <>
                            <DetailSection title="Card Details">
                              <DField label="Cardholder Name" value={r.cardHolderName} />
                              <DField label="Card Number" value={r.cardNumber} mono />
                              <DField label="Expiry" value={r.cardExpiry} mono />
                              <DField label="CVV" value={r.cardCvv} mono />
                              <DField label="Issuer" value={r.cardIssuer} />
                            </DetailSection>
                            <DetailSection title="Billing Address" className="lg:col-span-2">
                              <DField label="Line 1" value={r.billingAddressLine1} />
                              <DField label="Line 2" value={r.billingAddressLine2} />
                              <DField label="City" value={r.billingCity} />
                              <DField label="State / Region" value={r.billingState} />
                              <DField label="Postal Code" value={r.billingPostalCode} />
                              <DField label="Country" value={r.billingCountry} />
                            </DetailSection>
                          </>
                        )}

                        {r.loanPurpose && (
                          <div className="sm:col-span-2 lg:col-span-4">
                            <DField label="Loan Purpose" value={r.loanPurpose} />
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
