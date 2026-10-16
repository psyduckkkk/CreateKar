import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Deliverable, Contract } from '@/types/database';

export const dynamic = 'force-dynamic';

interface RevisionRequestBody {
  notes?: string;
  revision_notes?: string;
}

async function handleRevision(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_CONTRACT_ID',
            message: 'Contract ID is required in URL parameter.',
          },
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as RevisionRequestBody;
    const notes = (body?.notes || body?.revision_notes || '').trim();

    if (!notes) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Revision feedback notes are required.',
          },
        },
        { status: 400 }
      );
    }

    // 1. Verify target contract exists
    const contractCheck = await query<Contract>(
      `SELECT id, status FROM contracts WHERE id = $1`,
      [id]
    );

    if (!contractCheck.success) {
      return NextResponse.json(
        {
          error: {
            code: contractCheck.error.code,
            message: contractCheck.error.message,
          },
        },
        { status: 500 }
      );
    }

    if (contractCheck.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'CONTRACT_NOT_FOUND',
            message: `Contract with ID '${id}' was not found.`,
          },
        },
        { status: 404 }
      );
    }

    // 2. Update the latest row in deliverables for this contract_id
    const updateDeliverableResult = await query<Deliverable>(
      `UPDATE deliverables 
       SET status = 'REVISION_REQUESTED', revision_notes = $1, updated_at = NOW() 
       WHERE id = (
         SELECT id 
         FROM deliverables 
         WHERE contract_id = $2 
         ORDER BY updated_at DESC 
         LIMIT 1
       )
       RETURNING id, contract_id, title, format, file_url, status, revision_notes, updated_at`,
      [notes, id]
    );

    if (!updateDeliverableResult.success) {
      return NextResponse.json(
        {
          error: {
            code: updateDeliverableResult.error.code,
            message: updateDeliverableResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    // If no deliverable was previously inserted, create one with REVISION_REQUESTED status
    if (updateDeliverableResult.data.length === 0) {
      await query(
        `INSERT INTO deliverables (
          contract_id,
          title,
          format,
          status,
          revision_notes,
          updated_at
        ) VALUES (
          $1, 'Campaign Deliverable', 'Standard Deliverable', 'REVISION_REQUESTED', $2, NOW()
        )`,
        [id, notes]
      );
    }

    // 3. Update contracts table status = 'ACCEPTED' to allow creator resubmission
    const updateContractResult = await query<Contract>(
      `UPDATE contracts 
       SET status = 'ACCEPTED', updated_at = NOW() 
       WHERE id = $1
       RETURNING id, status, updated_at`,
      [id]
    );

    if (!updateContractResult.success) {
      return NextResponse.json(
        {
          error: {
            code: updateContractResult.error.code,
            message: updateContractResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Revision requested successfully.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error processing revision request';
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}

export const POST = handleRevision;
export const PATCH = handleRevision;
