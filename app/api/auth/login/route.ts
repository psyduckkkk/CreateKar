import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, signUserToken, COOKIE_NAME, FOURTEEN_DAYS_SECONDS } from '@/lib/auth';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

interface LoginRequestBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequestBody;
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query profile by email
    const profileResult = await query<Profile>(
      `SELECT id, email, password_hash, role, display_name, handle 
       FROM profiles 
       WHERE LOWER(email) = $1 
       LIMIT 1`,
      [cleanEmail]
    );

    if (!profileResult.success || profileResult.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    const user = profileResult.data[0];

    // Check if password_hash exists
    if (!user.password_hash) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    // Verify password against stored hash using bcryptjs
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    // Sign JWT Token with jose
    const token = await signUserToken({
      id: user.id,
      email: cleanEmail,
      role: (user.role || 'creator') as 'creator' | 'agency' | 'admin',
      display_name: user.display_name,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        success: true,
        role: user.role,
        user: {
          id: user.id,
          email: cleanEmail,
          role: user.role,
          display_name: user.display_name,
        },
      },
      { status: 200 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: FOURTEEN_DAYS_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal authentication error';
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
