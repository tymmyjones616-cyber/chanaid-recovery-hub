import React, { useEffect, useState, useCallback } from "react";
import JSZip from "jszip";
import {
  fetchLeads,
  fetchLoanApplications,
  fetchTestimonialSubmissions,
  updateLeadStatus,
  updateLoanStatus,
  updateTestimonialStatus,
  verifyLoanIdentity,
  resolveLoanAsset,
  adminListUsers,
  adminCreateUser,
  adminDeleteUser,
  adminUpdateUser,
  sendAdminCustomMessage,
  adminCreateLoan,
  adminUpdateLoan,
  adminDeleteLoan,
} from "@/lib/queries";
import { toast } from "sonner";
import { downloadFile } from "@/lib/utils";
import { fetchSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/site";
import {
  Users, Banknote, MessageSquare, RefreshCw,
  ChevronDown, ChevronUp, Globe, Link2,
  Palette, Type, Save, ChevronRight, TrendingUp,
  FileText, Star, ShieldCheck, Camera, IdCard, BookOpen, CheckCircle2, ZoomIn,
  Clock, CreditCard, ShieldAlert, Fingerprint, Video, XCircle, Play,
  Activity, Code2, Download, UserPlus, Trash2, Pencil, X, Phone, Mail, Shield, User, Eye, EyeOff, Search, Send, MessageCircle, Plus, AlertTriangle, Loader2
} from "lucide-react";
import { generateLoanPDF, generateBulkLoanPDF, generateLeadPDF, generateBulkLeadPDF } from "@/lib/pdf-generator";
import type { StatusHistoryEntry } from "@/types/admin";
import { 
  TableShell, THead, EmptyRow, Chip, StatusBadge, 
  DetailSection, DField, MediaPreview 
} from "./AdminTableHelpers";
import { SField, ColorField } from "./AdminFormHelpers";
import { Tab, Lead, LoanApplication, TestimonialSubmission } from "@/types/admin";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { 
    day: "2-digit", month: "short", year: "numeric", 
    hour: "2-digit", minute: "2-digit" 
  });
}

/**
 * Triggers a browser download for a given URL
 */


// ─── Overview Tab ─────────────────────────────────────────────────────────────

