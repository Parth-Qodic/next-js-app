import { connectToDatabase } from "@/lib/mongodb";
import { AdminUser } from "@/lib/models";
import { getSession } from "@/lib/session";
import { hash } from "bcryptjs";

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
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      AdminUser.find(query, "-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AdminUser.countDocuments(query),
    ]);

    return Response.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Mongoose will automatically throw E11000 if email is not unique,
    // but we can manually check for a better error message.
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return Response.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await AdminUser.create({
      name,
      email,
      password: hashedPassword,
      role: role || "editor",
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return Response.json({ user: userObj }, { status: 201 });
  } catch (error: any) {
    // Handle Mongoose unique constraint error
    if (error.code === 11000) {
      return Response.json({ error: "Email already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
