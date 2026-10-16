import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

interface PatchCreatorVerificationBody {
  is_verified: boolean;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_PROFILE_ID',
            message: 'Creator profile ID is required in URL parameter.',
          },
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as PatchCreatorVerificationBody;

    if (body === null || typeof body.is_verified !== 'boolean') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'is_verified must be a boolean value (true or false).',
          },
        },
        { status: 400 }
      );
    }

    const result = await query<Profile>(
      `UPDATE profiles
       SET is_verified = $1
       WHERE id = $2 AND role = 'creator'
       RETURNING 
        id, 
        user_id, 
        role, 
        display_name, 
        handle, 
        bio, 
        niche, 
        avatar_url, 
        starting_rate, 
        upi_id, 
        pan_number, 
        gstin, 
        city, 
        state, 
        is_verified, 
        created_at`,
      [body.is_verified, id]
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: result.error.code,
            message: result.error.message,
          },
        },
        { status: 500 }
      );
    }

    if (result.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'CREATOR_NOT_FOUND',
            message: `Creator profile with ID '${id}' was not found.`,
          },
        },
        { status: 404 }
      );
    }

    const rawProfile = result.data[0];
    const updatedProfile: Profile = {
      ...rawProfile,
      starting_rate: Number(rawProfile.starting_rate) || 0,
      is_verified: Boolean(rawProfile.is_verified),
    };

    return NextResponse.json(
      {
        success: true,
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error updating creator verification';
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
