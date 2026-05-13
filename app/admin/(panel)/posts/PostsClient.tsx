"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

interface Post { _id: string; title: string; slug: string; content: string; excerpt: string; status: string; author: string; tags: string[]; createdAt: string; }
interface Pagination { page: number; limit: number; total: number; totalPages: number; }
interface Props { posts: Post[]; pagination: Pagination; currentSearch: string; currentStatus: string; }

export default function PostsClient({ posts, pagination, currentSearch, currentStatus }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", excerpt: "", status: "draft", tags: "" });
  const [saving, setSaving] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (currentStatus) params.set("status", currentStatus);
    router.push(`/admin/posts?${params.toString()}`);
  }

  function filterStatus(status: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    router.push(`/admin/posts?${params.toString()}`);
  }

  function openCreate() { setEditingPost(null); setFormData({ title: "", content: "", excerpt: "", status: "draft", tags: "" }); setShowModal(true); }
  function openEdit(row: Record<string, unknown>) {
    const post = row as unknown as Post;
    setEditingPost(post);
    setFormData({ title: post.title, content: post.content, excerpt: post.excerpt, status: post.status, tags: Array.isArray(post.tags) ? post.tags.join(", ") : "" });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const url = editingPost ? `/api/admin/posts/${editingPost._id}` : "/api/admin/posts";
      const method = editingPost ? "PUT" : "POST";
      const body = { title: formData.title, content: formData.content, excerpt: formData.excerpt, status: formData.status, tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setShowModal(false); router.refresh(); } else { const data = await res.json(); alert(data.error || "Failed to save"); }
    } catch { alert("Failed to save"); }
    setSaving(false);
  }

  const columns = [
    { key: "title", label: "Title", render: (_: unknown, row: Record<string, unknown>) => (<div><p className="font-medium text-zinc-200">{row.title as string}</p><p className="text-xs text-zinc-600 mt-0.5">{row.slug as string}</p></div>) },
    { key: "author", label: "Author" },
    { key: "status", label: "Status", render: (val: unknown) => <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${val === "published" ? "status-published" : "status-draft"}`}>{val as string}</span> },
    { key: "tags", label: "Tags", render: (val: unknown) => { const tags = val as string[]; return (<div className="flex gap-1 flex-wrap">{tags?.slice(0, 2).map((tag) => (<span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-zinc-400 border border-white/[0.06]">{tag}</span>))}{tags?.length > 2 && <span className="text-[10px] text-zinc-600">+{tags.length - 2}</span>}</div>); } },
    { key: "createdAt", label: "Created", render: (val: unknown) => new Date(val as string).toLocaleDateString() },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in">
        <div className="flex gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..."
              className="admin-input flex-1 sm:w-60 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-600 transition-all" />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 hover:bg-white/[0.08] transition-all">Search</button>
          </form>
          <div className="flex gap-1">
            {["", "published", "draft"].map((s) => (
              <button key={s} onClick={() => filterStatus(s)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${currentStatus === s ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-zinc-500 hover:bg-white/[0.05] border border-transparent"}`}>{s || "All"}</button>
            ))}
          </div>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all whitespace-nowrap">+ New Post</button>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <DataTable columns={columns} data={posts as unknown as Record<string, unknown>[]} deleteEndpoint="/api/admin/posts" onEdit={openEdit} />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-sm text-zinc-500">Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => { const params = new URLSearchParams(); params.set("page", String(p)); if (currentSearch) params.set("search", currentSearch); if (currentStatus) params.set("status", currentStatus); router.push(`/admin/posts?${params.toString()}`); }}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === pagination.page ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-zinc-500 hover:bg-white/[0.05]"}`}>{p}</button>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPost ? "Edit Post" : "Create Post"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Content</label>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required rows={4} className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm resize-none" /></div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Excerpt</label>
            <input type="text" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm">
                <option value="draft" className="bg-zinc-900">Draft</option><option value="published" className="bg-zinc-900">Published</option></select></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tags (comma separated)</label>
              <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="tag1, tag2" className="admin-input w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-zinc-400 hover:bg-white/[0.03] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all">{saving ? "Saving..." : editingPost ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
