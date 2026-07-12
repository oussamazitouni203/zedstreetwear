'use server';

import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma.js';
import { verifyPassword, createUserSession, clearUserSession } from '../../lib/auth.js';

// useFormState-compatible action: (prevState, formData) => state
export async function login(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const nextRaw = String(formData.get('next') || '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: 'Invalid email or password.' };
  }

  await createUserSession(user);

  // Only allow same-site relative redirects.
  const safeNext = nextRaw.startsWith('/') ? nextRaw : null;
  redirect(safeNext ?? (user.role === 'ADMIN' ? '/admin' : '/'));
}

export async function logout() {
  await clearUserSession();
  redirect('/login');
}
