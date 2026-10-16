import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import type { Contract, ContractDeliverableItem } from '@/types/database';

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

    if (body.status === 'ACCEPTED') {
      // 1. Extract network metadata from request headers
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';

      // 2. Fetch contract details along with creator and agency PANs
      const contractQuery = await query<{
        id: string;
        agency_id: string;
        creator_id: string;
        title: string;
        description: string | null;
        deliverables: ContractDeliverableItem[] | unknown;
        total_amount: number | string;
        platform_fee: number | string;
        status: string;
        deadline: string | null;
        creator_pan: string | null;
        agency_pan: string | null;
      }>(
        `SELECT 
          c.id, c.agency_id, c.creator_id, c.title, c.description, c.deliverables,
          c.total_amount, c.platform_fee, c.status, c.deadline,
          p_creator.pan_number AS creator_pan,
          p_agency.pan_number AS agency_pan
        FROM contracts c
        LEFT JOIN profiles p_creator ON c.creator_id = p_creator.id
        LEFT JOIN profiles p_agency ON c.agency_id = p_agency.id
        WHERE c.id = $1`,
        [id]
      );

      if (!contractQuery.success) {
        return NextResponse.json(
          {
            error: {
              code: contractQuery.error.code,
              message: contractQuery.error.message,
            },
          },
          { status: 500 }
        );
      }

      if (contractQuery.data.length === 0) {
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

      const currentContract = contractQuery.data[0];
      const acceptedAtIso = new Date().toISOString();

      let deliverableType = 'Deliverable';
      if (Array.isArray(currentContract.deliverables) && currentContract.deliverables.length > 0) {
        const firstDeliv = currentContract.deliverables[0] as ContractDeliverableItem;
        deliverableType = firstDeliv?.format || firstDeliv?.title || 'Deliverable';
      }

      // 3. Create canonical snapshot object
      const termsSnapshot: Record<string, unknown> = {
        contract_id: currentContract.id,
        campaign_title: currentContract.title,
        total_amount: Number(currentContract.total_amount) || 0,
        platform_fee: Number(currentContract.platform_fee) || 499,
        deliverable_type: deliverableType,
        deadline: currentContract.deadline,
        creator_id: currentContract.creator_id,
        creator_pan: currentContract.creator_pan || 'PENDING_VERIFICATION',
        agency_id: currentContract.agency_id,
        agency_pan: currentContract.agency_pan || 'PENDING_VERIFICATION',
        accepted_at: acceptedAtIso,
        accepted_ip: clientIp,
        accepted_user_agent: userAgent,
      };

      // 4. Compute SHA-256 cryptographic hash of the terms snapshot
      const signatureHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(termsSnapshot))
        .digest('hex');

      // 5. Update contract with accepted state and audit trail
      const updateResult = await query<Contract>(
        `UPDATE contracts
         SET status = 'ACCEPTED',
             accepted_at = $1,
             accepted_ip = $2,
             accepted_user_agent = $3,
             signature_hash = $4,
             terms_snapshot = $5::jsonb,
             updated_at = NOW()
         WHERE id = $6
         RETURNING id, agency_id, creator_id, title, description, deliverables, total_amount, platform_fee, status, deadline, accepted_at, accepted_ip, accepted_user_agent, signature_hash, terms_snapshot, created_at, updated_at`,
        [acceptedAtIso, clientIp, userAgent, signatureHash, JSON.stringify(termsSnapshot), id]
      );

      if (!updateResult.success) {
        return NextResponse.json(
          {
            error: {
              code: updateResult.error.code,
              message: updateResult.error.message,
            },
          },
          { status: 500 }
        );
      }

      const rawContract = updateResult.data[0];
      const updatedContract: Contract = {
        ...rawContract,
        total_amount: Number(rawContract.total_amount) || 0,
        platform_fee: Number(rawContract.platform_fee) || 499,
      };

      return NextResponse.json(
        {
          success: true,
          contract: updatedContract,
          signature_hash: signatureHash,
        },
        { status: 200 }
      );
    }

    // Status: DECLINED
    const result = await query<Contract>(
      `UPDATE contracts
       SET status = 'DECLINED', updated_at = NOW()
       WHERE id = $1
       RETURNING id, agency_id, creator_id, title, description, deliverables, total_amount, platform_fee, status, deadline, accepted_at, accepted_ip, accepted_user_agent, signature_hash, terms_snapshot, created_at, updated_at`,
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
      `SELECT id, agency_id, creator_id, title, description, deliverables, total_amount, platform_fee, status, deadline, accepted_at, accepted_ip, accepted_user_agent, signature_hash, terms_snapshot, created_at, updated_at
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
