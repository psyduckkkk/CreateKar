import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const users = await query<{
      id: string;
      email: string;
      password_hash: string;
      role: "CREATOR" | "AGENCY" | "ADMIN" | "SUPER_ADMIN";
      name: string;
      status: string;
    }>(
      "SELECT id, email, password_hash, role, name, status FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = users[0];

    // Check account status (e.g. if banned or suspended by admin)
    if (user.status === "BANNED") {
      return NextResponse.json(
        { error: "This account has been banned due to compliance or terms violations. Please contact support@createkar.com." },
        { status: 403 }
      );
    }
    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "This account is temporarily suspended pending verification. Please contact support@createkar.com." },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Sign session token
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    let redirectUrl = "/dashboard";
    if (user.role === "AGENCY") {
      redirectUrl = "/agency/dashboard";
    } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      redirectUrl = "/admin";
    }

    const response = NextResponse.json({
      success: true,
      role: user.role,
      redirectUrl,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during login." }, { status: 500 });
  }
}
