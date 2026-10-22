import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    // 1. Fetch agency profile
    const profileRes = await query(
      `SELECT u.name, u.email, u.phone,
              p.company_name, p.brand_name, p.gstin, p.tan, p.billing_address,
              p.plan_tier, p.creator_search_limit
       FROM users u
       LEFT JOIN agency_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [session.userId]
    );

    const agency = profileRes.rows[0] || {
      name: session.name,
      email: session.email,
      company_name: "Agency",
      plan_tier: "basic",
      creator_search_limit: 5
    };

    // 2. Fetch campaign contracts count & escrow metrics
    const contractsRes = await query(
      `SELECT id, contract_number, title, gross_amount_inr, advance_amount_inr, balance_amount_inr,
              payment_mode, status, created_at
       FROM contracts
       WHERE agency_id = $1
       ORDER BY created_at DESC`,
      [session.userId]
    );

    const contracts = contractsRes.rows;
    const activeContracts = contracts.filter((c: any) =>
      ["PROPOSED", "NEGOTIATION", "ACCEPTED", "FUNDED", "IN_REVIEW"].includes(c.status)
    );

    // Escrow held amount (contracts in FUNDED or IN_REVIEW where payment_mode = ESCROW_RAZORPAY)
    const escrowHeldTotal = contracts
      .filter((c: any) => ["FUNDED", "IN_REVIEW"].includes(c.status) && c.payment_mode === "ESCROW_RAZORPAY")
      .reduce((sum: number, c: any) => sum + Number(c.gross_amount_inr), 0);

    // 3. Count deliverables awaiting review
    const deliverablesRes = await query(
      `SELECT d.id, d.status
       FROM deliverables d
       JOIN contracts c ON d.contract_id = c.id
       WHERE c.agency_id = $1 AND d.status = 'SUBMITTED'`,
      [session.userId]
    );
    const pendingReviewsCount = deliverablesRes.rows.length;

    // 4. Settled invoices count
    const invoicesRes = await query(
      `SELECT id, total_inr FROM invoices WHERE agency_id = $1`,
      [session.userId]
    );
    const totalSettledInvoices = invoicesRes.rows.length;
    const totalSettledInr = invoicesRes.rows.reduce(
      (sum: number, inv: any) => sum + Number(inv.total_inr),
      0
    );

    return NextResponse.json({
      agency,
      metrics: {
        totalContracts: contracts.length,
        activeContractsCount: activeContracts.length,
        escrowVaultHeldInr: escrowHeldTotal,
        pendingDeliverableReviews: pendingReviewsCount,
        settledInvoicesCount: totalSettledInvoices,
        totalSettledInr: totalSettledInr
      },
      recentContracts: contracts.slice(0, 5)
    });
  } catch (err: any) {
    console.error("Agency overview error:", err);
    return NextResponse.json({ error: "Failed to fetch agency overview" }, { status: 500 });
  }
}
