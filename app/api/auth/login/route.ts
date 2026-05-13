import { connectToDatabase } from "@/lib/mongodb";
import { AdminUser } from "@/lib/models";
import { compare } from "bcryptjs";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await AdminUser.findOne({ email }).lean();

    if (!user) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.password as string);
    if (!isValid) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return Response.json({
      success: true,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
