import { NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from './src/lib/session.js';

// Protect the admin area: only ADMIN sessions may enter /admin.
export async function middleware(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
