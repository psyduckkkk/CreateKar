import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'createkar_admin_auth';
const DEFAULT_SECRET = 'createkar_ops_2026';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get(COOKIE_NAME)?.value;
  const expectedSecret = process.env.ADMIN_SECRET || DEFAULT_SECRET;
  const isAuthenticated = Boolean(authCookie && authCookie === expectedSecret);

  // 1. Handle login page
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow admin auth API routes through for login/logout
  if (pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  // 3. If authenticated, allow request to proceed
  if (isAuthenticated) {
    return NextResponse.next();
  }

  // 4. For API routes, return 401 Unauthorized JSON
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized admin access. Please authenticate at /admin/login.',
        },
      },
      { status: 401 }
    );
  }

  // 5. For page routes under /admin, redirect to /admin/login
  const loginUrl = new URL('/admin/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
