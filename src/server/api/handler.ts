import type { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

import { fail } from './response';

const log = logger.child('api');

/**
 * Run a route body with centralized error handling. Unexpected errors are
 * logged server-side and returned as a generic 500 — internal details are never
 * exposed to clients (CLAUDE.md › Error Handling, Security).
 */
export async function runRoute(
  label: string,
  body: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await body();
  } catch (error) {
    log.error('Unhandled API error', {
      label,
      error: error instanceof Error ? error.message : String(error),
    });
    return fail('internal_error', 'An unexpected error occurred.', 500);
  }
}
