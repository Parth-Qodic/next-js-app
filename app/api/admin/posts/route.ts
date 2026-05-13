import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/lib/models";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(query),
    ]);

    return Response.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, excerpt, status, tags } = body;

    if (!title || !content) {
      return Response.json({ error: "Title and content are required" }, { status: 400 });
    }

    await connectToDatabase();

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);

    const newPost = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || "",
      status: status || "draft",
      tags: tags || [],
      author: session.name,
      authorId: session.userId,
    });

    return Response.json({ post: newPost }, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
