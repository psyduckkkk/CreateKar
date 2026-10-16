import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Deliverable } from '@/types/database';

export const dynamic = 'force-dynamic';

interface SubmitDeliverableBody {
  contract_id: string;
  title: string;
  file_url: string;
  format?: string;
  preview_url?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitDeliverableBody;

    // Validate required fields
    if (!body || !body.contract_id || !body.title || !body.file_url) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'contract_id, title, and file_url are required to submit a deliverable.',
          },
        },
        { status: 400 }
      );
    }

    // Basic URL validation
    const trimmedUrl = body.file_url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_URL',
            message: 'Deliverable file_url must be a valid HTTP or HTTPS link.',
          },
        },
        { status: 400 }
      );
    }

    // Verify parent contract exists
    const contractCheck = await query<{ id: string; status: string }>(
      `SELECT id, status FROM contracts WHERE id = $1`,
      [body.contract_id]
    );

    if (!contractCheck.success || contractCheck.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'CONTRACT_NOT_FOUND',
            message: 'Parent contract not found for deliverable submission.',
          },
        },
        { status: 404 }
      );
    }

    // Insert deliverable with status = 'SUBMITTED'
    const deliverableFormat = body.format?.trim() || 'Asset URL';
    const insertResult = await query<{ id: string }>(
      `INSERT INTO deliverables (
        contract_id,
        title,
        format,
        file_url,
        preview_url,
        status,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'SUBMITTED', NOW()
      )
      RETURNING id`,
      [
        body.contract_id,
        body.title.trim(),
        deliverableFormat,
        trimmedUrl,
        body.preview_url || trimmedUrl,
      ]
    );

    if (!insertResult.success) {
      return NextResponse.json(
        {
          error: {
            code: insertResult.error.code,
            message: insertResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    if (insertResult.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'DELIVERABLE_INSERT_EMPTY',
            message: 'No deliverable record returned after insertion.',
          },
        },
        { status: 500 }
      );
    }

    const deliverableId = insertResult.data[0].id;

    // Update parent contracts status to 'IN_REVIEW'
    const updateContractResult = await query(
      `UPDATE contracts
       SET status = 'IN_REVIEW', updated_at = NOW()
       WHERE id = $1`,
      [body.contract_id]
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
        deliverableId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error submitting deliverable';
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contract_id');

    let result;
    if (contractId) {
      result = await query<Deliverable>(
        `SELECT id, contract_id, title, format, file_url, preview_url, status, revision_notes, updated_at
         FROM deliverables
         WHERE contract_id = $1
         ORDER BY updated_at DESC`,
        [contractId]
      );
    } else {
      result = await query<Deliverable>(
        `SELECT id, contract_id, title, format, file_url, preview_url, status, revision_notes, updated_at
         FROM deliverables
         ORDER BY updated_at DESC
         LIMIT 50`
      );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: result.error.code,
            message: result.error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deliverables: result.data }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to query deliverables';
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
