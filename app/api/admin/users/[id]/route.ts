import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import type { AdminUser } from "@/lib/models";
import { hash } from "bcryptjs";
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
  const user = await db
    .collection<AdminUser>(COLLECTIONS.ADMIN_USERS)
    .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ user });
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

    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    if (body.password) updateData.password = await hash(body.password, 12);

    const db = await getDb();
    const result = await db
      .collection<AdminUser>(COLLECTIONS.ADMIN_USERS)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after", projection: { password: 0 } }
      );

    if (!result) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ success: true, user: result });
  } catch (error) {
    console.error("Update user error:", error);
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
    .collection<AdminUser>(COLLECTIONS.ADMIN_USERS)
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
