import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const res = await query(
      `SELECT u.id, u.name, u.email, ap.company_name, ap.brand_name
       FROM users u
       JOIN agency_profiles ap ON u.id = ap.user_id
       WHERE u.role = 'AGENCY' AND u.status = 'ACTIVE'
       ORDER BY COALESCE(ap.company_name, u.name) ASC
       LIMIT 50`
    );

    return NextResponse.json({ success: true, agencies: res.rows || [] });
  } catch (error) {
    console.error("Fetch registered agencies error:", error);
    return NextResponse.json({ error: "Failed to load agencies" }, { status: 500 });
  }
}
