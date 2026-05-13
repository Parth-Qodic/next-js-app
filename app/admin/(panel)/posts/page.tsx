import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import type { Post } from "@/lib/models";
import PostsClient from "./PostsClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

async function getPosts(page: number, search: string, status: string) {
  const limit = 10;
  const skip = (page - 1) * limit;
  const db = await getDb();
  const col = db.collection<Post>(COLLECTIONS.POSTS);
  const filter: Record<string, unknown> = {};
  if (search) { filter.$or = [{ title: { $regex: search, $options: "i" } }, { author: { $regex: search, $options: "i" } }]; }
  if (status === "draft" || status === "published") { filter.status = status; }
  const [posts, total] = await Promise.all([
    col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);
  return {
    posts: posts.map((p) => ({ ...p, _id: p._id.toString(), createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export default async function PostsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const status = sp.status || "";
  const { posts, pagination } = await getPosts(page, search, status);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white tracking-tight">Posts</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage blog posts and articles</p>
      </div>
      <PostsClient posts={posts} pagination={pagination} currentSearch={search} currentStatus={status} />
    </div>
  );
}
