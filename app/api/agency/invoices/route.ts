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
      `SELECT inv.*,
              c.contract_number, c.title AS contract_title, c.tds_section, c.tds_amount_inr,
              c.payment_mode,
              u.name AS creator_name, u.email AS creator_email,
              cp.gstin AS creator_gstin, cp.plan_tier AS creator_tier,
              ap.company_name, ap.gstin AS agency_gstin, ap.billing_address
       FROM invoices inv
       JOIN contracts c ON inv.contract_id = c.id
       JOIN users u ON inv.creator_id = u.id
       LEFT JOIN creator_profiles cp ON u.id = cp.user_id
       LEFT JOIN agency_profiles ap ON inv.agency_id = ap.user_id
       WHERE inv.agency_id = $1
       ORDER BY inv.issued_at DESC`,
      [session.userId]
    );

    return NextResponse.json({ invoices: res.rows });
  } catch (err: any) {
    console.error("Agency invoices error:", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
