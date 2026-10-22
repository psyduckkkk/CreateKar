import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { releaseEscrowTransfer } from "@/lib/razorpay";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    const { id } = await params;

    const contractRes = await query(
      `SELECT c.*, cp.plan_tier AS creator_tier, cp.gstin AS creator_gstin, u.name AS creator_name
       FROM contracts c
       JOIN users u ON c.creator_id = u.id
       LEFT JOIN creator_profiles cp ON u.id = cp.user_id
       WHERE c.id = $1 AND c.agency_id = $2`,
      [id, session.userId]
    );

    if (contractRes.rows.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contractRes.rows[0];

    // Check if contract is already completed
    if (contract.status === "COMPLETED") {
      return NextResponse.json({ error: "Contract is already completed and funds released." }, { status: 400 });
    }

    // 1. Release escrow transfer in Razorpay Route
    if (contract.payment_mode === "ESCROW_RAZORPAY") {
      // Find pending held transactions
      const txRes = await query(
        `SELECT id, razorpay_transfer_id FROM payment_transactions
         WHERE contract_id = $1 AND status = 'HELD_IN_ESCROW'`,
        [id]
      );

      for (const tx of txRes.rows) {
        if (tx.razorpay_transfer_id) {
          await releaseEscrowTransfer(tx.razorpay_transfer_id);
        }
        await query(
          `UPDATE payment_transactions SET status = 'RELEASED' WHERE id = $1`,
          [tx.id]
        );
      }
    } else {
      // Direct P2P mode
      await query(
        `UPDATE payment_transactions SET status = 'CONFIRMED' WHERE contract_id = $1`,
        [id]
      );
    }

    // 2. Mark contract COMPLETED
    await query(
      `UPDATE contracts SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // 3. Generate B2B GST Tax Invoice (4.6)
    // Check if invoice already exists
    const existingInv = await query(`SELECT id FROM invoices WHERE contract_id = $1`, [id]);
    let invoiceNumber = "";

    if (existingInv.rows.length === 0) {
      const taxable = Number(contract.gross_amount_inr);
      const cgst = Math.round(taxable * 0.09);
      const sgst = Math.round(taxable * 0.09);
      const total = taxable + cgst + sgst;
      invoiceNumber = `INV-CK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Watermark rule: Basic creators have watermark; Pro & Influencer creators have watermark_enabled = false
      const watermark = contract.creator_tier === "basic";

      await query(
        `INSERT INTO invoices (
          invoice_number, contract_id, creator_id, agency_id,
          taxable_value_inr, cgst_inr, sgst_inr, total_inr, watermark_enabled, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PAID')`,
        [
          invoiceNumber,
          contract.id,
          contract.creator_id,
          session.userId,
          taxable,
          cgst,
          sgst,
          total,
          watermark
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Escrow funds of ₹${Number(contract.balance_amount_inr).toLocaleString("en-IN")} successfully settled to creator. Tax invoice ${invoiceNumber} issued.`,
      contractStatus: "COMPLETED",
      invoiceNumber
    });
  } catch (err: any) {
    console.error("Release escrow error:", err);
    return NextResponse.json({ error: "Failed to release escrow" }, { status: 500 });
  }
}
