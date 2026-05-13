"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  deleteEndpoint?: string;
  onEdit?: (row: Record<string, unknown>) => void;
  idKey?: string;
  canDelete?: boolean;
}

export default function DataTable({ columns, data, deleteEndpoint, onEdit, idKey = "_id", canDelete = true }: DataTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!deleteEndpoint || !confirm("Are you sure you want to delete this item?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${deleteEndpoint}/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Failed to delete");
    } catch { alert("Failed to delete"); }
    setDeletingId(null);
  }

  if (data.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-zinc-500 text-sm">No data found</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{col.label}</th>
              ))}
              {(deleteEndpoint || onEdit) && (
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {data.map((row, i) => {
              const id = String(row[idKey] ?? i);
              return (
                <tr key={id} className="table-row-hover">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                  {(deleteEndpoint || onEdit) && (
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all">
                          Edit
                        </button>
                      )}
                      {deleteEndpoint && canDelete && (
                        <button onClick={() => handleDelete(id)} disabled={deletingId === id} className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all disabled:opacity-50">
                          {deletingId === id ? "..." : "Delete"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
