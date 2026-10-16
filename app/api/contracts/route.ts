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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creator_id');

    let queryText = `
      SELECT 
        c.id,
        c.agency_id,
        c.creator_id,
        c.title,
        c.description,
        c.deliverables,
        c.total_amount,
        c.platform_fee,
        c.status,
        c.deadline,
        c.created_at,
        c.updated_at,
        p_creator.display_name AS creator_name,
        p_creator.handle AS creator_handle,
        p_creator.avatar_url AS creator_avatar,
        p_agency.display_name AS agency_name,
        (
          SELECT json_agg(d ORDER BY d.updated_at DESC)
          FROM deliverables d
          WHERE d.contract_id = c.id
        ) AS submitted_deliverables
      FROM contracts c
      JOIN profiles p_creator ON c.creator_id = p_creator.id
      LEFT JOIN profiles p_agency ON c.agency_id = p_agency.id
    `;

    const params: unknown[] = [];
    if (creatorId) {
      queryText += ` WHERE c.creator_id = $1`;
      params.push(creatorId);
    }

    queryText += ` ORDER BY c.created_at DESC`;

    const result = await query(queryText, params);

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

    const contracts = result.data.map((c: any) => ({
      ...c,
      total_amount: Number(c.total_amount) || 0,
      platform_fee: Number(c.platform_fee) || 499,
      submitted_deliverables: c.submitted_deliverables || [],
    }));

    return NextResponse.json({ success: true, contracts }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve contracts list';
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
