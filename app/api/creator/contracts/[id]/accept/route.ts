import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { generateContractSha256Digest } from "@/lib/contracts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id: contractId } = await params;

    // Verify contract belongs to creator and is in PROPOSED or NEGOTIATION state
    const contracts = await query(
      "SELECT * FROM contracts WHERE id = $1 AND creator_id = $2",
      [contractId, session.userId]
    );

    if (contracts.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contracts[0];

    if (!["PROPOSED", "NEGOTIATION"].includes(contract.status)) {
      return NextResponse.json(
        { error: `Contract is in '${contract.status}' state and cannot be signed.` },
        { status: 400 }
      );
    }

    // Deterministic SHA-256 seal under IT Act Section 10A
    const signatureDigest = generateContractSha256Digest({
      contractNumber: contract.contract_number,
      agencyId: contract.agency_id,
      creatorId: contract.creator_id,
      grossAmountInr: contract.gross_amount_inr,
      advanceAmountInr: contract.advance_amount_inr,
      balanceAmountInr: contract.balance_amount_inr,
      paymentMode: contract.payment_mode,
      tdsSection: contract.tds_section,
      tdsAmountInr: contract.tds_amount_inr,
      campaignBrief: contract.campaign_brief,
      creatorSignedAt: new Date().toISOString()
    });

    // Update contract status to ACCEPTED
    await query(
      `UPDATE contracts
       SET status = 'ACCEPTED',
           creator_signed_at = NOW(),
           sha256_digest = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [signatureDigest, contractId]
    );

    return NextResponse.json({
      success: true,
      message: "Contract signed and accepted successfully!",
      signatureDigest,
    });
  } catch (error) {
    console.error("Accept contract error:", error);
    return NextResponse.json({ error: "Failed to accept contract" }, { status: 500 });
  }
}
