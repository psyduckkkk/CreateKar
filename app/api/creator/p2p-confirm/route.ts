import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { contractId, transactionId } = body;

    // Verify contract belongs to creator
    const contractRows = await query(
      "SELECT id, gross_amount_inr, agency_id FROM contracts WHERE id = $1 AND creator_id = $2",
      [contractId, session.userId]
    );

    if (contractRows.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Update payment transaction status to CONFIRMED
    await query(
      `UPDATE payment_transactions
       SET status = 'CONFIRMED'
       WHERE contract_id = $1 AND id = $2`,
      [contractId, transactionId]
    );

    // SEC-03 FIX: Check if all deliverables are approved
    const unapproved = await query(
      `SELECT COUNT(*) as count FROM deliverables WHERE contract_id = $1 AND status != 'APPROVED'`,
      [contractId]
    );
    const hasUnapprovedDeliverables = Number(unapproved.rows[0]?.count || 0) > 0;

    // Advance payment transitions to FUNDED/IN_REVIEW; only final settlement transitions to COMPLETED
    const nextStatus = hasUnapprovedDeliverables ? "FUNDED" : "COMPLETED";

    await query(
      `UPDATE contracts
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [nextStatus, contractId]
    );

    return NextResponse.json({
      success: true,
      message: hasUnapprovedDeliverables
        ? "Advance payment confirmed! Contract is now funded. You may proceed with milestone production."
        : "Final payment confirmed! Contract marked as completed.",
      nextStatus
    });
  } catch (error) {
    console.error("P2P confirm error:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
