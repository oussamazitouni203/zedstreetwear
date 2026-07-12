// Server-side auth helpers (Node runtime): password hashing + session cookie.
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { signSession, verifySession, SESSION_COOKIE, SESSION_MAX_AGE } from './session.js';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Create a session for a user record and write the cookie.
export async function createUserSession(user) {
  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });
}

export async function clearUserSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Read + verify the current session from the cookie. Returns the JWT payload
// ({ sub, email, name, role }) or null.
export async function getCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}
