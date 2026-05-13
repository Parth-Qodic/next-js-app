import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import type { Post } from "@/lib/models";
import { getSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const db = await getDb();
  const post = await db
    .collection<Post>(COLLECTIONS.POSTS)
    .findOne({ _id: new ObjectId(id) });

  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  return Response.json({ post });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.title) {
      updateData.title = body.title;
      updateData.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (body.content) updateData.content = body.content;
    if (body.excerpt) updateData.excerpt = body.excerpt;
    if (body.status) updateData.status = body.status;
    if (body.tags) updateData.tags = body.tags;

    const db = await getDb();
    const result = await db
      .collection<Post>(COLLECTIONS.POSTS)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

    if (!result) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json({ success: true, post: result });
  } catch (error) {
    console.error("Update post error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db
    .collection<Post>(COLLECTIONS.POSTS)
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
