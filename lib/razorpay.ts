import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Razorpay Server-Side Payment Utility
 * Configured with API keys for domestic UPI/Netbanking and multi-currency card processing.
 */

const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_CreateKar2026';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'createkar_razorpay_secret_2026';

export const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export interface CreateOrderParams {
  amount: number; // In main currency unit (e.g., 499 for ₹499 INR, 6 for $6 USD)
  currency?: string; // INR, USD, EUR, GBP
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number; // In smallest currency subunit (paise/cents)
  currency: string;
  receipt?: string;
  status: string;
  notes?: Record<string, string>;
}

/**
 * Creates an order in Razorpay with smallest subunit conversion (e.g., 499 INR -> 49900 paise).
 */
export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes,
}: CreateOrderParams): Promise<RazorpayOrderResponse> {
  const normalizedCurrency = currency.toUpperCase().trim();
  // Subunit conversion: 100 paise = 1 INR, 100 cents = 1 USD/EUR/GBP
  const amountSubunit = Math.round(Number(amount) * 100);

  const order = await razorpay.orders.create({
    amount: amountSubunit,
    currency: normalizedCurrency,
    receipt: receipt || `rcpt_${Date.now()}`,
    notes: notes || {},
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
    notes: (order.notes as Record<string, string>) || {},
  };
}

/**
 * Cryptographically verifies the Razorpay payment signature using HMAC SHA-256.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(payload)
    .digest('hex');

  if (generatedSignature.length !== signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}
