import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: "/admin/:path*",
};

const encodedKey = new TextEncoder().encode(
  process.env.SESSION_SECRET || ""
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the login page without auth
  if (pathname === "/admin/login") {
    // If already authenticated, redirect to dashboard
    const sessionCookie = request.cookies.get("session");
    if (sessionCookie?.value) {
      try {
        await jwtVerify(sessionCookie.value, encodedKey, {
          algorithms: ["HS256"],
        });
        return NextResponse.redirect(
          new URL("/admin/dashboard", request.url)
        );
      } catch {
        // Invalid session, let them access login
      }
    }
    return NextResponse.next();
  }

  // For all other admin routes, verify the session
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(sessionCookie.value, encodedKey, {
      algorithms: ["HS256"],
    });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}
