import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query<Profile>(
      `SELECT 
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
        created_at
       FROM profiles
       WHERE role = 'creator'
       ORDER BY created_at DESC`
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

    const creators: Profile[] = result.data.map((c) => ({
      ...c,
      starting_rate: Number(c.starting_rate) || 0,
      is_verified: Boolean(c.is_verified),
    }));

    return NextResponse.json({ creators }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to query creator profiles';
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
