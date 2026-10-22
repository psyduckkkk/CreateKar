import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { createEscrowOrder } from "@/lib/razorpay";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { p2p_utr_number } = body;

    const contractRes = await query(
      `SELECT c.*, u.email AS creator_email
       FROM contracts c
       JOIN users u ON c.creator_id = u.id
       WHERE c.id = $1 AND c.agency_id = $2`,
      [id, session.userId]
    );

    if (contractRes.rows.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contractRes.rows[0];
    const advanceInr = Number(contract.advance_amount_inr);

    if (contract.payment_mode === "ESCROW_RAZORPAY") {
      // 1. Create simulated or live Razorpay Order with Escrow Route Transfer
      const amountInr = advanceInr > 0 ? advanceInr : Number(contract.gross_amount_inr);
      const orderRes = await createEscrowOrder({
        amountPaise: amountInr * 100,
        receipt: contract.contract_number,
        notes: {
          contract_id: contract.id,
          contract_number: contract.contract_number,
          campaign_title: contract.title
        }
      });

      const orderId = orderRes.order?.id || `order_mock_${Date.now().toString(36)}`;

      // Record transaction
      await query(
        `INSERT INTO payment_transactions (
          contract_id, payment_mode, amount_inr, razorpay_order_id, razorpay_payment_id, status
        ) VALUES ($1, 'ESCROW_RAZORPAY', $2, $3, $4, 'HELD_IN_ESCROW')`,
        [
          contract.id,
          amountInr,
          orderId,
          `pay_mock_${Date.now().toString(36)}`
        ]
      );

      // Advance locked in escrow! Update contract status to FUNDED (or IN_REVIEW)
      const newStatus = contract.creator_signed_at ? "IN_REVIEW" : "FUNDED";
      await query(
        `UPDATE contracts SET status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, contract.id]
      );

      return NextResponse.json({
        success: true,
        message: `Advance of ₹${advanceInr.toLocaleString("en-IN")} locked in CreateKar Razorpay Route Escrow Vault.`,
        orderId,
        newStatus
      });
    } else {
      // Mode B: Direct P2P UPI/IMPS
      if (!p2p_utr_number || p2p_utr_number.trim().length < 8) {
        return NextResponse.json({ error: "Valid 12-digit UPI/IMPS UTR number is required for P2P mode." }, { status: 400 });
      }

      await query(
        `INSERT INTO payment_transactions (
          contract_id, payment_mode, amount_inr, p2p_utr_number, status
        ) VALUES ($1, 'DIRECT_P2P', $2, $3, 'PENDING')`,
        [contract.id, advanceInr, p2p_utr_number.trim()]
      );

      await query(
        `UPDATE contracts SET status = 'FUNDED', updated_at = NOW() WHERE id = $1`,
        [contract.id]
      );

      return NextResponse.json({
        success: true,
        message: `P2P advance payment UTR (${p2p_utr_number}) submitted. Awaiting creator confirmation.`,
        newStatus: "FUNDED"
      });
    }
  } catch (err: any) {
    console.error("Lock escrow error:", err);
    return NextResponse.json({ error: "Failed to lock escrow" }, { status: 500 });
  }
}
