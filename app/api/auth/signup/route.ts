import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, signUserToken, COOKIE_NAME, FOURTEEN_DAYS_SECONDS } from '@/lib/auth';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

interface SignupRequestBody {
  email?: string;
  password?: string;
  role?: 'creator' | 'agency';
  display_name?: string;
  handle?: string;
  niche?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupRequestBody;
    const { email, password, role, display_name, handle, niche } = body || {};

    // 1. Validate required fields
    if (!email || !password || !role || !display_name || !handle) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, password, role, full name, and handle are required.',
          },
        },
        { status: 400 }
      );
    }

    // 2. Validate email syntax
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please provide a valid email address.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate password length (min 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        {
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password must be at least 8 characters long.',
          },
        },
        { status: 400 }
      );
    }

    // 4. Validate role
    if (!['creator', 'agency'].includes(role)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ROLE',
            message: "Role must be either 'creator' or 'agency'.",
          },
        },
        { status: 400 }
      );
    }

    // 5. Check if email already registered
    const existingUser = await query<{ id: string }>(
      `SELECT id FROM profiles WHERE LOWER(email) = $1 LIMIT 1`,
      [cleanEmail]
    );

    if (existingUser.success && existingUser.data.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email address already exists. Please log in.',
          },
        },
        { status: 409 }
      );
    }

    // 6. Format handle
    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;

    // Check handle availability
    const existingHandle = await query<{ id: string }>(
      `SELECT id FROM profiles WHERE LOWER(handle) = $1 LIMIT 1`,
      [cleanHandle.toLowerCase()]
    );

    if (existingHandle.success && existingHandle.data.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'HANDLE_TAKEN',
            message: `Handle '${cleanHandle}' is already claimed. Please choose another.`,
          },
        },
        { status: 409 }
      );
    }

    // 7. Hash password using bcryptjs (salt rounds: 12)
    const passwordHash = await hashPassword(password);

    // 8. Insert profile record
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const insertResult = await query<Profile>(
      `INSERT INTO profiles (
        user_id,
        email,
        password_hash,
        role,
        display_name,
        handle,
        niche,
        is_verified
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, true
      )
      RETURNING id, user_id, email, role, display_name, handle`,
      [
        userId,
        cleanEmail,
        passwordHash,
        role,
        display_name.trim(),
        cleanHandle,
        niche?.trim() || (role === 'creator' ? 'General' : 'Brand Studio'),
      ]
    );

    if (!insertResult.success || insertResult.data.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INSERT_FAILED',
            message: insertResult.success ? 'Failed to create profile.' : insertResult.error.message,
          },
        },
        { status: 500 }
      );
    }

    const createdUser = insertResult.data[0];

    // 9. Sign JWT Token with jose
    const token = await signUserToken({
      id: createdUser.id,
      email: cleanEmail,
      role: createdUser.role as 'creator' | 'agency',
      display_name: createdUser.display_name,
    });

    // 10. Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: createdUser.id,
          email: cleanEmail,
          role: createdUser.role,
          display_name: createdUser.display_name,
        },
      },
      { status: 201 }
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
    const message = error instanceof Error ? error.message : 'Internal error processing signup';
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
