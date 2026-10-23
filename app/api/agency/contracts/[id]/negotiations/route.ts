import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { calculateTdsDeduction, generateContractSha256Digest } from "@/lib/contracts";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user is party to this contract (agency or creator or admin)
    const contractRes = await query(
      `SELECT c.*,
              ua.name AS agency_name, uc.name AS creator_name
       FROM contracts c
       JOIN users ua ON c.agency_id = ua.id
       JOIN users uc ON c.creator_id = uc.id
       WHERE c.id = $1 AND (c.agency_id = $2 OR c.creator_id = $2 OR $3 IN ('ADMIN', 'SUPER_ADMIN'))`,
      [id, session.userId, session.role]
    );

    if (contractRes.rows.length === 0) {
      return NextResponse.json({ error: "Contract not found or access denied" }, { status: 404 });
    }

    const contract = contractRes.rows[0];

    // Fetch negotiation history
    const negRes = await query(
      `SELECT * FROM contract_negotiations WHERE contract_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    return NextResponse.json({
      contract,
      negotiations: negRes.rows
    });
  } catch (err: any) {
    console.error("Fetch negotiations error:", err);
    return NextResponse.json({ error: "Failed to fetch negotiation thread" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      message,
      proposed_gross_amount_inr,
      proposed_advance_percent,
      action = "REPLY" // 'REPLY', 'COUNTER_OFFER', 'ACCEPT_COUNTER'
    } = body;

    if (!message && action !== "ACCEPT_COUNTER") {
      return NextResponse.json({ error: "Message or counter-offer required" }, { status: 400 });
    }

    // Verify contract access
    const contractRes = await query(
      `SELECT * FROM contracts WHERE id = $1 AND (agency_id = $2 OR creator_id = $2 OR $3 IN ('ADMIN', 'SUPER_ADMIN'))`,
      [id, session.userId, session.role]
    );

    if (contractRes.rows.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contractRes.rows[0];

    // Sanitize and validate counter values
    let validatedGross: number | null = null;
    let validatedAdvance: number | null = null;
    if (proposed_gross_amount_inr !== undefined && proposed_gross_amount_inr !== null && proposed_gross_amount_inr !== "") {
      const g = Number(proposed_gross_amount_inr);
      if (!Number.isFinite(g) || g < 1000 || g > 50000000) {
        return NextResponse.json({ error: "Counter gross amount must be between ₹1,000 and ₹5,00,00,000." }, { status: 400 });
      }
      validatedGross = Math.round(g);
    }
    if (proposed_advance_percent !== undefined && proposed_advance_percent !== null && proposed_advance_percent !== "") {
      const a = Number(proposed_advance_percent);
      if (!Number.isFinite(a) || a < 0 || a > 100) {
        return NextResponse.json({ error: "Counter advance percent must be between 0% and 100%." }, { status: 400 });
      }
      validatedAdvance = Math.round(a);
    }

    // Record negotiation entry
    await query(
      `INSERT INTO contract_negotiations (
        contract_id, sender_id, sender_name, sender_role, message,
        proposed_gross_amount_inr, proposed_advance_percent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        session.userId,
        session.name,
        session.role,
        message || (action === "ACCEPT_COUNTER" ? "Counter-offer accepted." : "Terms update."),
        validatedGross,
        validatedAdvance
      ]
    );

    // If counter-offer, update contract status to 'NEGOTIATION'
    if (action === "COUNTER_OFFER") {
      await query(
        `UPDATE contracts SET status = 'NEGOTIATION', updated_at = NOW() WHERE id = $1`,
        [id]
      );
    }

    // SEC-01 FIX: If accepted revised terms, verify the counter-offer was legitimately made by the counterparty
    if (action === "ACCEPT_COUNTER") {
      const latestCounterRes = await query(
        `SELECT proposed_gross_amount_inr, proposed_advance_percent, sender_id
         FROM contract_negotiations
         WHERE contract_id = $1 AND sender_id != $2 AND proposed_gross_amount_inr IS NOT NULL
         ORDER BY created_at DESC LIMIT 1`,
        [id, session.userId]
      );

      if (latestCounterRes.rows.length === 0) {
        return NextResponse.json(
          { error: "No pending counter-offer from the counterparty exists to accept." },
          { status: 400 }
        );
      }

      const counter = latestCounterRes.rows[0];
      const gross = Number(counter.proposed_gross_amount_inr);
      const advPercent = counter.proposed_advance_percent !== null ? Number(counter.proposed_advance_percent) : contract.advance_percent;

      if (!Number.isFinite(gross) || gross < 1000) {
        return NextResponse.json({ error: "Invalid counter-offer terms recorded." }, { status: 400 });
      }

      const advanceAmount = Math.round((gross * advPercent) / 100);
      const balanceAmount = gross - advanceAmount;

      const tdsCalc = calculateTdsDeduction(gross, contract.tds_section as any);
      const netPayable = gross - tdsCalc.tdsAmountInr;

      const updatedDigest = generateContractSha256Digest({
        contractNumber: contract.contract_number,
        agencyId: contract.agency_id,
        creatorId: contract.creator_id,
        grossAmountInr: gross,
        advanceAmountInr: advanceAmount,
        balanceAmountInr: balanceAmount,
        paymentMode: contract.payment_mode,
        tdsSection: contract.tds_section,
        tdsAmountInr: tdsCalc.tdsAmountInr,
        campaignBrief: contract.campaign_brief,
        createdAtIso: new Date().toISOString()
      });

      await query(
        `UPDATE contracts
         SET gross_amount_inr = $1,
             advance_percent = $2,
             advance_amount_inr = $3,
             balance_amount_inr = $4,
             tds_amount_inr = $5,
             net_payable_inr = $6,
             sha256_digest = $7,
             status = 'ACCEPTED',
             updated_at = NOW()
         WHERE id = $8`,
        [gross, advPercent, advanceAmount, balanceAmount, tdsCalc.tdsAmountInr, netPayable, updatedDigest, id]
      );
    }

    return NextResponse.json({ success: true, message: "Negotiation entry recorded" });
  } catch (err: any) {
    console.error("Post negotiation error:", err);
    return NextResponse.json({ error: "Failed to record negotiation" }, { status: 500 });
  }
}
