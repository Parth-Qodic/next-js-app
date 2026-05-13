import { connectToDatabase } from "@/lib/mongodb";
import { AdminUser } from "@/lib/models";
import { getSession } from "@/lib/session";
import { hash } from "bcryptjs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    await connectToDatabase();

    // Check if email already exists for another user
    if (email) {
      const existing = await AdminUser.findOne({ email, _id: { $ne: id } });
      if (existing) {
        return Response.json({ error: "Email already exists" }, { status: 409 });
      }
    }

    const updateData: any = { name, email, role };
    if (password) {
      updateData.password = await hash(password, 12);
    }

    const updatedUser = await AdminUser.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, select: "-password" }
    ).lean();

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user: updatedUser });
  } catch (error: any) {
    if (error.code === 11000) {
      return Response.json({ error: "Email already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent deleting oneself
    if (session.userId === id) {
      return Response.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await connectToDatabase();
    const result = await AdminUser.findByIdAndDelete(id);

    if (!result) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
