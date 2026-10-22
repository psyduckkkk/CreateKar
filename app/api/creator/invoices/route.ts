import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Check creator plan tier for watermark rule
    const creatorProf = await query(
      "SELECT plan_tier, gstin FROM creator_profiles WHERE user_id = $1",
      [session.userId]
    );
    const planTier = creatorProf[0]?.plan_tier || "basic";
    const isWatermarkFree = planTier === "influencer";

    const invoices = await query(
      `SELECT i.*, c.title as contract_title, c.contract_number,
              u.name as agency_name, a.company_name, a.gstin as agency_gstin
       FROM invoices i
       JOIN contracts c ON i.contract_id = c.id
       JOIN users u ON i.agency_id = u.id
       JOIN agency_profiles a ON i.agency_id = a.user_id
       WHERE i.creator_id = $1
       ORDER BY i.issued_at DESC`,
      [session.userId]
    );

    // Apply watermark tier rule dynamically
    const formattedInvoices = invoices.map((inv) => ({
      ...inv,
      watermark_enabled: !isWatermarkFree,
      plan_tier: planTier,
    }));

    return NextResponse.json({ success: true, invoices: formattedInvoices, planTier });
  } catch (error) {
    console.error("Fetch creator invoices error:", error);
    return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
  }
}
