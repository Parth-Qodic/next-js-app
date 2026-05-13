import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import type { AdminUser } from "@/lib/models";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

async function getUsers(page: number, search: string) {
  const limit = 10;
  const skip = (page - 1) * limit;
  const db = await getDb();
  const col = db.collection<AdminUser>(COLLECTIONS.ADMIN_USERS);
  const filter = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {};
  const [users, total] = await Promise.all([
    col.find(filter, { projection: { password: 0 } }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);
  return {
    users: users.map((u) => ({ ...u, _id: u._id.toString(), createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export default async function UsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const { users, pagination } = await getUsers(page, search);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage admin users and their roles</p>
      </div>
      <UsersClient users={users} pagination={pagination} currentSearch={search} />
    </div>
  );
}
