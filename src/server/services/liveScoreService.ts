import { isLiveDataSource } from '@/config/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

import { syncLiveMatches } from './matchSyncService';

const log = logger.child('liveScore');

/** Minimum gap between upstream refreshes (best-effort, per serverless instance). */
const REFRESH_TTL_MS = 30_000;
/** How long after kickoff a match is still considered "possibly in progress". */
const MATCH_WINDOW_MS = 3 * 60 * 60 * 1000;
/** How far before kickoff to start refreshing (catches the SCHEDULED→LIVE flip). */
const PRE_KICKOFF_MS = 15 * 60 * 1000;

let lastRefreshAt = 0;
let inFlight: Promise<void> | null = null;

/** True when at least one match is plausibly in progress right now. */
async function hasActiveMatch(now: number): Promise<boolean> {
  const count = await prisma.match.count({
    where: {
      deletedAt: null,
      status: { not: 'FINISHED' },
      kickoff: { gte: new Date(now - MATCH_WINDOW_MS), lte: new Date(now + PRE_KICKOFF_MS) },
    },
  });
  return count > 0;
}

/**
 * Refresh live scores/statuses from the data source on demand, throttled to at
 * most once per {@link REFRESH_TTL_MS} and only while a match is in progress, so
 * page views stay cheap and within the provider's rate limit. Never throws — a
 * failed refresh must not break the page that triggered it.
 */
export async function refreshLiveScoresIfDue(): Promise<void> {
  if (!isLiveDataSource()) {
    return;
  }
  const now = Date.now();
  if (now - lastRefreshAt < REFRESH_TTL_MS) {
    return;
  }
  if (inFlight) {
    return inFlight;
  }

  if (!(await hasActiveMatch(now))) {
    lastRefreshAt = now; // nothing live; back off without hitting the API
    return;
  }

  lastRefreshAt = now;
  inFlight = (async () => {
    try {
      const result = await syncLiveMatches();
      log.debug('Live scores refreshed', { fixtures: result.fixtures, skipped: result.skipped });
    } catch (error) {
      log.warn('Live score refresh failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
