import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const nicheFilter = searchParams.get("niche")?.trim() || "";

    // 1. Get Agency search limit from tier
    const agencyProfileRes = await query(
      `SELECT plan_tier, creator_search_limit FROM agency_profiles WHERE user_id = $1`,
      [session.userId]
    );

    const agencyTier = agencyProfileRes.rows[0]?.plan_tier || "basic";
    // Basic: 5, Pro: 10, Enterprise: 50
    let limit = 5;
    if (agencyTier === "pro") limit = 10;
    if (agencyTier === "enterprise") limit = 50;

    // 2. Fetch creators with active boost prioritizing top slots
    let sql = `
      SELECT u.id, u.name, u.email,
             cp.niche, cp.bio, cp.instagram_handle, cp.youtube_handle,
             cp.followers_count, cp.base_rate_inr, cp.plan_tier, cp.badge_type,
             cp.boost_active_until,
             (cp.boost_active_until IS NOT NULL AND cp.boost_active_until > NOW()) AS is_boosted
      FROM users u
      JOIN creator_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'CREATOR' AND u.status = 'ACTIVE'
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(cp.niche) LIKE $${params.length} OR LOWER(cp.bio) LIKE $${params.length})`;
    }

    if (nicheFilter && nicheFilter !== "All") {
      params.push(nicheFilter);
      sql += ` AND cp.niche = $${params.length}`;
    }

    // Order: Boosted creators first, then by followers_count DESC
    sql += ` ORDER BY is_boosted DESC, cp.followers_count DESC`;

    const totalCountRes = await query(sql, params);
    const totalMatching = totalCountRes.rows.length;

    // Apply tier limit
    const visibleCreators = totalCountRes.rows.slice(0, limit);

    return NextResponse.json({
      creators: visibleCreators,
      tier: agencyTier,
      limitEnforced: limit,
      totalMatching,
      hasMore: totalMatching > limit
    });
  } catch (err: any) {
    console.error("Explore creators error:", err);
    return NextResponse.json({ error: "Failed to load creators" }, { status: 500 });
  }
}
