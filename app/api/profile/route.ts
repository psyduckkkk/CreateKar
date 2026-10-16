import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyUserToken, COOKIE_NAME } from '@/lib/auth';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

interface UpdateProfileBody {
  display_name?: string;
  handle?: string;
  bio?: string;
  niche?: string;
  starting_rate?: number | string;
  upi_id?: string;
  pan_number?: string;
  gstin?: string;
  city?: string;
  state?: string;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifyUserToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const result = await query<Profile>(
      `SELECT id, user_id, email, role, display_name, handle, bio, niche,
              avatar_url, starting_rate, upi_id, pan_number, gstin, city, state,
              is_verified, created_at
       FROM profiles
       WHERE id = $1
       LIMIT 1`,
      [session.id]
    );

    if (!result.success || result.data.length === 0) {
      return NextResponse.json(
        { error: { code: 'PROFILE_NOT_FOUND', message: 'User profile not found' } },
        { status: 404 }
      );
    }

    const raw = result.data[0];
    const profile: Profile = {
      ...raw,
      starting_rate: Number(raw.starting_rate) || 0,
    };

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve profile';
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifyUserToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateProfileBody;

    // Fetch existing profile
    const existing = await query<Profile>(
      `SELECT id, handle, role FROM profiles WHERE id = $1 LIMIT 1`,
      [session.id]
    );

    if (!existing.success || existing.data.length === 0) {
      return NextResponse.json(
        { error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } },
        { status: 404 }
      );
    }

    const current = existing.data[0];

    // Handle uniqueness check if changing
    let cleanHandle = current.handle;
    if (body.handle) {
      const formatted = body.handle.trim().startsWith('@')
        ? body.handle.trim()
        : `@${body.handle.trim()}`;

      if (formatted.toLowerCase() !== current.handle.toLowerCase()) {
        const handleCheck = await query<{ id: string }>(
          `SELECT id FROM profiles WHERE LOWER(handle) = $1 AND id != $2 LIMIT 1`,
          [formatted.toLowerCase(), session.id]
        );

        if (handleCheck.success && handleCheck.data.length > 0) {
          return NextResponse.json(
            {
              error: {
                code: 'HANDLE_TAKEN',
                message: `Handle '${formatted}' is already taken by another profile.`,
              },
            },
            { status: 409 }
          );
        }
      }
      cleanHandle = formatted;
    }

    const displayName = body.display_name?.trim() || session.display_name;
    const bio = body.bio !== undefined ? (body.bio?.trim() || null) : null;
    const niche = body.niche !== undefined ? (body.niche?.trim() || null) : null;
    const startingRate = body.starting_rate !== undefined ? Number(body.starting_rate) || 0 : 0;
    const upiId = body.upi_id !== undefined ? (body.upi_id?.trim() || null) : null;
    const panNumber = body.pan_number !== undefined ? (body.pan_number?.trim().toUpperCase() || null) : null;
    const gstin = body.gstin !== undefined ? (body.gstin?.trim().toUpperCase() || null) : null;
    const city = body.city !== undefined ? (body.city?.trim() || null) : null;
    const state = body.state !== undefined ? (body.state?.trim() || null) : null;

    const updateResult = await query<Profile>(
      `UPDATE profiles
       SET display_name = $1,
           handle = $2,
           bio = COALESCE($3, bio),
           niche = COALESCE($4, niche),
           starting_rate = CASE WHEN $5 > 0 THEN $5 ELSE starting_rate END,
           upi_id = COALESCE($6, upi_id),
           pan_number = COALESCE($7, pan_number),
           gstin = COALESCE($8, gstin),
           city = COALESCE($9, city),
           state = COALESCE($10, state)
       WHERE id = $11
       RETURNING id, user_id, email, role, display_name, handle, bio, niche,
                 avatar_url, starting_rate, upi_id, pan_number, gstin, city, state,
                 is_verified, created_at`,
      [
        displayName,
        cleanHandle,
        bio,
        niche,
        startingRate,
        upiId,
        panNumber,
        gstin,
        city,
        state,
        session.id,
      ]
    );

    if (!updateResult.success || updateResult.data.length === 0) {
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Failed to update profile record' } },
        { status: 500 }
      );
    }

    const raw = updateResult.data[0];
    const profile: Profile = {
      ...raw,
      starting_rate: Number(raw.starting_rate) || 0,
    };

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating profile';
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
