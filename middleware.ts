import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'createkar_session';
const DEFAULT_AUTH_SECRET = 'createkar_production_super_secret_auth_jwt_key_2026_xyz';

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
  return new TextEncoder().encode(secret);
}

interface TokenPayload {
  id: string;
  email: string;
  role: 'creator' | 'agency' | 'admin';
  display_name: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }
    return {
      id: String(payload.id),
      email: String(payload.email),
      role: payload.role as 'creator' | 'agency' | 'admin',
      display_name: String(payload.display_name || ''),
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth APIs without middleware blocking
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Read session token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  // Check admin secret key backup cookie
  const adminSecretCookie = request.cookies.get('createkar_admin_auth')?.value;
  const adminSecret = process.env.ADMIN_SECRET || 'createkar_ops_2026';
  const hasAdminSecretAuth = Boolean(adminSecretCookie && adminSecretCookie === adminSecret);

  // 1. If user is logged in and visits /login or /signup, redirect to role-specific dashboard
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      const homeUrl =
        user.role === 'admin'
          ? '/admin'
          : user.role === 'agency'
          ? '/agency/dashboard'
          : '/dashboard';
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow /admin/login for secret key authentication
  if (pathname === '/admin/login' || pathname === '/api/admin/auth') {
    if (user?.role === 'admin' || hasAdminSecretAuth) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 3. API route protection for /api/admin
  if (pathname.startsWith('/api/admin')) {
    if (user?.role === 'admin' || hasAdminSecretAuth) {
      return NextResponse.next();
    }
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Unauthorized admin access.' } },
      { status: 401 }
    );
  }

  // 4. Protected page routes: /dashboard, /agency, /admin, /settings
  const isProtectedPath =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/agency' ||
    pathname.startsWith('/agency/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/');

  if (isProtectedPath) {
    // If not authenticated at all:
    if (!user) {
      // If they have admin secret cookie for /admin, allow
      if ((pathname === '/admin' || pathname.startsWith('/admin/')) && hasAdminSecretAuth) {
        return NextResponse.next();
      }

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-Based Access Control (RBAC)
    const role = user.role;

    // A. /admin routes -> Deny unless role === 'admin'
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      if (role === 'admin' || hasAdminSecretAuth) {
        return NextResponse.next();
      }
      // Redirect creator or agency to their home dashboard
      const home = role === 'agency' ? '/agency/dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(home, request.url));
    }

    // B. /agency routes -> Deny unless role === 'agency' or 'admin'
    if (pathname === '/agency' || pathname.startsWith('/agency/')) {
      if (role === 'agency' || role === 'admin') {
        return NextResponse.next();
      }
      // Creator attempted to access agency dashboard -> redirect to creator dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // C. /dashboard routes -> Deny unless role === 'creator' or 'admin'
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      if (role === 'creator' || role === 'admin') {
        return NextResponse.next();
      }
      // Agency attempted to access creator dashboard -> redirect to agency dashboard
      return NextResponse.redirect(new URL('/agency/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/agency',
    '/agency/:path*',
    '/admin',
    '/admin/:path*',
    '/settings',
    '/settings/:path*',
    '/api/admin/:path*',
    '/login',
    '/signup',
  ],
};
