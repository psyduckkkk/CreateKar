import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      role,
      name,
      phone,
      // Creator fields
      niche,
      instagramHandle,
      youtubeHandle,
      upiId,
      // Agency fields
      companyName,
      brandName,
      gstin,
      tan,
    } = body;

    // Validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Full legal or business name is required." }, { status: 400 });
    }
    if (!["CREATOR", "AGENCY"].includes(role)) {
      return NextResponse.json({ error: "Please select a valid account role (Creator or Agency)." }, { status: 400 });
    }

    // Check existing email
    const existingUsers = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "An account with this email address already exists." }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    // Insert user
    const userResult = await query<{ id: string }>(
      `INSERT INTO users (email, password_hash, role, name, phone, status)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
       RETURNING id`,
      [email.toLowerCase().trim(), hashedPassword, role, name.trim(), phone || null]
    );

    const userId = userResult[0].id;

    // Insert role-specific profile
    if (role === "CREATOR") {
      await query(
        `INSERT INTO creator_profiles (
          user_id, niche, instagram_handle, youtube_handle, upi_id, plan_tier, badge_type, contracts_created_count
        ) VALUES ($1, $2, $3, $4, $5, 'basic', 'none', 0)`,
        [userId, niche || "General", instagramHandle || null, youtubeHandle || null, upiId || null]
      );
    } else {
      await query(
        `INSERT INTO agency_profiles (
          user_id, company_name, brand_name, gstin, tan, plan_tier, creator_search_limit
        ) VALUES ($1, $2, $3, $4, $5, 'basic', 5)`,
        [userId, companyName || name.trim(), brandName || null, gstin || null, tan || null]
      );
    }

    // Sign session token
    const token = await signSessionToken({
      userId,
      email: email.toLowerCase().trim(),
      role,
      name: name.trim(),
    });

    const redirectUrl = role === "CREATOR" ? "/dashboard" : "/agency/dashboard";

    const response = NextResponse.json({
      success: true,
      role,
      redirectUrl,
      user: { id: userId, email, role, name },
    });

    // Set HttpOnly Secure session cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during registration. Please try again." }, { status: 500 });
  }
}
