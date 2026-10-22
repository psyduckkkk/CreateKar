import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";
import crypto from "crypto";

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

    // Verify contract belongs to creator and is in PROPOSED state
    const contracts = await query(
      "SELECT * FROM contracts WHERE id = $1 AND creator_id = $2",
      [contractId, session.userId]
    );

    if (contracts.length === 0) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contracts[0];

    if (contract.status !== "PROPOSED") {
      return NextResponse.json(
        { error: `Contract is in ${contract.status} state and cannot be accepted.` },
        { status: 400 }
      );
    }

    // Generate SHA-256 digital signature stamp
    const signatureDigest = crypto
      .createHash("sha256")
      .update(`${contract.id}|${contract.creator_id}|${Date.now()}`)
      .digest("hex");

    // Update contract status to ACCEPTED
    await query(
      `UPDATE contracts
       SET status = 'ACCEPTED',
           creator_signed_at = NOW(),
           sha256_digest = COALESCE(sha256_digest, $1),
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
