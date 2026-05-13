import { type NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import type { Post } from "@/lib/models";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const skip = (page - 1) * limit;

  const db = await getDb();
  const collection = db.collection<Post>(COLLECTIONS.POSTS);

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
  }
  if (status && (status === "draft" || status === "published")) {
    filter.status = status;
  }

  const [posts, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return Response.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, excerpt, status, tags } = body;

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const db = await getDb();
    const collection = db.collection<Post>(COLLECTIONS.POSTS);

    // Check for duplicate slug
    const existing = await collection.findOne({ slug });
    if (existing) {
      return Response.json(
        { error: "A post with a similar title already exists" },
        { status: 409 }
      );
    }

    const now = new Date();
    const result = await collection.insertOne({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150),
      status: status || "draft",
      author: session.name,
      authorId: session.userId,
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    });

    return Response.json(
      {
        success: true,
        post: {
          _id: result.insertedId,
          title,
          slug,
          status: status || "draft",
          createdAt: now,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
