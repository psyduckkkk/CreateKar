import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id: deliverableId } = await params;
    const body = await request.json();
    const { submissionUrl, submissionNotes } = body;

    if (!submissionUrl || !submissionUrl.trim().startsWith("http")) {
      return NextResponse.json(
        { error: "Please provide a valid preview link (YouTube, Google Drive, Loom, Instagram draft)." },
        { status: 400 }
      );
    }

    // Verify deliverable belongs to creator
    const delivRows = await query(
      `SELECT d.id, d.contract_id, d.status
       FROM deliverables d
       JOIN contracts c ON d.contract_id = c.id
       WHERE d.id = $1 AND c.creator_id = $2`,
      [deliverableId, session.userId]
    );

    if (delivRows.length === 0) {
      return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
    }

    const deliverable = delivRows[0];

    // Update deliverable status to SUBMITTED
    await query(
      `UPDATE deliverables
       SET status = 'SUBMITTED',
           submission_url = $1,
           submission_notes = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [submissionUrl.trim(), submissionNotes || null, deliverableId]
    );

    // Update contract status to IN_REVIEW
    await query(
      `UPDATE contracts
       SET status = 'IN_REVIEW',
           updated_at = NOW()
       WHERE id = $1 AND status IN ('ACCEPTED', 'FUNDED')`,
      [deliverable.contract_id]
    );

    return NextResponse.json({
      success: true,
      message: "Deliverable draft submitted successfully! Agency has been notified for review.",
    });
  } catch (error) {
    console.error("Submit deliverable error:", error);
    return NextResponse.json({ error: "Failed to submit deliverable" }, { status: 500 });
  }
}
