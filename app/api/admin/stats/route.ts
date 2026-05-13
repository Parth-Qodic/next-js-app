import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();

  const [totalUsers, totalPosts, publishedPosts, draftPosts, recentUsers, recentPosts] =
    await Promise.all([
      db.collection(COLLECTIONS.ADMIN_USERS).countDocuments(),
      db.collection(COLLECTIONS.POSTS).countDocuments(),
      db.collection(COLLECTIONS.POSTS).countDocuments({ status: "published" }),
      db.collection(COLLECTIONS.POSTS).countDocuments({ status: "draft" }),
      db
        .collection(COLLECTIONS.ADMIN_USERS)
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      db
        .collection(COLLECTIONS.POSTS)
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
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
