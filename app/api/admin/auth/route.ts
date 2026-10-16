import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AuthRequestBody {
  password?: string;
}

const COOKIE_NAME = 'createkar_admin_auth';
const DEFAULT_SECRET = 'createkar_ops_2026';
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuthRequestBody;
    const { password } = body || {};

    const expectedSecret = process.env.ADMIN_SECRET || DEFAULT_SECRET;

    if (!password || password.trim() !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set(COOKIE_NAME, expectedSecret, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_IN_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal authentication error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true }, { status: 200 });

    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error logging out';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
