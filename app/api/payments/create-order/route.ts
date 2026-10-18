import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyUserToken, COOKIE_NAME } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import type { Contract } from '@/types/database';

export const dynamic = 'force-dynamic';

interface CreateOrderRequestBody {
  contractId: string;
  feeType?: 'PLATFORM_FEE' | 'TOTAL_ESCROW';
  currency?: string;
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifyUserToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required to initiate checkout.' } },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateOrderRequestBody;
    const { contractId } = body;
    const feeType = body.feeType || 'PLATFORM_FEE';
    const currency = (body.currency || 'INR').toUpperCase().trim();

    if (!contractId) {
      return NextResponse.json(
        { error: { code: 'MISSING_CONTRACT_ID', message: 'contractId is required.' } },
        { status: 400 }
      );
    }

    // 2. Query target contract
    const contractResult = await query<Contract>(
      `SELECT id, agency_id, creator_id, title, total_amount, platform_fee, status, payment_status
       FROM contracts
       WHERE id = $1
       LIMIT 1`,
      [contractId]
    );

    if (!contractResult.success || contractResult.data.length === 0) {
      return NextResponse.json(
        { error: { code: 'CONTRACT_NOT_FOUND', message: 'Contract was not found.' } },
        { status: 404 }
      );
    }

    const contract = contractResult.data[0];

    // Verify agency authorization (or staff admin)
    if (session.role === 'agency' && contract.agency_id !== session.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You are not authorized to make payments for this contract.' } },
        { status: 403 }
      );
    }

    // 3. Calculate amount based on feeType and currency
    let amount = 499;
    if (feeType === 'PLATFORM_FEE') {
      if (currency === 'USD') {
        amount = 6; // Standard equivalent in USD ($6)
      } else if (currency === 'EUR') {
        amount = 6; // Standard equivalent in EUR (€6)
      } else if (currency === 'GBP') {
        amount = 5; // Standard equivalent in GBP (£5)
      } else {
        amount = 499; // Standard domestic INR (₹499)
      }
    } else {
      amount = Number(contract.total_amount) || 499;
    }

    // 4. Create Razorpay order
    const receipt = `ck_${contractId.slice(0, 8)}_${Date.now().toString().slice(-6)}`;
    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt,
      notes: {
        contract_id: contractId,
        fee_type: feeType,
        agency_id: session.id,
        contract_title: contract.title.slice(0, 40),
      },
    });

    // 5. Insert payment record into platform_payments
    await query(
      `INSERT INTO platform_payments (
         contract_id,
         agency_id,
         fee_type,
         amount,
         currency,
         razorpay_order_id,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'CREATED')`,
      [contractId, session.id, feeType, amount, currency, order.id]
    );

    // 6. Update contract with current razorpay_order_id
    await query(
      `UPDATE contracts
       SET razorpay_order_id = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [order.id, contractId]
    );

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_CreateKar2026';

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating Razorpay order';
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
