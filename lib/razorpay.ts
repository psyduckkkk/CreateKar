import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay client with fallback for build-time safety
const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

export const razorpayClient = new Razorpay({
  key_id,
  key_secret,
});

export interface CreateOrderParams {
  amount: number; // in minor units (e.g., paise for INR, cents for USD)
  currency?: "INR" | "USD" | "EUR" | "GBP" | "SGD" | "AED";
  receipt: string;
  notes?: Record<string, string>;
  isInternational?: boolean;
}

/**
 * Creates an escrow funding order supporting both domestic (INR) and international currencies.
 */
export async function createEscrowOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
  isInternational = false,
}: CreateOrderParams) {
  try {
    const options = {
      amount,
      currency,
      receipt,
      payment_capture: true, // auto capture into escrow nodal account
      notes: {
        ...notes,
        is_international: isInternational ? "true" : "false",
        platform: "CreateKar",
      },
    };

    const order = await razorpayClient.orders.create(options);
    return { success: true, order };
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return { success: false, error: error.message || "Failed to create payment order" };
  }
}

/**
 * Verifies Razorpay payment signature using SHA-256 HMAC
 */
export function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!key_secret) return false;
  
  const hmac = crypto.createHmac("sha256", key_secret);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
}
