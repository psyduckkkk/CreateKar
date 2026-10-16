import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    const user = await verifyUserToken(token);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error retrieving session';
    return NextResponse.json(
      { authenticated: false, error: message },
      { status: 500 }
    );
  }
}
