import React from "react";
import { 
  RefreshCw, XCircle, ChevronUp, ChevronDown, 
  Clock, CheckCircle2, Copy, Check 
} from "lucide-react";

export function TableShell({ title, count, loading, error, onRefresh, search, onSearch, children }: {
  title: string; count: number; loading: boolean; error: string;
  onRefresh: () => void; search: string; onSearch: (s: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex flex-wrap items-center gap-4 border-b border-gray-100">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {!loading && !error && <p className="text-xs text-gray-400 mt-0.5">{count} record{count !== 1 ? "s" : ""}</p>}
        </div>
        <input
          type="search" placeholder="Search…" value={search} onChange={e => onSearch(e.target.value)}
          className="h-9 w-48 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-purple-400 transition"
        />
        <button onClick={onRefresh} disabled={loading}
          className="flex items-center gap-1.5 text-sm text-purple-600 font-medium hover:text-purple-800 disabled:opacity-50 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="bg-gray-50">
        {cols.map((c, i) => (
          <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{c}</th>
        ))}
      </tr>
    </thead>
  );
}

export function EmptyRow({ cols, msg }: { cols: number; msg: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-12 text-center text-gray-400 text-sm">{msg}</td>
    </tr>
  );
}

export function Chip({ text }: { text: string }) {
  return <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{text}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    new:              { label: "New",              cls: "bg-blue-50 text-blue-700 border-blue-200",     icon: <Clock className="w-3 h-3" /> },
    pending:          { label: "Pending",          cls: "bg-amber-50 text-amber-700 border-amber-200",  icon: <Clock className="w-3 h-3" /> },
    under_review:     { label: "Under Review",     cls: "bg-blue-50 text-blue-700 border-blue-200",     icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
    verified:         { label: "Verified",         cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    approved:         { label: "Approved",         cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected:         { label: "Rejected",         cls: "bg-red-50 text-red-600 border-red-200",        icon: <XCircle className="w-3 h-3" /> },
    needs_correction: { label: "Needs Correction", cls: "bg-purple-50 text-purple-700 border-purple-200", icon: <XCircle className="w-3 h-3" /> },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

export function DetailSection({ title, children, className = "", onCopyAll }: { title: string; children: React.ReactNode; className?: string; onCopyAll?: () => void }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
        {onCopyAll && (
          <button 
            onClick={onCopyAll}
            className="text-[9px] font-bold text-purple-600 hover:text-purple-800 uppercase tracking-tighter flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded"
          >
            <Copy className="w-2.5 h-2.5" /> Copy All
          </button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function DField({ label, value, mono = false, icon, className = "", dark = false }: { label: string; value: string | number | null | undefined; mono?: boolean; icon?: React.ReactNode; className?: string; dark?: boolean }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-0.5">
        <p className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${dark ? "text-slate-500" : "text-gray-400"}`}>
          {icon} {label}
        </p>
        {value && (
          <button 
            onClick={handleCopy}
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${dark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            title="Copy to clipboard"
          >
            {copied ? <Check className={`w-3 h-3 ${dark ? "text-emerald-400" : "text-emerald-500"}`} /> : <Copy className={`w-3 h-3 ${dark ? "text-slate-500" : "text-gray-400"}`} />}
          </button>
        )}
      </div>
      <p className={`text-sm font-semibold break-all leading-tight ${mono ? "font-mono text-[14px] tracking-tight" : ""} ${dark ? "text-slate-100" : "text-gray-900"} ${className}`}>
        {value ?? "—"}
      </p>
      {copied && (
        <span className={`absolute -top-6 right-0 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-in fade-in slide-in-from-bottom-1 ${dark ? "bg-emerald-500 text-white" : "bg-emerald-600 text-white"}`}>
          Copied!
        </span>
      )}
    </div>
  );
}
