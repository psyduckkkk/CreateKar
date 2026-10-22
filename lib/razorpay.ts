import Razorpay from "razorpay";
import crypto from "crypto";

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

export const razorpayClient = new Razorpay({
  key_id,
  key_secret,
});

export type PaymentMode = "ESCROW_RAZORPAY" | "DIRECT_P2P";

export interface CreateEscrowOrderParams {
  amountPaise: number; // in paise
  currency?: "INR" | "USD" | "EUR" | "GBP" | "SGD" | "AED";
  receipt: string;
  creatorRazorpayAccountId?: string;
  notes?: Record<string, string>;
  isInternational?: boolean;
}

/**
 * MODE A: Razorpay Route Escrow Order
 * Creates an order configured for Nodal Hold & Route Split settlement.
 */
export async function createEscrowOrder({
  amountPaise,
  currency = "INR",
  receipt,
  notes = {},
  isInternational = false,
}: CreateEscrowOrderParams) {
  try {
    const options = {
      amount: amountPaise,
      currency,
      receipt,
      payment_capture: true,
      notes: {
        ...notes,
        is_international: isInternational ? "true" : "false",
        mode: "ESCROW_RAZORPAY",
        platform: "CreateKar",
      },
    };

    const order = await razorpayClient.orders.create(options);
    return { success: true, order };
  } catch (error: any) {
    console.error("Razorpay escrow order creation error:", error);
    return { success: false, error: error.message || "Failed to create escrow order" };
  }
}

/**
 * Transfers funds to creator's linked account with on_hold: 1
 */
export async function transferToCreatorOnHold({
  paymentId,
  creatorAccountId,
  amountPaise,
}: {
  paymentId: string;
  creatorAccountId: string;
  amountPaise: number;
}) {
  try {
    const transfer = await (razorpayClient.payments as any).transfer(paymentId, {
      transfers: [
        {
          account: creatorAccountId,
          amount: amountPaise,
          currency: "INR",
          on_hold: 1, // HELD until deliverable approval
          notes: {
            reason: "CreateKar Campaign Escrow Hold",
          },
        },
      ],
    });
    return { success: true, transfer };
  } catch (error: any) {
    console.error("Razorpay Route hold transfer error:", error);
    return { success: false, error: error.message || "Failed to place funds on hold" };
  }
}

/**
 * Unholds and releases the escrow payment to the creator
 */
export async function releaseEscrowTransfer(transferId: string) {
  try {
    const result = await (razorpayClient as any).transfers.unhold(transferId);
    return { success: true, result };
  } catch (error: any) {
    console.error("Razorpay Route release error:", error);
    return { success: false, error: error.message || "Failed to release escrow transfer" };
  }
}

/**
 * MODE B: Direct P2P Verification Validator
 * Validates UTR / Transaction Reference format for Indian UPI and IMPS/NEFT transfers.
 */
export function validateP2pTransactionReference(utrNumber: string): { valid: boolean; message: string } {
  const trimmed = utrNumber.trim();
  // Standard Indian 12-digit UPI reference or 16-22 character alphanumeric bank UTR
  const upiRegex = /^[0-9]{12}$/;
  const bankUtrRegex = /^[A-Za-z0-9]{12,22}$/;

  if (!trimmed) {
    return { valid: false, message: "Transaction reference / UTR number is required." };
  }
  if (!upiRegex.test(trimmed) && !bankUtrRegex.test(trimmed)) {
    return { valid: false, message: "Please enter a valid 12-digit UPI reference number or bank UTR code." };
  }

  return { valid: true, message: "Valid transaction reference." };
}

/**
 * Verifies Razorpay HMAC signature
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
