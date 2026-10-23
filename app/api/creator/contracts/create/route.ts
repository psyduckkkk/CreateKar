import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { calculateTdsDeduction, generateContractSha256Digest } from "@/lib/contracts";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized. Creator session required." }, { status: 401 });
    }

    // Rate limit contract creations
    const rateCheck = checkRateLimit(`creator_contract_${session.userId}`, 20, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Contract creation rate limit reached. Please retry in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      client_type = "EXTERNAL", // 'REGISTERED' | 'EXTERNAL'
      agency_id,
      client_company,
      client_name,
      client_email,
      client_phone,
      title,
      campaign_brief,
      gross_amount_inr,
      advance_percent = 50,
      payment_mode = "ESCROW_RAZORPAY",
      signature_method = "SHA256_CRYPTOGRAPHIC",
      tds_section = "NONE",
      deliverables = []
    } = body;

    if (!title || !campaign_brief || !gross_amount_inr) {
      return NextResponse.json({ error: "Missing required contract fields: title, brief, or gross amount." }, { status: 400 });
    }

    let targetAgencyId: string | null = null;
    let targetClientCompany = client_company || "Client Agency";
    let targetClientName = client_name || "Agency Representative";
    let targetClientEmail = client_email || "";

    if (client_type === "REGISTERED" && agency_id) {
      const agencyCheck = await query(
        `SELECT u.id, u.name, u.email, ap.company_name
         FROM users u
         LEFT JOIN agency_profiles ap ON u.id = ap.user_id
         WHERE u.id = $1 AND u.role = 'AGENCY' AND u.status = 'ACTIVE'`,
        [agency_id]
      );
      if (agencyCheck.rows.length > 0) {
        targetAgencyId = agencyCheck.rows[0].id;
        targetClientCompany = agencyCheck.rows[0].company_name || agencyCheck.rows[0].name;
        targetClientName = agencyCheck.rows[0].name;
        targetClientEmail = agencyCheck.rows[0].email;
      }
    } else if (client_email) {
      // Check if this email already belongs to a registered Agency on CreateKar
      const existingAgency = await query(
        `SELECT u.id, u.name, ap.company_name
         FROM users u
         LEFT JOIN agency_profiles ap ON u.id = ap.user_id
         WHERE LOWER(u.email) = $1 AND u.role = 'AGENCY'`,
        [client_email.toLowerCase().trim()]
      );
      if (existingAgency.rows.length > 0) {
        targetAgencyId = existingAgency.rows[0].id;
        targetClientCompany = existingAgency.rows[0].company_name || existingAgency.rows[0].name;
        targetClientName = existingAgency.rows[0].name;
      }
    }

    // Number validation
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

    // Unique collision-free contract number and guest signing token
    const uniqueSuffix = `${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const contractNumber = `CK-2026-${uniqueSuffix}`;
    const guestSignToken = crypto.randomBytes(16).toString("hex");

    // Cryptographic SHA-256 seal
    const termsDigest = generateContractSha256Digest({
      contractNumber,
      agencyId: targetAgencyId || "GUEST_AGENCY",
      creatorId: session.userId,
      grossAmountInr: gross,
      advanceAmountInr: advanceAmount,
      balanceAmountInr: balanceAmount,
      paymentMode: payment_mode,
      tdsSection: tds_section,
      tdsAmountInr: tdsCalc.tdsAmountInr,
      campaignBrief: campaign_brief,
      createdAtIso: new Date().toISOString()
    });

    // Insert contract with creator_signed_at already set since creator initiated it!
    const contractRes = await query(
      `INSERT INTO contracts (
        contract_number, agency_id, creator_id, title, campaign_brief,
        gross_amount_inr, advance_percent, advance_amount_inr, balance_amount_inr,
        payment_mode, signature_method, sha256_digest, tds_section, tds_amount_inr,
        net_payable_inr, creator_signed_at, status,
        client_company, client_name, client_email, client_phone,
        guest_sign_token, created_by_role
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), 'PROPOSED',
        $16, $17, $18, $19, $20, 'CREATOR'
      ) RETURNING id`,
      [
        contractNumber,
        targetAgencyId,
        session.userId,
        title.trim(),
        campaign_brief.trim(),
        gross,
        advPercent,
        advanceAmount,
        balanceAmount,
        payment_mode,
        signature_method,
        termsDigest,
        tds_section,
        tdsCalc.tdsAmountInr,
        netPayable,
        targetClientCompany,
        targetClientName,
        targetClientEmail,
        client_phone || null,
        guestSignToken
      ]
    );

    const contractId = contractRes.rows[0].id;

    // Insert deliverables
    if (Array.isArray(deliverables) && deliverables.length > 0) {
      for (const d of deliverables) {
        if (d.type) {
          const deadline = d.deadline ? new Date(d.deadline) : new Date(Date.now() + 14 * 86400000);
          await query(
            `INSERT INTO deliverables (contract_id, type, description, deadline, status)
             VALUES ($1, $2, $3, $4, 'PENDING')`,
            [contractId, d.type, d.description || `${d.type} draft`, deadline]
          );
        }
      }
    } else {
      await query(
        `INSERT INTO deliverables (contract_id, type, description, deadline, status)
         VALUES ($1, 'Campaign Deliverable', 'Deliverable as agreed in campaign terms', NOW() + INTERVAL '14 days', 'PENDING')`,
        [contractId]
      );
    }

    // Increment creator contracts count for monetization meter
    await query(
      `UPDATE creator_profiles
       SET contracts_created_count = contracts_created_count + 1, updated_at = NOW()
       WHERE user_id = $1`,
      [session.userId]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://createkar.com";
    const publicSigningUrl = `${appUrl}/contracts/sign/${guestSignToken}`;

    return NextResponse.json({
      success: true,
      contractId,
      contractNumber,
      guestSignToken,
      publicSigningUrl,
      sha256Digest: termsDigest,
      clientCompany: targetClientCompany,
      isAgencyRegistered: !!targetAgencyId
    });
  } catch (err: any) {
    console.error("Creator create contract error:", err);
    return NextResponse.json({ error: "Failed to create contract proposal" }, { status: 500 });
  }
}
