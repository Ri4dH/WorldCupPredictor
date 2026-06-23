'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Periodically re-renders the current server route (`router.refresh()`) so live
 * scores and statuses update without a manual reload. Render it only while a
 * match is in progress so it does no work the rest of the time.
 */
export function LiveRefresher({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
