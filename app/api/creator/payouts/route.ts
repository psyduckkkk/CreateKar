import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Get creator profile banking/UPI info
    const profileRows = await query(
      `SELECT upi_id, bank_account_number, bank_ifsc, plan_tier, badge_type
       FROM creator_profiles WHERE user_id = $1`,
      [session.userId]
    );

    // 2. Get payout transactions (both Escrow and Direct P2P)
    const transactions = await query(
      `SELECT pt.*, c.title as contract_title, c.contract_number,
              u.name as agency_name, a.company_name
       FROM payment_transactions pt
       JOIN contracts c ON pt.contract_id = c.id
       JOIN users u ON c.agency_id = u.id
       JOIN agency_profiles a ON c.agency_id = a.user_id
       WHERE c.creator_id = $1
       ORDER BY pt.created_at DESC`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      payoutDetails: profileRows[0] || {},
      transactions,
    });
  } catch (error) {
    console.error("Fetch creator payouts error:", error);
    return NextResponse.json({ error: "Failed to load payouts" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { upiId, bankAccountNumber, bankIfsc } = body;

    // Financial detail validation
    if (upiId && typeof upiId === "string" && upiId.trim()) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiId.trim())) {
        return NextResponse.json({ error: "Please enter a valid UPI VPA address (e.g. name@okhdfcbank)." }, { status: 400 });
      }
    }

    if (bankIfsc && typeof bankIfsc === "string" && bankIfsc.trim()) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(bankIfsc.trim().toUpperCase())) {
        return NextResponse.json({ error: "Invalid RBI IFSC format. Must be 11 characters (e.g. HDFC0001234)." }, { status: 400 });
      }
    }

    if (bankAccountNumber && typeof bankAccountNumber === "string" && bankAccountNumber.trim()) {
      const accRegex = /^[0-9]{9,18}$/;
      if (!accRegex.test(bankAccountNumber.trim())) {
        return NextResponse.json({ error: "Bank account number must be 9-18 digits." }, { status: 400 });
      }
    }

    await query(
      `UPDATE creator_profiles
       SET upi_id = $1,
           bank_account_number = $2,
           bank_ifsc = $3,
           updated_at = NOW()
       WHERE user_id = $4`,
      [
        upiId ? upiId.trim() : null,
        bankAccountNumber ? bankAccountNumber.trim() : null,
        bankIfsc ? bankIfsc.trim().toUpperCase() : null,
        session.userId
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Payout and bank details updated successfully!",
    });
  } catch (error) {
    console.error("Update payout details error:", error);
    return NextResponse.json({ error: "Failed to update payout details" }, { status: 500 });
  }
}
