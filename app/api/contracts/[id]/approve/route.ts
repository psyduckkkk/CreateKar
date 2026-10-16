import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Contract } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function POST(
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

    // 1. Fetch target contract
    const contractResult = await query<Contract>(
      `SELECT id, agency_id, creator_id, title, total_amount, platform_fee, status 
       FROM contracts 
       WHERE id = $1`,
      [id]
    );

    if (!contractResult.success) {
      return NextResponse.json(
        {
          error: {
            code: contractResult.error.code,
            message: contractResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    if (contractResult.data.length === 0) {
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

    const contract = contractResult.data[0];

    // 2. Validate that contract status is 'IN_REVIEW'
    if (contract.status !== 'IN_REVIEW') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_STATUS',
            message: `Contract must be in 'IN_REVIEW' status to be approved. Current status is '${contract.status}'.`,
          },
        },
        { status: 400 }
      );
    }

    // Check if an invoice already exists for this contract
    const existingInvoiceResult = await query<{ id: string }>(
      `SELECT id FROM invoices WHERE contract_id = $1 LIMIT 1`,
      [id]
    );

    if (existingInvoiceResult.success && existingInvoiceResult.data.length > 0) {
      const existingInvoiceId = existingInvoiceResult.data[0].id;

      // Ensure contract is set to COMPLETED
      await query(
        `UPDATE contracts SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
        [id]
      );
      await query(
        `UPDATE deliverables SET status = 'APPROVED', updated_at = NOW() WHERE contract_id = $1`,
        [id]
      );

      return NextResponse.json(
        {
          success: true,
          invoiceId: existingInvoiceId,
        },
        { status: 200 }
      );
    }

    // 3. Fetch latest invoice count to generate sequential invoice number: CK-2026-XXXX
    const countResult = await query<{ count: string }>(
      `SELECT count(*) as count FROM invoices`
    );

    if (!countResult.success) {
      return NextResponse.json(
        {
          error: {
            code: countResult.error.code,
            message: countResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    const invoiceCount = Number(countResult.data[0]?.count || 0);
    const invoiceNumber = `CK-2026-${String(invoiceCount + 1).padStart(4, '0')}`;

    // 4. Calculate tax breakdown assuming 18% standard GST on total_amount
    const totalAmount = Number(contract.total_amount) || 0;
    const taxableAmount = Math.round((totalAmount / 1.18) * 100) / 100;
    const cgstAmount = Math.round((taxableAmount * 0.09) * 100) / 100;
    const sgstAmount = Math.round((taxableAmount * 0.09) * 100) / 100;
    const igstAmount = 0.0;
    const platformFee = 499.0;

    // 5. Update contracts status to 'COMPLETED'
    const updateContractResult = await query(
      `UPDATE contracts 
       SET status = 'COMPLETED', updated_at = NOW() 
       WHERE id = $1`,
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

    // Update submitted deliverables for this contract to 'APPROVED'
    await query(
      `UPDATE deliverables 
       SET status = 'APPROVED', updated_at = NOW() 
       WHERE contract_id = $1 AND status = 'SUBMITTED'`,
      [id]
    );

    // 6. Insert into invoices table
    const insertInvoiceResult = await query<{ id: string }>(
      `INSERT INTO invoices (
        contract_id,
        invoice_number,
        taxable_amount,
        cgst_amount,
        sgst_amount,
        igst_amount,
        platform_fee,
        total_amount,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW()
      )
      RETURNING id`,
      [
        id,
        invoiceNumber,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        platformFee,
        totalAmount,
      ]
    );

    if (!insertInvoiceResult.success) {
      return NextResponse.json(
        {
          error: {
            code: insertInvoiceResult.error.code,
            message: insertInvoiceResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    if (insertInvoiceResult.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVOICE_INSERT_EMPTY',
            message: 'No invoice record returned after insertion.',
          },
        },
        { status: 500 }
      );
    }

    const createdInvoiceId = insertInvoiceResult.data[0].id;

    return NextResponse.json(
      {
        success: true,
        invoiceId: createdInvoiceId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error approving contract';
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
