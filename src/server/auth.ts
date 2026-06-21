import { createHash, timingSafeEqual } from 'node:crypto';

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getServerEnv } from '@/config/env';

/** Constant-time string comparison (compares fixed-length SHA-256 digests). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

/**
 * Single-admin authentication. Credentials are validated against ADMIN_EMAIL /
 * ADMIN_PASSWORD from the environment; any valid session is the admin, so route
 * protection only needs to check for a session.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: (credentials) => {
        const env = getServerEnv();
        if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
          return null;
        }
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';

        const matches =
          safeEqual(email.trim().toLowerCase(), env.ADMIN_EMAIL.trim().toLowerCase()) &&
          safeEqual(password, env.ADMIN_PASSWORD);

        return matches ? { id: 'admin', name: 'Admin', email: env.ADMIN_EMAIL } : null;
      },
    }),
  ],
});
