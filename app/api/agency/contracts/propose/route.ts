import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { calculateTdsDeduction, generateContractSha256Digest } from "@/lib/contracts";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    // Rate limit deal proposals to prevent spam flooding
    const rateCheck = checkRateLimit(`propose_${session.userId}`, 20, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Deal proposal rate limit reached. Please wait ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      creator_id,
      title,
      campaign_brief,
      gross_amount_inr,
      advance_percent = 50,
      payment_mode = "ESCROW_RAZORPAY",
      signature_method = "SHA256_CRYPTOGRAPHIC",
      tds_section = "NONE",
      deliverables = [],
      initial_message = ""
    } = body;

    if (!creator_id || !title || !campaign_brief || !gross_amount_inr) {
      return NextResponse.json({ error: "Missing required contract proposal fields" }, { status: 400 });
    }

    // Verify creator exists and is an ACTIVE creator
    const creatorCheck = await query(
      `SELECT id FROM users WHERE id = $1 AND role = 'CREATOR' AND status = 'ACTIVE'`,
      [creator_id]
    );
    if (creatorCheck.rows.length === 0) {
      return NextResponse.json({ error: "Selected creator does not exist or account is inactive." }, { status: 404 });
    }

    // Strict numerical bounds validation
    const rawGross = Number(gross_amount_inr);
    if (!Number.isFinite(rawGross) || rawGross < 1000 || rawGross > 50000000) {
      return NextResponse.json({ error: "Gross amount must be between ₹1,000 and ₹5,00,00,000." }, { status: 400 });
    }
    const gross = Math.round(rawGross);

    const rawAdvPercent = Number(advance_percent);
    if (!Number.isFinite(rawAdvPercent) || rawAdvPercent < 0 || rawAdvPercent > 100) {
      return NextResponse.json({ error: "Advance percent must be between 0% and 100%." }, { status: 400 });
    }
    const advPercent = Math.round(rawAdvPercent);

    const advanceAmount = Math.round((gross * advPercent) / 100);
    const balanceAmount = gross - advanceAmount;

    // Calculate statutory TDS deduction (Section 194C / 194J)
    const tdsCalc = calculateTdsDeduction(gross, tds_section as any);
    const netPayable = gross - tdsCalc.tdsAmountInr;

    // SEC-07 FIX: High-entropy collision-free contract number
    const uniqueSuffix = `${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const contractNumber = `CK-2026-${uniqueSuffix}`;

    // Cryptographic SHA-256 hash sealing terms
    const termsDigest = generateContractSha256Digest({
      contractNumber,
      agencyId: session.userId,
      creatorId: creator_id,
      grossAmountInr: gross,
      advanceAmountInr: advanceAmount,
      balanceAmountInr: balanceAmount,
      paymentMode: payment_mode,
      tdsSection: tds_section,
      tdsAmountInr: tdsCalc.tdsAmountInr,
      campaignBrief: campaign_brief,
      createdAtIso: new Date().toISOString()
    });

    // Insert contract
    const contractRes = await query(
      `INSERT INTO contracts (
        contract_number, agency_id, creator_id, title, campaign_brief,
        gross_amount_inr, advance_percent, advance_amount_inr, balance_amount_inr,
        payment_mode, signature_method, sha256_digest, tds_section, tds_amount_inr,
        net_payable_inr, agency_signed_at, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), 'PROPOSED'
      ) RETURNING id`,
      [
        contractNumber,
        session.userId,
        creator_id,
        title,
        campaign_brief,
        gross,
        advPercent,
        advanceAmount,
        balanceAmount,
        payment_mode,
        signature_method,
        termsDigest,
        tds_section,
        tdsCalc.tdsAmountInr,
        netPayable
      ]
    );

    const contractId = contractRes.rows[0].id;

    // Insert deliverables
    if (Array.isArray(deliverables) && deliverables.length > 0) {
      for (const d of deliverables) {
        if (d.type) {
          const deadline = d.deadline ? new Date(d.deadline) : new Date(Date.now() + 7 * 86400000);
          await query(
            `INSERT INTO deliverables (contract_id, type, description, deadline, status)
             VALUES ($1, $2, $3, $4, 'PENDING')`,
            [contractId, d.type, d.description || `${d.type} draft`, deadline]
          );
        }
      }
    } else {
      // Default deliverable if none provided
      await query(
        `INSERT INTO deliverables (contract_id, type, description, deadline, status)
         VALUES ($1, 'Main Campaign Deliverable', 'Final high-resolution deliverable as per campaign brief', NOW() + INTERVAL '7 days', 'PENDING')`,
        [contractId]
      );
    }

    // Insert initial negotiation entry
    if (initial_message) {
      await query(
        `INSERT INTO contract_negotiations (
          contract_id, sender_id, sender_name, sender_role, message,
          proposed_gross_amount_inr, proposed_advance_percent
        ) VALUES ($1, $2, $3, 'AGENCY', $4, $5, $6)`,
        [contractId, session.userId, session.name, initial_message, gross, advPercent]
      );
    }

    return NextResponse.json({
      success: true,
      contractId,
      contractNumber,
      sha256Digest: termsDigest,
      netPayable
    });
  } catch (err: any) {
    console.error("Propose deal error:", err);
    return NextResponse.json({ error: "Failed to propose deal" }, { status: 500 });
  }
}
