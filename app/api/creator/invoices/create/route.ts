import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { calculateTdsDeduction } from "@/lib/contracts";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized. Creator session required." }, { status: 401 });
    }

    // Rate limit invoice creation
    const rateCheck = checkRateLimit(`creator_invoice_${session.userId}`, 30, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Invoice creation limit reached. Please retry in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      source = "STANDALONE", // 'CONTRACT' | 'STANDALONE'
      contract_id,
      // Standalone fields
      client_name,
      client_company,
      client_email,
      client_gstin,
      client_address,
      service_description,
      sac_code = "998311",
      taxable_value_inr,
      is_gst_registered = true,
      tds_section = "NONE"
    } = body;

    // Fetch creator profile for watermark rule and GSTIN
    const creatorProfRes = await query(
      `SELECT plan_tier, gstin FROM creator_profiles WHERE user_id = $1`,
      [session.userId]
    );
    const creatorTier = creatorProfRes.rows[0]?.plan_tier || "basic";
    // Basic has watermark; Pro/Influencer watermark-free
    const watermarkEnabled = creatorTier === "basic";

    let finalContractId: string | null = null;
    let finalAgencyId: string | null = null;
    let finalClientCompany = client_company || "Client Organization";
    let finalClientName = client_name || "Client Representative";
    let finalClientEmail = client_email || "";
    let finalClientGstin = client_gstin || "";
    let finalClientAddress = client_address || "";
    let finalServiceDesc = service_description || "Creator Marketing & Content Production Services";
    let taxable = 0;
    let tdsAmount = 0;
    let isStandalone = true;

    if (source === "CONTRACT" && contract_id) {
      // Fetch contract details
      const contractRes = await query(
        `SELECT c.*,
                u.name AS agency_user_name, u.email AS agency_user_email,
                ap.company_name AS agency_company_name, ap.gstin AS agency_gstin, ap.billing_address AS agency_address
         FROM contracts c
         LEFT JOIN users u ON c.agency_id = u.id
         LEFT JOIN agency_profiles ap ON c.agency_id = ap.user_id
         WHERE c.id = $1 AND c.creator_id = $2`,
        [contract_id, session.userId]
      );

      if (contractRes.rows.length === 0) {
        return NextResponse.json({ error: "Selected contract not found." }, { status: 404 });
      }

      const c = contractRes.rows[0];
      finalContractId = c.id;
      finalAgencyId = c.agency_id || null;
      finalClientCompany = c.agency_company_name || c.client_company || c.client_name || "Client Agency";
      finalClientName = c.agency_user_name || c.client_name || "Agency Rep";
      finalClientEmail = c.agency_user_email || c.client_email || "";
      finalClientGstin = c.agency_gstin || "";
      finalClientAddress = c.agency_address || "";
      finalServiceDesc = `Campaign: ${c.title}`;
      taxable = Number(c.gross_amount_inr);
      tdsAmount = Number(c.tds_amount_inr || 0);
      isStandalone = false;
    } else {
      // Standalone invoice validation
      if (!taxable_value_inr || Number(taxable_value_inr) < 500) {
        return NextResponse.json({ error: "Taxable amount must be at least ₹500." }, { status: 400 });
      }
      taxable = Math.round(Number(taxable_value_inr));
      const tdsCalc = calculateTdsDeduction(taxable, tds_section as any);
      tdsAmount = tdsCalc.tdsAmountInr;
    }

    // GST Calculation: 18% (CGST 9% + SGST 9%) if registered; 0 if composition/exempt
    const cgst = is_gst_registered ? Math.round(taxable * 0.09) : 0;
    const sgst = is_gst_registered ? Math.round(taxable * 0.09) : 0;
    const total = taxable + cgst + sgst;

    const uniqueSuffix = `${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const invoiceNumber = `INV-CK-2026-${uniqueSuffix}`;

    const insertRes = await query(
      `INSERT INTO invoices (
        invoice_number, contract_id, creator_id, agency_id,
        taxable_value_inr, cgst_inr, sgst_inr, total_inr, watermark_enabled, status,
        client_name, client_company, client_email, client_gstin, client_address,
        service_description, sac_code, tds_section, tds_amount_inr, is_standalone
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, 'ISSUED',
        $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19
      ) RETURNING id`,
      [
        invoiceNumber,
        finalContractId,
        session.userId,
        finalAgencyId,
        taxable,
        cgst,
        sgst,
        total,
        watermarkEnabled,
        finalClientName,
        finalClientCompany,
        finalClientEmail,
        finalClientGstin,
        finalClientAddress,
        finalServiceDesc,
        sac_code,
        tds_section,
        tdsAmount,
        isStandalone
      ]
    );

    const invoiceId = insertRes.rows[0].id;

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber,
      totalInr: total,
      taxableInr: taxable,
      isStandalone,
      watermarkEnabled,
      nudgeContractMessage: isStandalone
        ? "CreateKar generates the finest automated invoices directly when linked to contracts—with locked escrow advance, milestone tracking, and automated CBDT TDS schedules. Try the Contracts feature next time!"
        : null
    });
  } catch (err: any) {
    console.error("Create invoice error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
