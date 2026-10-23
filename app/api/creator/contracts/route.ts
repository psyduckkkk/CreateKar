import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const contracts = await query(
      `SELECT c.*,
              COALESCE(a.company_name, c.client_company, u.name, 'Client Agency') as company_name,
              COALESCE(u.name, c.client_name, 'Agency Representative') as agency_name,
              COALESCE(a.gstin, '') as agency_gstin,
              json_agg(
                json_build_object(
                  'id', d.id,
                  'type', d.type,
                  'deadline', d.deadline,
                  'status', d.status,
                  'submission_url', d.submission_url,
                  'revision_count', d.revision_count
                )
              ) FILTER (WHERE d.id IS NOT NULL) as deliverables
       FROM contracts c
       LEFT JOIN users u ON c.agency_id = u.id
       LEFT JOIN agency_profiles a ON c.agency_id = a.user_id
       LEFT JOIN deliverables d ON c.id = d.contract_id
       WHERE c.creator_id = $1
       GROUP BY c.id, u.name, a.company_name, a.gstin
       ORDER BY c.created_at DESC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, contracts });
  } catch (error) {
    console.error("Fetch creator contracts error:", error);
    return NextResponse.json({ error: "Failed to load contracts" }, { status: 500 });
  }
}
