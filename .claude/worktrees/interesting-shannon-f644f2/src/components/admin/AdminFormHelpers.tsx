import React from "react";

export function SField({
  label, value, onChange, hint, type = "text", textarea = false, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  hint?: string; type?: string; textarea?: boolean; className?: string;
}) {
  const base = "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition bg-white";
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={`${base} resize-y`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className={base} />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function ColorField({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-11 w-14 rounded-xl border border-gray-200 p-1 cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 h-11 rounded-xl border border-gray-200 px-3.5 text-sm font-mono focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition" />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
