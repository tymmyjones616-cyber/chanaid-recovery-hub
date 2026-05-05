import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  UserPlus, Trash2, Pencil, X, Phone, Mail,
  Shield, User, Eye, EyeOff, Search, RefreshCw
} from "lucide-react";
import {
  adminListUsers,
  adminCreateUser,
  adminDeleteUser,
  adminUpdateUser,
} from "@/lib/queries";

type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  lastSignIn: string | null;
  confirmed: boolean;
};

type UserFormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function UserModal({
  initial,
  onSave,
  onClose,
  isLoading,
}: {
  initial?: Partial<AdminUser>;
  onSave: (data: UserFormData) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<UserFormData>({
    fullName: initial?.fullName || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    password: "",
    role: initial?.role || "user",
  });
  const [showPw, setShowPw] = useState(false);
  const isEdit = !!initial?.id;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-slate-900 mb-1">
          {isEdit ? "Edit User" : "Add New User"}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mb-6">
          {isEdit ? "Update user details below." : "Create a new account with immediate access."}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" required placeholder="John Doe" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-400 focus:bg-white outline-none text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" required placeholder="user@example.com" value={form.email}
                disabled={isEdit}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-400 focus:bg-white outline-none text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel" placeholder="+1 555 000 0000" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-400 focus:bg-white outline-none text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
              {isEdit ? "New Password" : "Password *"}
              {isEdit && <span className="ml-1 normal-case text-slate-300 font-semibold">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPw ? "text" : "password"} placeholder="••••••••" value={form.password}
                required={!isEdit}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-400 focus:bg-white outline-none text-sm font-semibold"
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-400 outline-none text-sm font-semibold"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          disabled={isLoading || !form.fullName || !form.email || (!isEdit && !form.password)}
          onClick={() => onSave(form)}
          className="mt-6 w-full py-3.5 rounded-2xl font-black text-white text-sm disabled:opacity-50 active:scale-[0.98] transition-all"
          style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
        >
          {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
        </button>
      </div>
    </div>
  );
}

export function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "create" | AdminUser>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListUsers();
      setUsers(
        (data as AdminUser[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || "").includes(search)
  );

  const handleCreate = async (form: UserFormData) => {
    setSaving(true);
    try {
      const res: any = await adminCreateUser({ data: form });
      if (res?.error) throw new Error(res.error.message);
      toast.success("User created successfully");
      setModal(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form: UserFormData) => {
    if (!modal || modal === "create") return;
    setSaving(true);
    try {
      const res: any = await adminUpdateUser({ data: { userId: (modal as AdminUser).id, ...form } });
      if (res?.error) throw new Error(res.error.message);
      toast.success("User updated");
      setModal(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    setSaving(true);
    try {
      const res: any = await adminDeleteUser({ data: { userId: u.id } });
      if (res?.error) throw new Error(res.error.message);
      toast.success("User deleted");
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">User Management</h2>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">{users.length} registered accounts</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search users…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold focus:border-violet-400 outline-none shadow-sm"
            />
          </div>
          <button
            onClick={() => setModal("create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile cards / Desktop table */}
      <div className="block sm:hidden space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-300 font-bold">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-300 font-bold">No users found</div>
        ) : filtered.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                  style={{ background: u.role === "admin" ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "linear-gradient(135deg,#0f172a,#334155)" }}
                >
                  {(u.fullName || u.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{u.fullName || <span className="text-slate-300 italic">No name</span>}</div>
                  <div className="text-xs text-slate-400 truncate">{u.email}</div>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setModal(u)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-violet-600 transition-colors text-slate-500"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(u)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors text-slate-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${u.role === "admin" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                {u.role === "admin" && <Shield className="w-2.5 h-2.5" />} {u.role}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${u.confirmed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${u.confirmed ? "bg-emerald-500" : "bg-amber-500"}`} />
                {u.confirmed ? "Verified" : "Pending"}
              </span>
              {u.phone && <span className="text-slate-400">{u.phone}</span>}
            </div>
            <div className="mt-2 text-[10px] text-slate-300 font-semibold">
              Joined {fmtDate(u.createdAt)} · Last seen {u.lastSignIn ? fmtDate(u.lastSignIn) : "Never"}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Sign-in</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-300 font-bold">Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-300 font-bold">No users found</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/20"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                        style={{ background: u.role === "admin" ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "linear-gradient(135deg,#0f172a,#334155)" }}
                      >
                        {(u.fullName || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{u.fullName || <span className="text-slate-300 italic">No name</span>}</div>
                        <div className="text-xs text-slate-400 font-semibold">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-semibold">{u.phone || <span className="text-slate-300">—</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === "admin" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {u.role === "admin" && <Shield className="w-3 h-3" />} {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.confirmed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.confirmed ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {u.confirmed ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-semibold whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-semibold whitespace-nowrap">{u.lastSignIn ? fmtDate(u.lastSignIn) : <span className="text-slate-200">Never</span>}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setModal(u)} className="p-2 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-violet-600 transition-colors text-slate-500" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(u)} className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors text-slate-500" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modal !== null && (
        <UserModal
          initial={modal === "create" ? undefined : (modal as AdminUser)}
          onSave={modal === "create" ? handleCreate : handleUpdate}
          onClose={() => setModal(null)}
          isLoading={saving}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Delete User?</h3>
            <p className="text-sm text-slate-400 text-center font-semibold mb-6">
              <strong className="text-slate-700">{confirmDelete.fullName || confirmDelete.email}</strong> will be permanently removed and cannot sign in again.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl font-black text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={saving} className="flex-1 py-3 rounded-xl font-black text-sm text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
