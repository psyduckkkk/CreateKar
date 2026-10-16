import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { AuthUser } from '@/types/database';

export const COOKIE_NAME = 'createkar_session';
export const FOURTEEN_DAYS_SECONDS = 14 * 24 * 60 * 60; // 14 days in seconds

const DEFAULT_AUTH_SECRET = 'createkar_production_super_secret_auth_jwt_key_2026_xyz';

export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Password Hashing (Node runtime) using bcryptjs (salt rounds: 12)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * JWT & Session Management (Edge & Node compatible via jose)
 * Signs with HS256, 14-day expiration
 */
export async function signUserToken(payload: {
  id: string;
  email: string;
  role: 'creator' | 'agency' | 'admin';
  display_name: string;
}): Promise<string> {
  const secret = getAuthSecret();
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    role: payload.role,
    display_name: payload.display_name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(secret);
}

export async function verifyUserToken(
  token: string
): Promise<{ id: string; email: string; role: 'creator' | 'agency' | 'admin'; display_name: string } | null> {
  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret);

    if (!payload.id || !payload.email || !payload.role || !payload.display_name) {
      return null;
    }

    return {
      id: String(payload.id),
      email: String(payload.email),
      role: payload.role as 'creator' | 'agency' | 'admin',
      display_name: String(payload.display_name),
    };
  } catch {
    return null;
  }
}
