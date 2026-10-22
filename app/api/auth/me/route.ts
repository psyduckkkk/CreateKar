import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const users = await query(
      "SELECT id, email, role, name, phone, status, created_at FROM users WHERE id = $1",
      [session.userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = users[0];
    let profile = null;

    if (user.role === "CREATOR") {
      const creatorRows = await query(
        "SELECT * FROM creator_profiles WHERE user_id = $1",
        [user.id]
      );
      profile = creatorRows[0] || null;
    } else if (user.role === "AGENCY") {
      const agencyRows = await query(
        "SELECT * FROM agency_profiles WHERE user_id = $1",
        [user.id]
      );
      profile = agencyRows[0] || null;
    }

    return NextResponse.json({
      authenticated: true,
      user,
      profile,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Failed to fetch user session" }, { status: 500 });
  }
}
