import { type NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import type { AdminUser } from "@/lib/models";
import { hash } from "bcryptjs";
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
  const skip = (page - 1) * limit;

  const db = await getDb();
  const collection = db.collection<AdminUser>(COLLECTIONS.ADMIN_USERS);

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    collection
      .find(filter, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return Response.json({
    users,
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
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<AdminUser>(COLLECTIONS.ADMIN_USERS);

    // Check if email already exists
    const existing = await collection.findOne({ email });
    if (existing) {
      return Response.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const now = new Date();

    const result = await collection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: role || "editor",
      createdAt: now,
      updatedAt: now,
    });

    return Response.json(
      {
        success: true,
        user: {
          _id: result.insertedId,
          name,
          email,
          role: role || "editor",
          createdAt: now,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
