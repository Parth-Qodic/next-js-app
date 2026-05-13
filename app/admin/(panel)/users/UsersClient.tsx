"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/store";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

interface User { _id: string; name: string; email: string; role: string; createdAt: string; }
interface Pagination { page: number; limit: number; total: number; totalPages: number; }
interface Props { users: User[]; pagination: Pagination; currentSearch: string; }

export default function UsersClient({ users, pagination, currentSearch }: Props) {
  const router = useRouter();
  const currentUser = useAdminStore((state) => state.user);
  const [search, setSearch] = useState(currentSearch);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "editor" });
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); router.push(`/admin/users?search=${encodeURIComponent(search)}`); }
  function openCreate() { setEditingUser(null); setFormData({ name: "", email: "", password: "", role: "editor" }); setShowModal(true); }
  function openEdit(row: Record<string, unknown>) {
    const user = row as unknown as User;
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingUser ? `/api/admin/users/${editingUser._id}` : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      const body: Record<string, string> = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) body.password = formData.password;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setShowModal(false); router.refresh(); }
      else { const data = await res.json(); alert(data.error || "Failed to save"); }
    } catch { alert("Failed to save"); }
    setSaving(false);
  }

  const columns = [
    {
      key: "name", label: "Name",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-white/10">
            <span className="text-xs font-medium text-indigo-300">{(row.name as string)?.charAt(0)}</span>
          </div>
          <span className="font-medium">{row.name as string}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (val: unknown) => <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${val === "admin" ? "status-admin" : "status-editor"}`}>{val as string}</span> },
    { key: "createdAt", label: "Created", render: (val: unknown) => new Date(val as string).toLocaleDateString() },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="admin-input flex-1 sm:w-72 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-600 transition-all" />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 hover:bg-white/[0.08] transition-all">Search</button>
        </form>
        <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all">+ Add User</button>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <DataTable 
          columns={columns} 
          data={users as unknown as Record<string, unknown>[]} 
          deleteEndpoint="/api/admin/users" 
          onEdit={openEdit} 
          canDelete={mounted ? currentUser?.role === "admin" : false}
        />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-sm text-zinc-500">Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => router.push(`/admin/users?page=${p}&search=${encodeURIComponent(currentSearch)}`)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === pagination.page ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-zinc-500 hover:bg-white/[0.05]"}`}>{p}</button>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? "Edit User" : "Create User"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password {editingUser && "(leave blank to keep)"}</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} {...(!editingUser ? { required: true } : {})} className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm">
              <option value="editor" className="bg-zinc-900">Editor</option><option value="admin" className="bg-zinc-900">Admin</option></select></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-zinc-400 hover:bg-white/[0.03] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all">{saving ? "Saving..." : editingUser ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
