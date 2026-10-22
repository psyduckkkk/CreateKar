import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENCY" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized agency session" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, revision_notes } = body;

    if (!["APPROVE", "REQUEST_REVISION"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be APPROVE or REQUEST_REVISION." }, { status: 400 });
    }

    // Verify agency owns this deliverable's contract
    const delRes = await query(
      `SELECT d.*, c.id AS contract_id, c.balance_amount_inr, c.gross_amount_inr, c.creator_id
       FROM deliverables d
       JOIN contracts c ON d.contract_id = c.id
       WHERE d.id = $1 AND c.agency_id = $2`,
      [id, session.userId]
    );

    if (delRes.rows.length === 0) {
      return NextResponse.json({ error: "Deliverable not found or unauthorized" }, { status: 404 });
    }

    const deliverable = delRes.rows[0];

    if (action === "REQUEST_REVISION") {
      if (!revision_notes || revision_notes.trim().length === 0) {
        return NextResponse.json({ error: "Please provide revision instructions for the creator." }, { status: 400 });
      }

      await query(
        `UPDATE deliverables
         SET status = 'REVISION_REQUESTED',
             revision_notes = $1,
             revision_count = revision_count + 1,
             updated_at = NOW()
         WHERE id = $2`,
        [revision_notes.trim(), id]
      );

      return NextResponse.json({
        success: true,
        message: "Revision requested. Creator has been notified to upload an amended cut.",
        deliverableStatus: "REVISION_REQUESTED"
      });
    }

    // Action === 'APPROVE'
    await query(
      `UPDATE deliverables
       SET status = 'APPROVED',
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // Check if all deliverables for this contract are now approved
    const allDeliverablesRes = await query(
      `SELECT id, status FROM deliverables WHERE contract_id = $1`,
      [deliverable.contract_id]
    );

    const pendingCount = allDeliverablesRes.rows.filter((d: any) => d.status !== "APPROVED").length;
    const allApproved = pendingCount === 0;

    return NextResponse.json({
      success: true,
      message: "Deliverable approved successfully.",
      deliverableStatus: "APPROVED",
      allDeliverablesApproved: allApproved,
      contractId: deliverable.contract_id,
      balanceAmountInr: deliverable.balance_amount_inr
    });
  } catch (err: any) {
    console.error("Deliverable review error:", err);
    return NextResponse.json({ error: "Failed to review deliverable" }, { status: 500 });
  }
}
