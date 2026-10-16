import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query<Profile>(
      `SELECT id, display_name, handle, bio, niche, avatar_url, starting_rate, city 
       FROM profiles 
       WHERE role = 'creator' AND is_verified = true 
       ORDER BY display_name ASC`
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
    }));

    return NextResponse.json({ creators }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to query creators from database';
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_QUERY_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
