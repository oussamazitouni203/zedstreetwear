// Pure, edge-safe session token helpers (no next/headers import here so this
// module can be used from middleware, which runs on the Edge runtime).
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-insecure-secret-change-me'
);
const alg = 'HS256';

export const SESSION_COOKIE = 'zsw_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload; // { sub, email, role, name }
  } catch {
    return null;
  }
}
