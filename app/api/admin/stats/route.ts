import { connectToDatabase } from "@/lib/mongodb";
import { AdminUser, Post } from "@/lib/models";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const [totalUsers, totalPosts, publishedPosts, draftPosts, recentUsers, recentPosts] =
    await Promise.all([
      AdminUser.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      AdminUser.find({}, "-password").sort({ createdAt: -1 }).limit(5).lean(),
      Post.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return Response.json({
    totalUsers,
    totalPosts,
    publishedPosts,
    draftPosts,
    recentUsers,
    recentPosts,
  });
}
