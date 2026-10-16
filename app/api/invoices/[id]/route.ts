import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_INVOICE_ID',
            message: 'Invoice ID or Contract ID is required in URL parameter.',
          },
        },
        { status: 400 }
      );
    }

    // Query invoice by its own ID OR by contract_id
    const invoiceQuery = await query(
      `SELECT 
        i.id,
        i.contract_id,
        i.invoice_number,
        i.taxable_amount,
        i.cgst_amount,
        i.sgst_amount,
        i.igst_amount,
        i.platform_fee,
        i.total_amount,
        i.pdf_url,
        i.created_at,
        c.title AS contract_title,
        c.deliverables,
        c.status AS contract_status,
        c.deadline AS contract_deadline,
        p_creator.display_name AS creator_name,
        p_creator.handle AS creator_handle,
        p_creator.pan_number AS creator_pan,
        p_creator.gstin AS creator_gstin,
        p_creator.city AS creator_city,
        p_creator.state AS creator_state,
        p_creator.upi_id AS creator_upi,
        p_agency.display_name AS agency_name,
        p_agency.handle AS agency_handle,
        p_agency.pan_number AS agency_pan,
        p_agency.gstin AS agency_gstin,
        p_agency.city AS agency_city,
        p_agency.state AS agency_state
       FROM invoices i
       JOIN contracts c ON i.contract_id = c.id
       JOIN profiles p_creator ON c.creator_id = p_creator.id
       LEFT JOIN profiles p_agency ON c.agency_id = p_agency.id
       WHERE i.id::text = $1 OR i.contract_id::text = $1
       LIMIT 1`,
      [id]
    );

    if (!invoiceQuery.success) {
      return NextResponse.json(
        {
          error: {
            code: invoiceQuery.error.code,
            message: invoiceQuery.error.message,
          },
        },
        { status: 500 }
      );
    }

    if (invoiceQuery.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVOICE_NOT_FOUND',
            message: `Invoice record matching '${id}' was not found.`,
          },
        },
        { status: 404 }
      );
    }

    const row = invoiceQuery.data[0] as any;
    const invoice = {
      id: row.id,
      contract_id: row.contract_id,
      invoice_number: row.invoice_number,
      taxable_amount: Number(row.taxable_amount) || 0,
      cgst_amount: Number(row.cgst_amount) || 0,
      sgst_amount: Number(row.sgst_amount) || 0,
      igst_amount: Number(row.igst_amount) || 0,
      platform_fee: Number(row.platform_fee) || 499,
      total_amount: Number(row.total_amount) || 0,
      pdf_url: row.pdf_url,
      created_at: row.created_at,
      contract: {
        title: row.contract_title,
        deliverables: row.deliverables,
        status: row.contract_status,
        deadline: row.contract_deadline,
      },
      creator: {
        name: row.creator_name,
        handle: row.creator_handle,
        pan: row.creator_pan,
        gstin: row.creator_gstin,
        city: row.creator_city,
        state: row.creator_state,
        upi: row.creator_upi,
      },
      agency: {
        name: row.agency_name || 'CreateKar Brand Studio',
        handle: row.agency_handle || '@ckbrand',
        pan: row.agency_pan || 'AAACK1234F',
        gstin: row.agency_gstin || '29AAACK1234F1Z5',
        city: row.agency_city || 'Bengaluru',
        state: row.agency_state || 'Karnataka',
      },
    };

    return NextResponse.json({ success: true, invoice }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve invoice details';
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
