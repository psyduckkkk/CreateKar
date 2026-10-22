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

    // Update contract status to COMPLETED
    await query(
      `UPDATE contracts
       SET status = 'COMPLETED',
           updated_at = NOW()
       WHERE id = $1`,
      [contractId]
    );

    return NextResponse.json({
      success: true,
      message: "Direct payment confirmed! Contract marked as completed.",
    });
  } catch (error) {
    console.error("P2P confirm error:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
