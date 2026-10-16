import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Contract } from '@/types/database';

export const dynamic = 'force-dynamic';

interface PatchContractBody {
  status: 'ACCEPTED' | 'DECLINED';
}

export async function PATCH(
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
            message: 'Contract ID is required in URL path.',
          },
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as PatchContractBody;

    if (!body || !body.status || !['ACCEPTED', 'DECLINED'].includes(body.status)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_STATUS',
            message: "Status must be either 'ACCEPTED' or 'DECLINED'.",
          },
        },
        { status: 400 }
      );
    }

    const result = await query<Contract>(
      `UPDATE contracts
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, agency_id, creator_id, title, description, deliverables, total_amount, platform_fee, status, deadline, created_at, updated_at`,
      [body.status, id]
    );

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

    if (result.data.length === 0) {
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

    const rawContract = result.data[0];
    const updatedContract: Contract = {
      ...rawContract,
      total_amount: Number(rawContract.total_amount) || 0,
      platform_fee: Number(rawContract.platform_fee) || 499,
    };

    return NextResponse.json(
      {
        success: true,
        contract: updatedContract,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error updating contract';
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await query<Contract>(
      `SELECT id, agency_id, creator_id, title, description, deliverables, total_amount, platform_fee, status, deadline, created_at, updated_at
       FROM contracts
       WHERE id = $1`,
      [id]
    );

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

    if (result.data.length === 0) {
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

    const rawContract = result.data[0];
    const contract: Contract = {
      ...rawContract,
      total_amount: Number(rawContract.total_amount) || 0,
      platform_fee: Number(rawContract.platform_fee) || 499,
    };

    return NextResponse.json({ success: true, contract }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve contract';
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
