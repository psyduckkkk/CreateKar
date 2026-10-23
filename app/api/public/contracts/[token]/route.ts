import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateContractSha256Digest } from "@/lib/contracts";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!token || token.length < 16) {
      return NextResponse.json({ error: "Invalid contract token" }, { status: 400 });
    }

    const res = await query(
      `SELECT c.*,
              u.name AS creator_name, u.email AS creator_email,
              cp.niche AS creator_niche, cp.bio AS creator_bio,
              cp.instagram_handle, cp.youtube_handle, cp.followers_count,
              cp.badge_type AS creator_badge_type, cp.upi_id AS creator_upi_id
       FROM contracts c
       JOIN users u ON c.creator_id = u.id
       LEFT JOIN creator_profiles cp ON u.id = cp.user_id
       WHERE c.guest_sign_token = $1`,
      [token]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Contract agreement not found or expired" }, { status: 404 });
    }

    const contract = res.rows[0];

    // Fetch deliverables
    const deliverablesRes = await query(
      `SELECT * FROM deliverables WHERE contract_id = $1 ORDER BY deadline ASC`,
      [contract.id]
    );

    return NextResponse.json({
      contract: {
        id: contract.id,
        contractNumber: contract.contract_number,
        title: contract.title,
        campaignBrief: contract.campaign_brief,
        grossAmountInr: contract.gross_amount_inr,
        advancePercent: contract.advance_percent,
        advanceAmountInr: contract.advance_amount_inr,
        balanceAmountInr: contract.balance_amount_inr,
        paymentMode: contract.payment_mode,
        signatureMethod: contract.signature_method,
        sha256Digest: contract.sha256_digest,
        tdsSection: contract.tds_section,
        tdsAmountInr: contract.tds_amount_inr,
        netPayableInr: contract.net_payable_inr,
        status: contract.status,
        creatorSignedAt: contract.creator_signed_at,
        agencySignedAt: contract.agency_signed_at,
        clientCompany: contract.client_company,
        clientName: contract.client_name,
        clientEmail: contract.client_email,
        createdAt: contract.created_at,
        creator: {
          name: contract.creator_name,
          niche: contract.creator_niche,
          badgeType: contract.creator_badge_type,
          instagramHandle: contract.instagram_handle,
          youtubeHandle: contract.youtube_handle,
          followersCount: contract.followers_count
        },
        deliverables: deliverablesRes.rows
      }
    });
  } catch (err: any) {
    console.error("Public fetch contract error:", err);
    return NextResponse.json({ error: "Failed to load contract details" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!token || token.length < 16) {
      return NextResponse.json({ error: "Invalid contract token" }, { status: 400 });
    }

    const body = await request.json();
    const { signatory_name, signatory_designation, company_name } = body;

    if (!signatory_name || !signatory_name.trim()) {
      return NextResponse.json({ error: "Signatory name is required to execute legal agreement." }, { status: 400 });
    }

    const contractRes = await query(
      `SELECT * FROM contracts WHERE guest_sign_token = $1`,
      [token]
    );

    if (contractRes.rows.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contractRes.rows[0];

    if (contract.status === "COMPLETED" || contract.agency_signed_at) {
      return NextResponse.json(
        { error: "Contract has already been signed and accepted." },
        { status: 400 }
      );
    }

    // Re-verify and sign under SHA-256 seal
    const updatedDigest = generateContractSha256Digest({
      contractNumber: contract.contract_number,
      agencyId: contract.agency_id || "GUEST_AGENCY",
      creatorId: contract.creator_id,
      grossAmountInr: contract.gross_amount_inr,
      advanceAmountInr: contract.advance_amount_inr,
      balanceAmountInr: contract.balance_amount_inr,
      paymentMode: contract.payment_mode,
      tdsSection: contract.tds_section,
      tdsAmountInr: contract.tds_amount_inr,
      campaignBrief: contract.campaign_brief,
      agencySignedAt: new Date().toISOString(),
      signatoryName: signatory_name.trim(),
      companyName: company_name || contract.client_company
    });

    await query(
      `UPDATE contracts
       SET status = 'ACCEPTED',
           agency_signed_at = NOW(),
           client_name = COALESCE($1, client_name),
           client_company = COALESCE($2, client_company),
           sha256_digest = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [signatory_name.trim(), company_name ? company_name.trim() : null, updatedDigest, contract.id]
    );

    return NextResponse.json({
      success: true,
      message: "Agreement digitally signed and sealed under Information Technology Act §10A (SHA-256).",
      contractStatus: "ACCEPTED",
      contractNumber: contract.contract_number,
      sha256Digest: updatedDigest
    });
  } catch (err: any) {
    console.error("Public sign contract error:", err);
    return NextResponse.json({ error: "Failed to sign contract" }, { status: 500 });
  }
}
