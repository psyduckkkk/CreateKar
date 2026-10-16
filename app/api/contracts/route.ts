import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CreateContractRequestBody {
  creatorId: string;
  title: string;
  deliverableType: string;
  budget: number | string;
  deadline: string;
  agencyId?: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateContractRequestBody;

    // Validate required fields
    if (!body.creatorId || !body.title || body.budget === undefined || !body.deadline) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Campaign title, creator, budget, and deadline date are required.',
          },
        },
        { status: 400 }
      );
    }

    const budgetNumber = Number(body.budget);
    if (isNaN(budgetNumber) || budgetNumber <= 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_BUDGET',
            message: 'Budget must be a valid positive number.',
          },
        },
        { status: 400 }
      );
    }

    // Resolve agency profile ID
    let agencyId = body.agencyId;
    if (!agencyId) {
      const agencyQuery = await query<{ id: string }>(
        `SELECT id FROM profiles WHERE role = 'agency' LIMIT 1`
      );

      if (agencyQuery.success && agencyQuery.data.length > 0) {
        agencyId = agencyQuery.data[0].id;
      } else {
        // Fallback: ensure a default verified agency profile exists
        const fallbackAgency = await query<{ id: string }>(
          `INSERT INTO profiles (user_id, role, display_name, handle, bio, niche, is_verified)
           VALUES ('agency_default', 'agency', 'CreateKar Brand Studio', '@ckbrand', 'Brand Studio Campaign Manager', 'Brand', true)
           ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name
           RETURNING id`
        );

        if (fallbackAgency.success && fallbackAgency.data.length > 0) {
          agencyId = fallbackAgency.data[0].id;
        } else {
          return NextResponse.json(
            {
              error: {
                code: 'AGENCY_RESOLUTION_FAILED',
                message: 'Unable to resolve or create an agency profile for this contract.',
              },
            },
            { status: 500 }
          );
        }
      }
    }

    // Verify target creator exists
    const creatorCheck = await query<{ id: string }>(
      `SELECT id FROM profiles WHERE id = $1 AND role = 'creator' LIMIT 1`,
      [body.creatorId]
    );

    if (!creatorCheck.success || creatorCheck.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'CREATOR_NOT_FOUND',
            message: 'Selected creator does not exist or is not a verified creator.',
          },
        },
        { status: 404 }
      );
    }

    // Prepare deliverable structure for JSONB column
    const deliverableItem = [
      {
        title: body.deliverableType || 'Campaign Deliverable',
        format: body.deliverableType || 'Standard Deliverable',
        rate: budgetNumber,
      },
    ];

    const deadlineTimestamp = new Date(body.deadline).toISOString();

    // Insert contract into database with status = 'PROPOSED' and platform_fee = 499
    const insertResult = await query<{ id: string }>(
      `INSERT INTO contracts (
        agency_id,
        creator_id,
        title,
        description,
        deliverables,
        total_amount,
        platform_fee,
        status,
        deadline
      ) VALUES (
        $1, $2, $3, $4, $5::jsonb, $6, 499.00, 'PROPOSED', $7
      )
      RETURNING id`,
      [
        agencyId,
        body.creatorId,
        body.title.trim(),
        body.description || `Campaign collaboration proposal: ${body.deliverableType}`,
        JSON.stringify(deliverableItem),
        budgetNumber,
        deadlineTimestamp,
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
            code: 'CONTRACT_INSERT_EMPTY',
            message: 'No contract record was returned after insertion.',
          },
        },
        { status: 500 }
      );
    }

    const createdContractId = insertResult.data[0].id;

    return NextResponse.json(
      {
        success: true,
        contractId: createdContractId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error processing contract proposal';
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
