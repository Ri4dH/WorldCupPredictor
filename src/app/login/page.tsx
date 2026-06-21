import { AuthError } from 'next-auth';
import type { Metadata } from 'next/types';
import { redirect } from 'next/navigation';

import { signIn } from '@/server/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const hasError = Boolean((await searchParams).error);

  async function login(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/admin',
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect('/login?error=1');
      }
      throw error;
    }
  }

  return (
    <div className="container flex justify-center py-16">
      <form action={login} className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage tournament data and model settings.
        </p>

        {hasError ? (
          <p className="mt-4 rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
            Invalid email or password.
          </p>
        ) : null}

        <label className="mt-4 block text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
