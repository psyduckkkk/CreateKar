import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await query(
      `SELECT u.name, u.email, u.phone,
              cp.niche, cp.bio, cp.instagram_handle, cp.youtube_handle,
              cp.followers_count, cp.base_rate_inr, cp.upi_id,
              cp.bank_account_number, cp.bank_ifsc, cp.gstin, cp.pan,
              cp.billing_address, cp.plan_tier, cp.badge_type,
              cp.contracts_created_count, cp.boost_active_until
       FROM users u
       LEFT JOIN creator_profiles cp ON u.id = cp.user_id
       WHERE u.id = $1`,
      [session.userId]
    );

    return NextResponse.json({ profile: res.rows[0] });
  } catch (err: any) {
    console.error("Fetch creator profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      bio,
      niche,
      instagram_handle,
      youtube_handle,
      base_rate_inr,
      pan,
      gstin,
      billing_address,
      upi_id,
      bank_account_number,
      bank_ifsc
    } = body;

    // Validate name
    if (name && typeof name === "string" && name.trim()) {
      await query(`UPDATE users SET name = $1, phone = COALESCE($2, phone) WHERE id = $3`, [
        name.trim(),
        phone ? phone.trim() : null,
        session.userId
      ]);
    }

    // Validate UPI & Bank if provided
    if (upi_id && typeof upi_id === "string" && upi_id.trim()) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upi_id.trim())) {
        return NextResponse.json({ error: "Please enter a valid UPI ID (e.g. yourname@bank)." }, { status: 400 });
      }
    }

    if (bank_ifsc && typeof bank_ifsc === "string" && bank_ifsc.trim()) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(bank_ifsc.trim().toUpperCase())) {
        return NextResponse.json({ error: "Invalid 11-digit IFSC code format." }, { status: 400 });
      }
    }

    await query(
      `UPDATE creator_profiles
       SET bio = COALESCE($1, bio),
           niche = COALESCE($2, niche),
           instagram_handle = COALESCE($3, instagram_handle),
           youtube_handle = COALESCE($4, youtube_handle),
           base_rate_inr = COALESCE($5, base_rate_inr),
           pan = COALESCE($6, pan),
           gstin = COALESCE($7, gstin),
           billing_address = COALESCE($8, billing_address),
           upi_id = COALESCE($9, upi_id),
           bank_account_number = COALESCE($10, bank_account_number),
           bank_ifsc = COALESCE($11, bank_ifsc),
           updated_at = NOW()
       WHERE user_id = $12`,
      [
        bio ? bio.trim() : null,
        niche ? niche.trim() : null,
        instagram_handle ? instagram_handle.trim() : null,
        youtube_handle ? youtube_handle.trim() : null,
        base_rate_inr ? Math.max(0, Number(base_rate_inr)) : null,
        pan ? pan.trim().toUpperCase() : null,
        gstin ? gstin.trim().toUpperCase() : null,
        billing_address ? billing_address.trim() : null,
        upi_id ? upi_id.trim() : null,
        bank_account_number ? bank_account_number.trim() : null,
        bank_ifsc ? bank_ifsc.trim().toUpperCase() : null,
        session.userId
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Creator profile updated successfully!"
    });
  } catch (err: any) {
    console.error("Update creator profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
