import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/lib/models";
import { getSession } from "@/lib/session";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, excerpt, status, tags } = body;

    await connectToDatabase();

    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Only allow editors to update their own posts
    if (session.role === "editor" && existingPost.authorId !== session.userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = { content, excerpt, status, tags };

    if (title && title !== existingPost.title) {
      updateData.title = title;
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    return Response.json({ post: updatedPost });
  } catch (error) {
    return Response.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (session.role !== "admin") {
      return Response.json({ error: "Forbidden: Only admins can delete posts" }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
