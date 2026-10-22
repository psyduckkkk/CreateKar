import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const deliverables = await query(
      `SELECT d.*, c.title as contract_title, c.contract_number, c.payment_mode,
              u.name as agency_name, a.company_name
       FROM deliverables d
       JOIN contracts c ON d.contract_id = c.id
       JOIN users u ON c.agency_id = u.id
       JOIN agency_profiles a ON c.agency_id = a.user_id
       WHERE c.creator_id = $1
       ORDER BY d.deadline ASC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, deliverables });
  } catch (error) {
    console.error("Fetch creator deliverables error:", error);
    return NextResponse.json({ error: "Failed to load deliverables" }, { status: 500 });
  }
}
