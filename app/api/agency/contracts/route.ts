import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    const contractsRes = await query(
      `SELECT c.*,
              u.name AS creator_name, u.email AS creator_email,
              cp.niche, cp.instagram_handle, cp.youtube_handle, cp.upi_id AS creator_upi_id,
              cp.badge_type AS creator_badge_type
       FROM contracts c
       JOIN users u ON c.creator_id = u.id
       LEFT JOIN creator_profiles cp ON u.id = cp.user_id
       WHERE c.agency_id = $1
       ORDER BY c.created_at DESC`,
      [session.userId]
    );

    // Fetch deliverables for each contract
    const contractIds = contractsRes.rows.map((c: any) => c.id);
    let deliverablesMap: Record<string, any[]> = {};

    if (contractIds.length > 0) {
      const delRes = await query(
        `SELECT * FROM deliverables WHERE contract_id = ANY($1) ORDER BY deadline ASC`,
        [contractIds]
      );
      for (const d of delRes.rows) {
        if (!deliverablesMap[d.contract_id]) {
          deliverablesMap[d.contract_id] = [];
        }
        deliverablesMap[d.contract_id].push(d);
      }
    }

    const contractsWithDeliverables = contractsRes.rows.map((c: any) => ({
      ...c,
      deliverables: deliverablesMap[c.id] || []
    }));

    return NextResponse.json({ contracts: contractsWithDeliverables });
  } catch (err: any) {
    console.error("Agency contracts error:", err);
    return NextResponse.json({ error: "Failed to fetch agency contracts" }, { status: 500 });
  }
}
