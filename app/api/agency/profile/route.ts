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
      `SELECT u.name, u.email, u.phone,
              p.company_name, p.brand_name, p.gstin, p.tan, p.billing_address,
              p.plan_tier, p.creator_search_limit
       FROM users u
       LEFT JOIN agency_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [session.userId]
    );

    return NextResponse.json({ agency: res.rows[0] });
  } catch (err: any) {
    console.error("Fetch agency profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    const body = await request.json();
    const { company_name, brand_name, gstin, tan, billing_address, plan_tier } = body;
    const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";

    // SEC-04 FIX: Regular agency users cannot self-elevate plan tier or search quota without verified payment
    if (plan_tier && !isAdmin) {
      const currentTierRes = await query(
        `SELECT plan_tier FROM agency_profiles WHERE user_id = $1`,
        [session.userId]
      );
      const currentTier = currentTierRes.rows[0]?.plan_tier || "basic";
      if (plan_tier !== currentTier) {
        return NextResponse.json(
          { error: "Plan upgrades require verified subscription payment. Self-elevation is disabled." },
          { status: 403 }
        );
      }
    }

    if (isAdmin && plan_tier) {
      let limit = 5;
      if (plan_tier === "pro") limit = 10;
      if (plan_tier === "enterprise") limit = 50;

      await query(
        `UPDATE agency_profiles
         SET company_name = COALESCE($1, company_name),
             brand_name = COALESCE($2, brand_name),
             gstin = COALESCE($3, gstin),
             tan = COALESCE($4, tan),
             billing_address = COALESCE($5, billing_address),
             plan_tier = $6,
             creator_search_limit = $7,
             updated_at = NOW()
         WHERE user_id = $8`,
        [company_name, brand_name, gstin, tan, billing_address, plan_tier, limit, session.userId]
      );
    } else {
      await query(
        `UPDATE agency_profiles
         SET company_name = COALESCE($1, company_name),
             brand_name = COALESCE($2, brand_name),
             gstin = COALESCE($3, gstin),
             tan = COALESCE($4, tan),
             billing_address = COALESCE($5, billing_address),
             updated_at = NOW()
         WHERE user_id = $6`,
        [company_name, brand_name, gstin, tan, billing_address, session.userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Agency profile updated successfully"
    });
  } catch (err: any) {
    console.error("Update agency profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
