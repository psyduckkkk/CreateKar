import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ContractWithDetails, AdminMetrics, ContractDeliverableItem } from '@/types/database';

export const dynamic = 'force-dynamic';

interface DbDealRow {
  id: string;
  agency_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  deliverables: ContractDeliverableItem[] | string;
  total_amount: string | number;
  platform_fee: string | number;
  status: ContractWithDetails['status'];
  deadline: string | null;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_handle: string;
  invoice_id: string | null;
  invoice_number: string | null;
}

interface DbMetricsRow {
  total_volume: string | number;
  completed_count: string | number;
  active_count: string | number;
}

interface DbCountRow {
  count: string | number;
}

export async function GET() {
  try {
    // 1. Query all contracts with joined creator and invoice details
    const dealsResult = await query<DbDealRow>(
      `SELECT 
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
        p.display_name AS creator_name,
        p.handle AS creator_handle,
        i.id AS invoice_id,
        i.invoice_number AS invoice_number
       FROM contracts c
       JOIN profiles p ON c.creator_id = p.id
       LEFT JOIN invoices i ON i.contract_id = c.id
       ORDER BY c.created_at DESC`
    );

    if (!dealsResult.success) {
      return NextResponse.json(
        {
          error: {
            code: dealsResult.error.code,
            message: dealsResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    // 2. Query summary metrics for contracts
    const metricsResult = await query<DbMetricsRow>(
      `SELECT 
        COALESCE(SUM(total_amount), 0) AS total_volume,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN status IN ('PROPOSED', 'ACCEPTED', 'IN_REVIEW') THEN 1 END) AS active_count
       FROM contracts`
    );

    if (!metricsResult.success) {
      return NextResponse.json(
        {
          error: {
            code: metricsResult.error.code,
            message: metricsResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    // 3. Query count of verified creators
    const verifiedCreatorsResult = await query<DbCountRow>(
      `SELECT COUNT(*) AS count 
       FROM profiles 
       WHERE role = 'creator' AND is_verified = true`
    );

    const metricsData = metricsResult.data[0];
    const totalVolume = Number(metricsData?.total_volume || 0);
    const completedDealsCount = Number(metricsData?.completed_count || 0);
    const activeDealsCount = Number(metricsData?.active_count || 0);
    const totalPlatformRevenue = completedDealsCount * 499;
    const verifiedCreatorsCount = verifiedCreatorsResult.success
      ? Number(verifiedCreatorsResult.data[0]?.count || 0)
      : 0;

    const metrics: AdminMetrics = {
      totalVolume,
      totalPlatformRevenue,
      activeDealsCount,
      completedDealsCount,
      verifiedCreatorsCount,
    };

    const deals: ContractWithDetails[] = dealsResult.data.map((row) => {
      let deliverablesArray: ContractDeliverableItem[] = [];
      if (typeof row.deliverables === 'string') {
        try {
          deliverablesArray = JSON.parse(row.deliverables);
        } catch {
          deliverablesArray = [];
        }
      } else if (Array.isArray(row.deliverables)) {
        deliverablesArray = row.deliverables;
      }

      return {
        id: row.id,
        agency_id: row.agency_id,
        creator_id: row.creator_id,
        title: row.title,
        description: row.description,
        deliverables: deliverablesArray,
        total_amount: Number(row.total_amount) || 0,
        platform_fee: Number(row.platform_fee) || 499,
        status: row.status,
        deadline: row.deadline,
        created_at: row.created_at,
        updated_at: row.updated_at,
        creator_name: row.creator_name,
        creator_handle: row.creator_handle,
        invoice_id: row.invoice_id,
        invoice_number: row.invoice_number,
      };
    });

    return NextResponse.json(
      {
        deals,
        metrics,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error retrieving admin deals';
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
