import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("SECURITY ALERT: AUTH_SECRET environment variable is missing in production.");
}

const JWT_SECRET_STRING = process.env.AUTH_SECRET || "createkar_fallback_secret_key_minimum_32_chars_xyz";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
export const COOKIE_NAME = "ck_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "CREATOR" | "AGENCY" | "ADMIN" | "SUPER_ADMIN";
  name: string;
}

/**
 * Hash a plain text password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password against stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT session token valid for 7 days
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieve current user session from HttpOnly cookies in Server Components / Actions
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const getSession = getCurrentSession;
