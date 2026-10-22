import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    const res = await query(
      `SELECT d.*,
              c.contract_number, c.title AS contract_title, c.gross_amount_inr,
              c.balance_amount_inr, c.status AS contract_status, c.payment_mode,
              u.name AS creator_name, u.email AS creator_email,
              cp.instagram_handle, cp.youtube_handle, cp.badge_type AS creator_badge_type
       FROM deliverables d
       JOIN contracts c ON d.contract_id = c.id
       JOIN users u ON c.creator_id = u.id
       LEFT JOIN creator_profiles cp ON u.id = cp.user_id
       WHERE c.agency_id = $1
       ORDER BY d.created_at DESC`,
      [session.userId]
    );

    return NextResponse.json({ deliverables: res.rows });
  } catch (err: any) {
    console.error("Agency deliverables error:", err);
    return NextResponse.json({ error: "Failed to fetch deliverables" }, { status: 500 });
  }
}
