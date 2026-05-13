import { connectToDatabase } from "@/lib/mongodb";
import { AdminUser } from "@/lib/models";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

async function getUsers(page: number, search: string) {
  const limit = 10;
  const skip = (page - 1) * limit;
  await connectToDatabase();
  
  const filter = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {};
    
  const [users, total] = await Promise.all([
    AdminUser.find(filter, "-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AdminUser.countDocuments(filter),
  ]);
  
  return {
    users: users.map((u: any) => ({ ...u, _id: u._id.toString(), createdAt: u.createdAt?.toISOString(), updatedAt: u.updatedAt?.toISOString() })),
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