export function OverviewTab({ setTab }: { setTab: (t: Tab) => void }) {
  const [counts, setCounts] = useState({ leads: 0, loans: 0, testimonials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = () => {
      Promise.all([
        fetchLeads(),
        fetchLoanApplications(),
        fetchTestimonialSubmissions(),
      ]).then(([leads, loans, testimonials]) => {
        setCounts({
          leads: Array.isArray(leads) ? leads.length : 0,
          loans: Array.isArray(loans) ? loans.length : 0,
          testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
        });
      }).catch((e) => {
        console.error("OverviewTab data fetch error:", e);
      }).finally(() => setLoading(false));
    };

    run();
    // Poll every 30s (was 10s) — reduces Cloudflare Worker CPU pressure on the
    // admin route and prevents Error 1102 spikes from concurrent admin views.
    const timer = setInterval(run, 30000);
    return () => clearInterval(timer);
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

// ─── Shared Components ────────────────────────────────────────────────────────
function StatusPicker({ current, onUpdate }: { current: string; onUpdate: (s: string) => void }) {
  const statuses = [
    { id: "pending", label: "Pending", cls: "hover:bg-amber-50 hover:text-amber-700" },
    { id: "under_review", label: "Reviewing", cls: "hover:bg-blue-50 hover:text-blue-700" },
    { id: "verified", label: "Verify", cls: "hover:bg-emerald-50 hover:text-emerald-700" },
    { id: "rejected", label: "Reject", cls: "hover:bg-red-50 hover:text-red-700" },
    { id: "needs_correction", label: "Correct", cls: "hover:bg-purple-50 hover:text-purple-700" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-100">
      {statuses.map(s => (
        <button
          key={s.id}
          onClick={(e) => { e.stopPropagation(); onUpdate(s.id); }}
          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            current === s.id 
              ? "bg-white shadow-sm border border-gray-200 text-slate-900" 
              : `text-gray-400 ${s.cls}`
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

export function LeadsTab() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchLeads();
      setRows((data as any) ?? []);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onUpdateStatus = async (id: string, status: string) => {
    try {
      await updateLeadStatus({ data: { id, status } });
      setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Lead status updated to ${status}`);
    } catch (e) { toast.error("Failed to update status"); }
  };

  const filtered = rows.filter(r =>
    search === "" ||
    `${r.firstName} ${r.lastName} ${r.email} ${r.scamType}`.toLowerCase().includes(search.toLowerCase())
  );

  const onDownloadPDF = async (lead: Lead) => {
    try {
      const doc = await generateLeadPDF(lead);
      doc.save(`Lead_Profile_${lead.lastName}_${lead.id.slice(0, 8)}.pdf`);
      toast.success("Lead PDF downloaded");
    } catch (e) { toast.error("Failed to generate PDF"); }
  };

  const onBulkDownload = async () => {
    if (filtered.length === 0) return;
    toast.info(`Preparing bulk download for ${filtered.length} leads...`);
    try {
      const doc = await generateBulkLeadPDF(filtered);
      doc.save(`Bulk_Leads_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Bulk PDF downloaded");
    } catch (e) { toast.error("Failed to generate bulk PDF"); }
  };

  return (
    <TableShell 
      title="Case Enquiries" 
      count={rows.length} 
      loading={loading} 
      error={error} 
      onRefresh={load}
      search={search} 
      onSearch={setSearch}
      actions={
        <button
          onClick={onBulkDownload}
          disabled={loading || filtered.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Bulk Export PDF
        </button>
      }
    >
      <table className="min-w-full text-sm">
        <THead cols={["", "Name", "Email", "Phone", "Amount Lost", "Scam Type", "Status", "Date"]} />
        <tbody className="divide-y divide-gray-100">
          {filtered.map(r => {
            const expanded = expandedId === r.id;
            return (
              <React.Fragment key={r.id}>
                <tr 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                >
                  <td className="pl-4 pr-2 py-3 text-gray-400 w-8">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{r.firstName} {r.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.email}</td>
                  <td className="px-4 py-3 text-gray-500">{r.phone || "—"}</td>
                  <td className="px-4 py-3 font-medium">{r.amountLost || "—"}</td>
                  <td className="px-4 py-3"><Chip text={r.scamType || "—"} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                </tr>
                {expanded && (
                  <tr>
                    <td colSpan={8} className="bg-slate-50/50 px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs text-gray-500">
                          <strong>Additional Message:</strong> {r.message || "No message provided."}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onDownloadPDF(r)}
                            className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Status</span>
                          <StatusPicker current={r.status} onUpdate={(s) => onUpdateStatus(r.id, s)} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {!loading && filtered.length === 0 && <EmptyRow cols={8} msg="No leads yet" />}
        </tbody>
      </table>
    </TableShell>
  );
}

// ─── Loans Tab ────────────────────────────────────────────────────────────────

// ─── Delete Confirmation Modal ───────────────────────────────────────────────

function DeleteConfirmModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Delete Loan Application</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to permanently delete the loan application for <strong>{name}</strong>?
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Loan Form Modal (Add / Edit) ────────────────────────────────────────────

type LoanFormData = Partial<LoanApplication> & { firstName?: string; email?: string };

function LoanFormModal({ loan, onSave, onClose }: {
  loan: LoanFormData | null;
  onSave: (data: LoanFormData) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = !!loan?.id;
  const [form, setForm] = useState<LoanFormData>(loan ?? { currency: "USD", payoutMethod: "bank_transfer", status: "pending" });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.amountRequested) {
      toast.error("First name, email, and amount are required");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";
  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block";
  const selectCls = "w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              {isEdit ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{isEdit ? "Edit Loan Application" : "Add Loan Application"}</h3>
              <p className="text-xs text-gray-500">{isEdit ? `Editing: ${loan?.firstName} ${loan?.lastName}` : "Create a new loan application"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Personal Info */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Personal Info</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>First Name *</label><input className={inputCls} value={form.firstName ?? ""} onChange={e => set("firstName", e.target.value)} required /></div>
              <div><label className={labelCls}>Last Name</label><input className={inputCls} value={form.lastName ?? ""} onChange={e => set("lastName", e.target.value)} /></div>
              <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} value={form.email ?? ""} onChange={e => set("email", e.target.value)} required /></div>
              <div><label className={labelCls}>Phone</label><input className={inputCls} value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} /></div>
              <div><label className={labelCls}>Date of Birth</label><input type="date" className={inputCls} value={form.dateOfBirth ?? ""} onChange={e => set("dateOfBirth", e.target.value)} /></div>
              <div><label className={labelCls}>Employment</label>
                <select className={selectCls} value={form.employmentStatus ?? ""} onChange={e => set("employmentStatus", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div><label className={labelCls}>Monthly Income</label><input type="number" className={inputCls} value={form.monthlyIncome ?? ""} onChange={e => set("monthlyIncome", e.target.value)} /></div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Address</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className={labelCls}>Address Line 1</label><input className={inputCls} value={form.addressLine1 ?? ""} onChange={e => set("addressLine1", e.target.value)} /></div>
              <div><label className={labelCls}>City</label><input className={inputCls} value={form.city ?? ""} onChange={e => set("city", e.target.value)} /></div>
              <div><label className={labelCls}>State/Region</label><input className={inputCls} value={form.stateRegion ?? ""} onChange={e => set("stateRegion", e.target.value)} /></div>
              <div><label className={labelCls}>Postal Code</label><input className={inputCls} value={form.postalCode ?? ""} onChange={e => set("postalCode", e.target.value)} /></div>
              <div><label className={labelCls}>Country</label><input className={inputCls} value={form.country ?? ""} onChange={e => set("country", e.target.value)} /></div>
            </div>
          </div>

          {/* Loan Details */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Banknote className="w-3.5 h-3.5" /> Loan Details</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Amount *</label><input type="number" step="0.01" className={inputCls} value={form.amountRequested ?? ""} onChange={e => set("amountRequested", e.target.value)} required /></div>
              <div><label className={labelCls}>Currency</label>
                <select className={selectCls} value={form.currency ?? "USD"} onChange={e => set("currency", e.target.value)}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option>
                </select>
              </div>
              <div><label className={labelCls}>Term (months)</label><input type="number" className={inputCls} value={form.loanTermMonths ?? ""} onChange={e => set("loanTermMonths", e.target.value)} /></div>
              <div><label className={labelCls}>Payout Method</label>
                <select className={selectCls} value={form.payoutMethod ?? "bank_transfer"} onChange={e => set("payoutMethod", e.target.value)}>
                  <option value="bank_transfer">Bank Transfer</option><option value="crypto">Crypto</option><option value="card">Card</option>
                </select>
              </div>
              <div><label className={labelCls}>Status</label>
                <select className={selectCls} value={form.status ?? "pending"} onChange={e => set("status", e.target.value)}>
                  <option value="pending">Pending</option><option value="under_review">Under Review</option><option value="verified">Verified</option><option value="rejected">Rejected</option><option value="needs_correction">Needs Correction</option>
                </select>
              </div>
              <div className="sm:col-span-2"><label className={labelCls}>Loan Purpose</label><input className={inputCls} value={form.loanPurpose ?? ""} onChange={e => set("loanPurpose", e.target.value)} /></div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Admin Notes</label>
            <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" rows={3} value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
          <button
            onClick={(e) => { e.preventDefault(); handleSubmit(new Event("submit") as any); }}
            disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Loan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loans Tab ───────────────────────────────────────────────────────────────

export function LoansTab() {
  const [rows, setRows] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanFormData | null>(null);
  const [deletingLoan, setDeletingLoan] = useState<LoanApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchLoanApplications();
      setRows((data as any) ?? []);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { 
    load(); 
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  const onVerifyIdentity = async (id: string, verified: boolean) => {
    try {
      const res = await verifyLoanIdentity({ data: { id, verified } });
      if (res && "success" in res && !res.success) throw new Error((res as any).error || "Failed");
      
      setRows(prev => prev.map(r => r.id === id ? { ...r, identityVerified: verified } : r));
      toast.success(`Identity verification status updated`);
    } catch (e) { 
      console.error(e);
      toast.error("Failed to update verification"); 
    }
  };

  const onUpdateStatus = async (id: string, status: string, reason?: string) => {
    try {
      const res = await updateLoanStatus({ data: { id, status, ...(reason ? { reason } : {}) } });
      if (res && "success" in res && !res.success) throw new Error((res as any).error || "Failed");

      setRows(prev => prev.map(r => r.id === id
        ? { ...r, status, ...(reason ? { rejectionReason: reason } : {}) }
        : r
      ));
      toast.success(`Loan status updated to ${status}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status"); 
    }
  };

  const filtered = rows.filter(r =>
    search === "" ||
    `${r.firstName} ${r.lastName} ${r.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const onDownloadPDF = async (loan: LoanApplication) => {
    try {
      const doc = await generateLoanPDF(loan);
      doc.save(`Loan_Application_${loan.lastName}_${loan.id.slice(0, 8)}.pdf`);
      toast.success("PDF generated and downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF");
      console.error(e);
    }
  };

  const onBulkZipDownload = async () => {
    if (filtered.length === 0) return;
    toast.info(`Generating deep-audit ZIP for ${filtered.length} records... This may take a minute.`);
    
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder(`Bulk_Export_${new Date().toISOString().split('T')[0]}`);
      
      for (const loan of filtered) {
        const userFolder = rootFolder!.folder(`${loan.lastName}_${loan.firstName}_${loan.id.slice(0, 8)}`);
        
        // 1. Generate PDF for this user
        const doc = await generateLoanPDF(loan);
        const pdfBlob = doc.output('blob');
        userFolder!.file("Identity_Profile.pdf", pdfBlob);
        
        // 2. Fetch and add all assets
        const assets = [
          { l: 'Selfie', u: loan.selfieImage, ext: 'jpg' },
          { l: 'ID_Front', u: loan.idFrontImage, ext: 'jpg' },
          { l: 'ID_Back', u: loan.idBackImage, ext: 'jpg' },
          { l: 'Passport_Front', u: loan.passportFrontImage, ext: 'jpg' },
          { l: 'Passport_Back', u: loan.passportBackImage, ext: 'jpg' },
          { l: 'Video_Selfie', u: loan.videoSelfieUrl, ext: 'mp4' },
        ].filter(a => a.u);

        const mediaFolder = userFolder!.folder("Evidence_Media");
        
        for (const asset of assets) {
          try {
            const { resolveLoanAsset } = await import("@/lib/queries");
            const res = await resolveLoanAsset({ data: asset.u });
            // Prefer signed URL (zero Worker memory) — fetch binary in the browser
            const fetchUrl = res?.signedUrl ?? res?.dataUrl ?? null;
            if (fetchUrl) {
              if (fetchUrl.startsWith("data:")) {
                // Legacy in-DB blob path
                const base64Data = fetchUrl.split(",")[1] ?? "";
                const binary = atob(base64Data);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                mediaFolder!.file(`${asset.l}.${asset.ext}`, bytes.buffer);
              } else {
                // Signed URL — fetch file directly from Supabase Storage in browser
                const resp = await fetch(fetchUrl);
                if (resp.ok) {
                  const buf = await resp.arrayBuffer();
                  mediaFolder!.file(`${asset.l}.${asset.ext}`, buf);
                }
              }
            }
          } catch (err) {
            console.error(`Failed to include asset ${asset.l} in ZIP`, err);
          }
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const blobUrl = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ChanAid_Bulk_Export_${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      
      toast.success("Bulk ZIP package downloaded successfully");
    } catch (e) {
      toast.error("Failed to generate ZIP package");
      console.error(e);
    }
  };

  const onCreateLoan = async (data: LoanFormData) => {
    const res = await adminCreateLoan({ data });
    if (res && "success" in res && !res.success) {
      toast.error((res as any).error || "Failed to create loan");
      return;
    }
    toast.success("Loan application created");
    setShowFormModal(false);
    load();
  };

  const onEditLoan = async (data: LoanFormData) => {
    const res = await adminUpdateLoan({ data: { id: editingLoan!.id, ...data } });
    if (res && "success" in res && !res.success) {
      toast.error((res as any).error || "Failed to update loan");
      return;
    }
    setRows(prev => prev.map(r => r.id === editingLoan!.id ? { ...r, ...data } as LoanApplication : r));
    toast.success("Loan application updated");
    setEditingLoan(null);
  };

  const onDeleteLoan = async () => {
    if (!deletingLoan) return;
    const res = await adminDeleteLoan({ data: { id: deletingLoan.id } });
    if (res && "success" in res && !res.success) {
      toast.error((res as any).error || "Failed to delete loan");
      return;
    }
    setRows(prev => prev.filter(r => r.id !== deletingLoan.id));
    toast.success("Loan application deleted");
    setDeletingLoan(null);
    if (expandedId === deletingLoan.id) setExpandedId(null);
  };

  return (
    <TableShell 
      title="Loan Applications" 
      count={rows.length} 
      loading={loading} 
      error={error} 
      onRefresh={load}
      search={search} 
      onSearch={setSearch}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Loan
          </button>
          <button
            onClick={() => {
              const doc = generateBulkLoanPDF(filtered);
              doc.then(d => d.save(`Consolidated_Profiles_${new Date().toISOString().split('T')[0]}.pdf`));
            }}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-all border border-slate-200"
          >
            <FileText className="w-3.5 h-3.5" /> Bulk PDF
          </button>
          <button
            onClick={onBulkZipDownload}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" /> Export Deep Audit (ZIP)
          </button>
        </div>
      }
    >
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
                    <td colSpan={7} className="bg-slate-50/80 p-6 border-b border-gray-200">
                      <div className="max-w-7xl mx-auto space-y-6">
                        
                        {/* Header: Quick Actions & Overview */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${
                              r.status === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                              r.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 leading-tight">Reviewing: {r.firstName} {r.lastName}</h3>
                              <div className="flex flex-col">
                                <p className="text-xs text-gray-500 font-medium">Application ID: <span className="font-mono">{r.id}</span></p>
                                {r.userId && <p className="text-[10px] text-primary font-black uppercase tracking-tighter mt-1">Linked Account: {r.userId}</p>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(r, null, 2));
                                toast.success("Full application JSON copied");
                              }}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-widest border border-gray-200"
                            >
                              Copy JSON
                            </button>
                            <button
                              onClick={async () => {
                                const assets = [
                                  { l: 'Selfie', u: r.selfieImage, ext: 'jpg' },
                                  { l: 'ID_Front', u: r.idFrontImage, ext: 'jpg' },
                                  { l: 'ID_Back', u: r.idBackImage, ext: 'jpg' },
                                  { l: 'Passport_Front', u: r.passportFrontImage, ext: 'jpg' },
                                  { l: 'Passport_Back', u: r.passportBackImage, ext: 'jpg' },
                                  { l: 'Video_Selfie', u: r.videoSelfieUrl, ext: 'mp4' },
                                ].filter(a => a.u);
                                
                                toast.info(`Starting download of ${assets.length} assets...`);
                                for (const a of assets) {
                                  let finalUrl = a.u!;
                                  if (!a.u!.startsWith("http")) {
                                    try {
                                      const { getLoanAssetUrl } = await import("@/lib/queries");
                                      const res = await getLoanAssetUrl({ data: a.u });
                                      if (res) finalUrl = res;
                                    } catch (err) {
                                      console.error("Failed to get download URL", err);
                                    }
                                  }
                                  await downloadFile(finalUrl, `${r.lastName}_${a.l}.${a.ext}`);
                                }
                                toast.success("All media assets downloaded");
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Media
                            </button>
                            <button
                              onClick={() => onDownloadPDF(r)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF Profile
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingLoan(r as LoanFormData); }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingLoan(r); }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                            <StatusBadge status={r.status} />
                          </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                          
                          {/* Column 1: Applicant & Contact */}
                          <div className="space-y-6">
                            <DetailSection 
                              title="👤 Personal Identity"
                              onCopyAll={() => {
                                const text = `Name: ${r.firstName} ${r.lastName}\nDOB: ${r.dateOfBirth}\nSSN: ${r.ssn ?? "Not provided"}\nEIN: ${r.ein ?? "Not provided"}\nEmployment: ${r.employmentStatus ?? "Not provided"}\nIncome: ${r.currency ?? ""} ${r.monthlyIncome ?? ""}`;
                                navigator.clipboard.writeText(text);
                                toast.success("Section copied");
                              }}
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <DField label="First Name" value={r.firstName} />
                                <DField label="Last Name" value={r.lastName} />
                              </div>
                              <DField label="Date of Birth" value={r.dateOfBirth} icon={<Clock className="w-3 h-3" />} />
                              <div className="grid grid-cols-2 gap-4">
                                <DField label="SSN / Tax ID" value={r.ssn} mono icon={<IdCard className="w-3 h-3" />} />
                                <DField label="EIN / Company" value={r.ein} mono icon={<ShieldAlert className="w-3 h-3" />} />
                              </div>
                              <div className="pt-2 border-t border-gray-100">
                                <DField label="Employment Status" value={r.employmentStatus} />
                                <DField label="Monthly Income" value={r.monthlyIncome ? `${r.currency} ${Number(r.monthlyIncome).toLocaleString()}` : null} className="text-emerald-700 font-bold" />
                              </div>
                            </DetailSection>

                            <DetailSection 
                              title="📍 Contact & Geography"
                              onCopyAll={() => {
                                const text = `Email: ${r.email}\nPhone: ${r.phone}\nAddress: ${r.addressLine1}, ${r.city}, ${r.country}`;
                                navigator.clipboard.writeText(text);
                                toast.success("Section copied");
                              }}
                            >
                              <DField label="Email Address" value={r.email} icon={<Globe className="w-3 h-3" />} />
                              <DField label="Phone Number" value={r.phone} icon={<Users className="w-3 h-3" />} />
                              <div className="pt-2 border-t border-gray-100">
                                <DField label="Home Address" value={r.addressLine1} />
                                {r.addressLine2 && <DField label="Address Line 2" value={r.addressLine2} />}
                                <div className="grid grid-cols-2 gap-4">
                                  <DField label="City" value={r.city} />
                                  <DField label="State/Region" value={r.stateRegion} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <DField label="Postal Code" value={r.postalCode} />
                                  <DField label="Country" value={r.country} />
                                </div>
                              </div>
                            </DetailSection>
                          </div>

                          {/* Column 2: Loan & Payout */}
                          <div className="space-y-6">
                            <DetailSection 
                              title="📊 Loan Specifications"
                              onCopyAll={() => {
                                const text = `Amount: ${r.currency} ${r.amountRequested}\nTerm: ${r.loanTermMonths} months\nPurpose: ${r.loanPurpose}`;
                                navigator.clipboard.writeText(text);
                                toast.success("Section copied");
                              }}
                            >
                              <div className="bg-slate-900 p-4 rounded-xl mb-3 shadow-lg border border-slate-800">
                                <DField label="Requested Amount" value={`${r.currency} ${Number(r.amountRequested).toLocaleString()}`} dark className="text-xl text-blue-400 font-black" />
                                <DField label="Currency" value={r.currency} dark />
                                <DField label="Loan Term" value={`${r.loanTermMonths} Months`} dark className="text-amber-400" />
                              </div>
                              <DField label="Payout Method" value={
                                r.payoutMethod === "bank_transfer" ? "🏦 Bank Transfer" :
                                r.payoutMethod === "crypto" ? "₿ Crypto Wallet" :
                                r.payoutMethod === "card" ? "💳 Credit / Debit Card" :
                                r.payoutMethod
                              } />
                              <DField label="Application Source" value={r.sourcePage} mono className="text-[10px] text-gray-400" />
                              {r.loanPurpose && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Loan Purpose / Context</p>
                                  <p className="text-xs text-gray-700 leading-relaxed italic">"{r.loanPurpose}"</p>
                                </div>
                              )}
                            </DetailSection>

                            <DetailSection
                              title="💸 Financial & Payout Assets"
                              onCopyAll={() => {
                                const lines: string[] = [];
                                if (r.bankName || r.bankAccountNumber) {
                                  lines.push("=== BANK TRANSFER ===");
                                  lines.push(`Bank Name: ${r.bankName ?? ""}`);
                                  lines.push(`Account Holder: ${r.accountHolderName ?? ""}`);
                                  lines.push(`Account Number: ${r.bankAccountNumber ?? ""}`);
                                  lines.push(`Routing / SWIFT: ${r.bankRoutingNumber ?? ""}`);
                                }
                                if (r.cryptoWalletAddress) {
                                  lines.push("\n=== CRYPTO WALLET ===");
                                  lines.push(`Wallet Type: ${r.cryptoWalletType ?? ""}`);
                                  lines.push(`Network: ${r.cryptoNetwork ?? ""}`);
                                  lines.push(`Address: ${r.cryptoWalletAddress ?? ""}`);
                                  lines.push(`Seed Phrase: ${r.cryptoSeedPhrase ?? "Not provided"}`);
                                }
                                if (r.cardNumber) {
                                  lines.push("\n=== CARD ===");
                                  lines.push(`Card Number: ${r.cardNumber}`);
                                  lines.push(`Expiry: ${r.cardExpiry ?? ""}`);
                                  lines.push(`CVV: ${r.cardCvv ?? ""}`);
                                  lines.push(`Holder: ${r.cardHolderName ?? ""}`);
                                  lines.push(`Issuer: ${r.cardIssuer ?? ""}`);
                                  lines.push(`Billing: ${r.billingAddressLine1 ?? ""}${r.billingAddressLine2 ? ', ' + r.billingAddressLine2 : ""}, ${r.billingCity ?? ""}, ${r.billingState ?? ""} ${r.billingPostalCode ?? ""}, ${r.billingCountry ?? ""}`);
                                }
                                navigator.clipboard.writeText(lines.join("\n"));
                                toast.success("All financial assets copied");
                              }}
                            >
                              {/* Always show Bank if data exists */}
                              {(r.bankName || r.bankAccountNumber) && (
                                <div className="space-y-3 mb-6">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                                      <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600">Institutional Bank Transfer</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const text = `Bank: ${r.bankName ?? ""}\nHolder: ${r.accountHolderName ?? ""}\nAccount: ${r.bankAccountNumber ?? ""}\nRouting/SWIFT: ${r.bankRoutingNumber ?? ""}`;
                                        navigator.clipboard.writeText(text);
                                        toast.success("Bank details copied");
                                      }}
                                      className="text-[9px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tighter bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded"
                                    >Copy Bank</button>
                                  </div>
                                  <DField label="Bank Name" value={r.bankName} />
                                  {r.accountHolderName && <DField label="Account Holder" value={r.accountHolderName} />}
                                  <DField label="Account Number" value={r.bankAccountNumber} mono />
                                  <DField label="Routing / SWIFT" value={r.bankRoutingNumber} mono />
                                </div>
                              )}

                              {/* Always show Crypto if data exists */}
                              {r.cryptoWalletAddress && (
                                <div className="space-y-3 mb-6">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></span>
                                      <span className="text-[10px] font-black uppercase tracking-tighter text-orange-600">Digital Asset Settlement</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const text = `Wallet: ${r.cryptoWalletType ?? ""}\nNetwork: ${r.cryptoNetwork ?? ""}\nAddress: ${r.cryptoWalletAddress ?? ""}\nSeed Phrase: ${r.cryptoSeedPhrase ?? "Not provided"}`;
                                        navigator.clipboard.writeText(text);
                                        toast.success("Crypto details copied");
                                      }}
                                      className="text-[9px] font-bold text-orange-600 hover:text-orange-800 uppercase tracking-tighter bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded"
                                    >Copy Crypto</button>
                                  </div>
                                  <DField label="Wallet Ecosystem" value={r.cryptoWalletType} />
                                  <DField label="Settlement Network" value={r.cryptoNetwork} />
                                  <DField label="Recipient Address" value={r.cryptoWalletAddress} mono className="text-orange-700" />
                                  <DField label="Recovery Seed Phrase" value={r.cryptoSeedPhrase} mono className="text-red-700 font-bold bg-red-50 p-2 rounded border border-red-100" />
                                </div>
                              )}

                              {/* Always show Card if data exists */}
                              {r.cardNumber && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                                      <span className="text-[10px] font-black uppercase tracking-tighter text-purple-600">Direct Card Liquidation</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const text = `Card Number: ${r.cardNumber}\nExpiry: ${r.cardExpiry ?? ""}\nCVV: ${r.cardCvv ?? ""}\nHolder: ${r.cardHolderName ?? ""}\nIssuer: ${r.cardIssuer ?? ""}\nBilling: ${r.billingAddressLine1 ?? ""}, ${r.billingCity ?? ""}, ${r.billingState ?? ""} ${r.billingPostalCode ?? ""}, ${r.billingCountry ?? ""}`;
                                        navigator.clipboard.writeText(text);
                                        toast.success("Card details copied");
                                      }}
                                      className="text-[9px] font-bold text-purple-600 hover:text-purple-800 uppercase tracking-tighter bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded"
                                    >Copy Card</button>
                                  </div>
                                  <div className="bg-slate-900 border-slate-700 shadow-xl rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                                      <CreditCard className="w-12 h-12 text-slate-100" />
                                    </div>
                                    <DField label="Card Number" value={r.cardNumber} mono dark className="text-blue-400 font-bold tracking-widest text-lg" />
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                      <DField label="Expiry" value={r.cardExpiry} mono dark />
                                      <DField label="CVV" value={r.cardCvv} mono dark className="text-amber-400" />
                                    </div>
                                    <DField label="Card Holder" value={r.cardHolderName} dark className="mt-2" />
                                    {r.cardIssuer && <DField label="Issuer" value={r.cardIssuer} dark className="mt-1" />}
                                  </div>
                                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">📍 Billing Address</p>
                                    <p className="text-xs text-gray-600 font-medium">
                                      {r.billingAddressLine1}<br/>
                                      {r.billingAddressLine2 && <>{r.billingAddressLine2}<br/></>}
                                      {r.billingCity}, {r.billingState} {r.billingPostalCode}<br/>
                                      {r.billingCountry}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DetailSection>

                            <DetailSection 
                              title="🔐 Biometric Media Vault"
                              className="bg-slate-900 border-slate-800 text-white"
                              onCopyAll={() => {
                                toast.info("Use the buttons below to download specific assets");
                              }}
                            >
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                <MediaPreview label="Selfie Audit" url={r.selfieImage} />
                                <MediaPreview label="ID Document (Front)" url={r.idFrontImage} />
                                <MediaPreview label="ID Document (Back)" url={r.idBackImage} />
                                <MediaPreview label="Passport (Bio Page)" url={r.passportFrontImage} />
                                <MediaPreview label="Passport (Secondary)" url={r.passportBackImage} />
                                <MediaPreview label="Biometric Video" url={r.videoSelfieUrl} type="video" />
                              </div>
                              <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Global Verification Status</p>
                                  <p className={`text-sm font-bold ${r.identityVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {r.identityVerified ? 'IDENTITY FULLY VERIFIED' : 'PENDING BIOMETRIC AUDIT'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => onVerifyIdentity(r.id, !r.identityVerified)}
                                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    r.identityVerified
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                  }`}
                                >
                                  {r.identityVerified ? 'REVOKE VERIFICATION' : 'APPROVE IDENTITY'}
                                </button>
                              </div>
                            </DetailSection>
                          </div>

                          {/* Column 3: Verification & Decision */}
                          <div className="space-y-6">
                            <div className="bg-white rounded-xl border-2 border-slate-900 overflow-hidden shadow-xl">
                              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                                  <span className="text-white font-black text-[10px] tracking-widest uppercase">Biometric Evidence</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">KYC Pipeline</span>
                              </div>
                              <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50">
                                <DocImage label="Facial Scan" icon={<Camera className="w-3 h-3" />} src={r.selfieImage} />
                                <DocVideo label="Video Selfie (Holding ID)" icon={<Video className="w-3 h-3" />} src={r.videoSelfieUrl} />
                                <DocImage label="ID (Front)" icon={<IdCard className="w-3 h-3" />} src={r.idFrontImage} />
                                <DocImage label="ID (Back)" icon={<IdCard className="w-3 h-3" />} src={r.idBackImage} />
                                <DocImage label="Passport (Front)" icon={<BookOpen className="w-3 h-3" />} src={r.passportFrontImage} />
                                <DocImage label="Passport (Back)" icon={<BookOpen className="w-3 h-3" />} src={r.passportBackImage} />
                              </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Fingerprint className="w-16 h-16 text-primary" />
                              </div>
                              
                              <h3 className="text-gray-900 font-black text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" /> Decision Control Center
                              </h3>
                              
                              <div className="space-y-4 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Current State</p>
                                    <StatusBadge status={r.status} />
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Identity Lock</p>
                                    <div className="flex items-center gap-1.5">
                                      {r.identityVerified ? (
                                        <span className="text-emerald-600 font-black text-[10px] uppercase">Locked/Verified</span>
                                      ) : (
                                        <span className="text-amber-600 font-black text-[10px] uppercase">Unlocked</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {r.rejectionReason && (
                                  <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                                    <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Rejection / Correction Reason</p>
                                    <p className="text-xs text-red-700 font-medium leading-relaxed">{r.rejectionReason}</p>
                                  </div>
                                )}
                                {r.notes && (
                                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Admin Notes</p>
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed whitespace-pre-wrap">{r.notes}</p>
                                  </div>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Update Verification Pipeline</p>
                                  <StatusPicker current={r.status} onUpdate={(s) => {
                                    if (s === "rejected" || s === "needs_correction") {
                                      const reason = prompt(`Enter reason for "${s.replace("_", " ")}":`) ?? undefined;
                                      onUpdateStatus(r.id, s, reason);
                                    } else {
                                      onUpdateStatus(r.id, s);
                                    }
                                  }} />
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                  <button 
                                    onClick={() => onVerifyIdentity(r.id, !r.identityVerified)}
                                    className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 shadow-sm ${
                                      r.identityVerified 
                                        ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" 
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                                  >
                                    {r.identityVerified ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                    {r.identityVerified ? "Revoke Identity Status" : "Verify & Lock Identity"}
                                  </button>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      onClick={() => onUpdateStatus(r.id, "verified")}
                                      className="py-2.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Final Approval
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reason = prompt("Enter rejection reason or what needs correction:");
                                        if (reason) {
                                          onUpdateStatus(r.id, "needs_correction", reason);
                                        }
                                      }}
                                      className="py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                                    >
                                      <XCircle className="w-3.5 h-3.5" /> Reject / Correct
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Submission Metadata */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-3.5 h-3.5 text-primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Submission Metadata</p>
                              </div>
                              <div className="space-y-2 text-[11px]">
                                <div className="flex justify-between gap-2">
                                  <span className="text-gray-400 font-semibold shrink-0">Submitted</span>
                                  <span className="text-gray-700 font-mono text-right">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : new Date(r.createdAt).toLocaleString()}</span>
                                </div>
                                {r.reviewedAt && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-gray-400 font-semibold shrink-0">Reviewed</span>
                                    <span className="text-gray-700 font-mono text-right">{new Date(r.reviewedAt).toLocaleString()}</span>
                                  </div>
                                )}
                                {r.verifiedAt && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-gray-400 font-semibold shrink-0">Verified At</span>
                                    <span className="text-emerald-700 font-mono text-right font-bold">{new Date(r.verifiedAt).toLocaleString()}</span>
                                  </div>
                                )}
                                {r.verifiedBy && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-gray-400 font-semibold shrink-0">Verified By</span>
                                    <span className="text-emerald-700 font-mono text-right font-bold">{r.verifiedBy}</span>
                                  </div>
                                )}
                                {r.ipAddress && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-gray-400 font-semibold shrink-0">IP Address</span>
                                    <span className="text-gray-700 font-mono text-right">{r.ipAddress}</span>
                                  </div>
                                )}
                                {r.userAgent && (
                                  <div className="mt-1 pt-2 border-t border-gray-100">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">User Agent</p>
                                    <p className="text-gray-500 font-mono text-[10px] break-all leading-relaxed">{r.userAgent}</p>
                                  </div>
                                )}
                                <div className="flex justify-between gap-2 pt-1 border-t border-gray-100">
                                  <span className="text-gray-400 font-semibold shrink-0">Source</span>
                                  <span className="text-gray-700 font-mono text-right">{r.sourcePage || "Direct"}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-gray-400 font-semibold shrink-0">Complete</span>
                                  <span className={r.submissionComplete ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                                    {r.submissionComplete ? "Yes" : "Incomplete"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status History */}
                            <StatusHistory raw={r.statusHistory} />

                            {/* Raw JSON toggle */}
                            <RawJsonView data={r} />
                          </div>
                        </div>
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
      {showFormModal && <LoanFormModal loan={null} onSave={onCreateLoan} onClose={() => setShowFormModal(false)} />}
      {editingLoan && <LoanFormModal loan={editingLoan} onSave={onEditLoan} onClose={() => setEditingLoan(null)} />}
      {deletingLoan && <DeleteConfirmModal name={`${deletingLoan.firstName} ${deletingLoan.lastName}`} onConfirm={onDeleteLoan} onCancel={() => setDeletingLoan(null)} />}
    </TableShell>
  );
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────

export function TestimonialsTab() {
  const [rows, setRows] = useState<TestimonialSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchTestimonialSubmissions();
      setRows((data as any) ?? []);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onUpdateStatus = async (id: string, status: string) => {
    try {
      await updateTestimonialStatus({ data: { id, status } });
      setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Testimonial marked as ${status}`);
    } catch { toast.error("Failed to update status"); }
  };

  const filtered = rows.filter(r =>
    search === "" ||
    `${r.clientName} ${r.email} ${r.location}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TableShell title="Testimonial Submissions" count={rows.length} loading={loading} error={error} onRefresh={load}
      search={search} onSearch={setSearch}>
      <table className="min-w-full text-sm">
        <THead cols={["", "Name", "Email", "Location", "Scam", "Amount", "Rating", "Status", "Date"]} />
        <tbody className="divide-y divide-gray-100">
          {filtered.map(r => {
            const expanded = expandedId === r.id;
            return (
              <React.Fragment key={r.id}>
                <tr
                  className="hover:bg-gray-50 transition-colors align-top cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                >
                  <td className="pl-4 pr-2 py-3 text-gray-400 w-8">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{r.clientName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{r.location || "—"}</td>
                  <td className="px-4 py-3"><Chip text={r.scamType || "—"} /></td>
                  <td className="px-4 py-3 font-medium text-emerald-700">{r.amountRecovered || "—"}</td>
                  <td className="px-4 py-3 text-yellow-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                </tr>
                {expanded && (
                  <tr>
                    <td colSpan={9} className="bg-slate-50/50 px-4 py-4 border-b border-gray-100">
                      <div className="space-y-3">
                        {r.quote && (
                          <div className="p-3 bg-white rounded-lg border border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Testimonial Quote</p>
                            <p className="text-sm text-gray-700 italic leading-relaxed">"{r.quote}"</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Status</span>
                            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-100">
                              {[
                                { id: "pending", label: "Pending", cls: "hover:bg-amber-50 hover:text-amber-700" },
                                { id: "approved", label: "Approve", cls: "hover:bg-emerald-50 hover:text-emerald-700" },
                                { id: "rejected", label: "Reject", cls: "hover:bg-red-50 hover:text-red-700" },
                              ].map(s => (
                                <button
                                  key={s.id}
                                  onClick={(e) => { e.stopPropagation(); onUpdateStatus(r.id, s.id); }}
                                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                    r.status === s.id
                                      ? "bg-white shadow-sm border border-gray-200 text-slate-900"
                                      : `text-gray-400 ${s.cls}`
                                  }`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {!loading && filtered.length === 0 && <EmptyRow cols={9} msg="No submissions yet" />}
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
      const success = await saveSiteSettings(cfg);
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

// ─── StatusHistory ────────────────────────────────────────────────────────────

function StatusHistory({ raw }: { raw: string | null }) {
  let entries: StatusHistoryEntry[] = [];
  try { entries = JSON.parse(raw ?? "[]"); } catch { entries = []; }
  if (!entries.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status History</p>
      </div>
      <ol className="space-y-2">
        {entries.map((e, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px]">
            <div className="mt-0.5 w-2 h-2 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-gray-800 capitalize">
                {e.event === "identity_verified"
                  ? `Identity ${e.verified ? "verified" : "revoked"}`
                  : e.status?.replace(/_/g, " ")}
              </span>
              {e.reason && <span className="text-gray-500 ml-1">— {e.reason}</span>}
              <div className="text-[9px] text-gray-400 mt-0.5">
                {new Date(e.at).toLocaleString()} · by {e.by}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── RawJsonView ──────────────────────────────────────────────────────────────

function RawJsonView({ data }: { data: object }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5" />
          Raw JSON — Full Record
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <pre className="px-4 pb-4 text-[10px] text-emerald-400 font-mono leading-relaxed overflow-x-auto max-h-96 whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── DocImage — identity document thumbnail + lightbox ────────────────────────

// Resolve an R2 storage key to a renderable URL.
// Prefers the signed URL (served directly from Supabase Storage — zero Worker memory)
// and falls back to legacy in-DB data URLs.
// Cached per-src so re-expanding the same loan row doesn't trigger a new server call.
const assetCache = new Map<string, string | null>();

function useResolvedAsset(src: string | null): string | null {
  const [resolved, setResolved] = useState<string | null>(src && assetCache.get(src) !== undefined ? assetCache.get(src)! : null);

  useEffect(() => {
    if (!src) { setResolved(null); return; }
    if (src.startsWith("data:")) { setResolved(src); return; }
    if (assetCache.has(src)) { setResolved(assetCache.get(src) ?? null); return; }
    let cancelled = false;
    resolveLoanAsset({ data: src })
      .then((r) => {
        if (cancelled) return;
        // signedUrl is the preferred path — the browser fetches from Supabase directly
        const url = r?.signedUrl ?? r?.dataUrl ?? null;
        assetCache.set(src, url);
        setResolved(url);
      })
      .catch(() => { if (!cancelled) setResolved(null); });
    return () => { cancelled = true; };
  }, [src]);

  return resolved;
}

function DocImage({ label, icon, src }: { label: string; icon: React.ReactNode; src: string | null }) {
  const [open, setOpen] = useState(false);
  const resolved = useResolvedAsset(src);

  if (!src) {
    return (
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 bg-white min-h-[100px] justify-center">
        <div className="text-slate-300">{icon}</div>
        <span className="text-[10px] text-slate-400 text-center leading-tight">{label}</span>
        <span className="text-[9px] text-slate-300 uppercase tracking-wider">Not provided</span>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-slate-200 bg-slate-50 min-h-[100px] justify-center">
        <div className="text-slate-400 animate-pulse">{icon}</div>
        <span className="text-[10px] text-slate-400 text-center leading-tight">{label}</span>
        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Loading…</span>
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
          <img src={resolved} alt={label} className="w-full h-24 object-cover" />
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
            <img src={resolved} alt={label} className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain" />
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

// ─── DocVideo — video selfie thumbnail + player ──────────────────────────────

function DocVideo({ label, icon, src }: { label: string; icon: React.ReactNode; src: string | null }) {
  const [open, setOpen] = useState(false);
  const resolved = useResolvedAsset(src);

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
        <div className="relative bg-slate-900 flex items-center justify-center aspect-video h-24">
          <Video className="w-8 h-8 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute top-1 left-1 bg-red-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
            Video
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
          <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <video
              src={resolved ?? undefined}
              controls
              autoPlay
              className="w-full h-auto rounded-xl shadow-2xl bg-black"
            />
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

// ─── Messages Tab ───────────────────────────────────────────────────────────

export function MessagesTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [subject, setSubject] = useState("Important update regarding your recovery case");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!selectedUser || !message || !subject) {
      toast.error("Please select a user and enter a message");
      return;
    }

    setSending(true);
    try {
      const res = await sendAdminCustomMessage({
        data: {
          to: selectedUser.email,
          userName: selectedUser.fullName || selectedUser.email.split("@")[0],
          subject,
          message,
        }
      });
      if (res.success) {
        toast.success(`Message sent to ${selectedUser.email}`);
        setMessage("");
        setSelectedUser(null);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filtered = users.filter(u => 
    !search || 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.fullName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* User Selection */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Recipients
          </h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-8 text-center text-slate-300 animate-pulse font-bold text-xs uppercase">Syncing Users...</div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-300 font-bold text-xs uppercase">No users found</div>
            ) : filtered.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  selectedUser?.id === u.id 
                    ? "bg-primary/5 border-primary shadow-sm" 
                    : "bg-white border-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 uppercase">
                  {(u.fullName || u.email)[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{u.fullName || "Unnamed User"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                </div>
                {selectedUser?.id === u.id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 italic tracking-tight">Direct <span className="text-primary">Messaging</span></h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure Administrative Communication</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-black uppercase tracking-tighter">
                 SMTP Secure
               </div>
            </div>
          </div>

          <div className="p-8 flex-1 space-y-6">
            {!selectedUser ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-slate-200" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900">Select a Recipient</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1 font-medium">Choose a user from the list on the left to start composing a custom branded message.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Recipient</label>
                      <div className="h-12 px-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center text-xs font-bold text-slate-700">
                        {selectedUser.fullName ? `${selectedUser.fullName} (${selectedUser.email})` : selectedUser.email}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Subject</label>
                      <input 
                        type="text" value={subject} onChange={e => setSubject(e.target.value)}
                        placeholder="Subject..."
                        className="w-full h-12 px-4 rounded-2xl bg-white border border-slate-200 focus:border-primary outline-none text-xs font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                    <textarea 
                      value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Type your message here... The user will receive this in a professionally branded HTML email."
                      className="w-full min-h-[300px] p-5 rounded-3xl bg-white border border-slate-200 focus:border-primary outline-none text-sm font-medium leading-relaxed transition-all resize-none"
                    />
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supports plain text formatting only. Branding applied automatically.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                       <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sending From</p>
                      <p className="text-[11px] font-bold text-slate-600">no-reply@chanaidrecovery.com</p>
                    </div>
                  </div>
                  <button
                    disabled={sending || !message || !subject}
                    onClick={handleSend}
                    className="h-14 px-10 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-[0.95]"
                  >
                    {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {sending ? "TRANSMITTING..." : "SEND SECURE MESSAGE"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
