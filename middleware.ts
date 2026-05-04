import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;

  // No session — send to sign in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const payload = await verifyToken(token);

  // Invalid or expired token — send to sign in
  if (!payload) {
    const response = NextResponse.redirect(new URL("/auth/signin", req.url));
    response.cookies.delete("session");
    return response;
  }

  // Non-admin trying to access admin dashboard — send to their dashboard
  if (pathname.startsWith("/dashboard/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/user", req.url));
  }

  // Admin trying to access user dashboard — redirect to admin dashboard
  if (pathname.startsWith("/dashboard/user") && payload.role === "admin") {
    return NextResponse.redirect(new URL("/dashboard/admin", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
