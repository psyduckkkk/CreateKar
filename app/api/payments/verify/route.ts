import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyUserToken, COOKIE_NAME } from '@/lib/auth';
import { verifyPaymentSignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

interface VerifyPaymentRequestBody {
  orderId: string;
  paymentId: string;
  signature: string;
  contractId: string;
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifyUserToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to verify payment.' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as VerifyPaymentRequestBody;
    const { orderId, paymentId, signature, contractId } = body;

    if (!orderId || !paymentId || !signature || !contractId) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification parameters.' },
        { status: 400 }
      );
    }

    // 2. Cryptographic HMAC SHA-256 signature verification
    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      // Record failed attempt in platform_payments if record exists
      await query(
        `UPDATE platform_payments
         SET status = 'FAILED',
             razorpay_payment_id = $1,
             razorpay_signature = $2,
             updated_at = NOW()
         WHERE razorpay_order_id = $3`,
        [paymentId, signature, orderId]
      );

      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // 3. Update platform_payments to CAPTURED
    await query(
      `UPDATE platform_payments
       SET status = 'CAPTURED',
           razorpay_payment_id = $1,
           razorpay_signature = $2,
           updated_at = NOW()
       WHERE razorpay_order_id = $3 OR contract_id = $4`,
      [paymentId, signature, orderId, contractId]
    );

    // 4. Update contracts record to PAID
    await query(
      `UPDATE contracts
       SET payment_status = 'PAID',
           razorpay_payment_id = $1,
           status = CASE WHEN status = 'DRAFT' THEN 'PROPOSED' ELSE status END,
           updated_at = NOW()
       WHERE id = $2`,
      [paymentId, contractId]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error verifying payment signature';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
