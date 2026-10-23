import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("SECURITY ALERT: AUTH_SECRET environment variable is missing in production.");
}

const JWT_SECRET_STRING = process.env.AUTH_SECRET || "createkar_fallback_secret_key_minimum_32_chars_xyz";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "ck_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: { userId: string; email: string; role: string; name: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as any;
    } catch (err) {
      // Invalid or expired token
      session = null;
    }
  }

  // 1. If logged in and visiting auth pages (/login, /signup), redirect to home dashboard
  if (session && (pathname === "/login" || pathname === "/signup")) {
    if (session.role === "CREATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.role === "AGENCY") {
      return NextResponse.redirect(new URL("/agency/dashboard", request.url));
    }
    if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 2. Protected API Route Gates (Defense-in-depth JSON rejection)
  const isCreatorApi = pathname.startsWith("/api/creator");
  const isAgencyApi = pathname.startsWith("/api/agency");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isCreatorApi || isAgencyApi || isAdminApi) {
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (isAgencyApi && session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Agency role required" }, { status: 403 });
    }
    if (isCreatorApi && session.role !== "CREATOR" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Creator role required" }, { status: 403 });
    }
    if (isAdminApi && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }
  }

  // 3. Protected UI Route Gates
  const isCreatorRoute = pathname.startsWith("/dashboard");
  const isAgencyRoute = pathname.startsWith("/agency");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isCreatorRoute || isAgencyRoute || isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific restrictions:
    // A) Creator cannot access agency portal
    if (isAgencyRoute && session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // B) Agency cannot access creator private workspace
    if (isCreatorRoute && session.role !== "CREATOR" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/agency/dashboard", request.url));
    }

    // C) Only ADMIN/SUPER_ADMIN can access admin console
    if (isAdminRoute && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/agency/:path*",
    "/admin/:path*",
    "/api/creator/:path*",
    "/api/agency/:path*",
    "/api/admin/:path*",
    "/login",
    "/signup",
  ],
};
