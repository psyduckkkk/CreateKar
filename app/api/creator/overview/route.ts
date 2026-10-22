import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Fetch Creator Profile
    const profileRows = await query(
      `SELECT * FROM creator_profiles WHERE user_id = $1`,
      [session.userId]
    );
    const profile = profileRows[0] || {};

    // 2. Compute Contract Metrics
    const contractStats = await query(
      `SELECT 
        COUNT(*) as total_contracts,
        COUNT(CASE WHEN status IN ('ACCEPTED', 'FUNDED', 'IN_REVIEW') THEN 1 END) as active_deals,
        COUNT(CASE WHEN status = 'PROPOSED' THEN 1 END) as pending_proposals,
        COALESCE(SUM(CASE WHEN status IN ('ACCEPTED', 'FUNDED', 'IN_REVIEW') THEN advance_amount_inr ELSE 0 END), 0) as locked_escrow_inr,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN gross_amount_inr ELSE 0 END), 0) as total_earnings_inr
       FROM contracts WHERE creator_id = $1`,
      [session.userId]
    );

    // 3. Compute Pending Deliverables
    const deliverableStats = await query(
      `SELECT 
        COUNT(CASE WHEN d.status = 'PENDING' THEN 1 END) as pending_submissions,
        COUNT(CASE WHEN d.status = 'REVISION_REQUESTED' THEN 1 END) as revision_requests
       FROM deliverables d
       JOIN contracts c ON d.contract_id = c.id
       WHERE c.creator_id = $1`,
      [session.userId]
    );

    // 4. Fetch Recent Contracts
    const recentContracts = await query(
      `SELECT c.*, u.name as agency_name, a.company_name
       FROM contracts c
       JOIN users u ON c.agency_id = u.id
       JOIN agency_profiles a ON c.agency_id = a.user_id
       WHERE c.creator_id = $1
       ORDER BY c.created_at DESC
       LIMIT 5`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        name: session.name,
        email: session.email,
        freeContractsRemaining: Math.max(0, 5 - (profile.contracts_created_count || 0)),
        isBoostActive: profile.boost_active_until ? new Date(profile.boost_active_until) > new Date() : false,
      },
      stats: {
        ...contractStats[0],
        ...deliverableStats[0],
      },
      recentContracts,
    });
  } catch (error) {
    console.error("Creator overview error:", error);
    return NextResponse.json({ error: "Failed to load dashboard overview" }, { status: 500 });
  }
}
