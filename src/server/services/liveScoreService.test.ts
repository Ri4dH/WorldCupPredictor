import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/env', () => ({ isLiveDataSource: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { match: { count: vi.fn() } } }));
vi.mock('./matchSyncService', () => ({
  syncLiveMatches: vi.fn(() => Promise.resolve({ fixtures: 1, removedSeed: 0, skipped: 0 })),
}));

import { isLiveDataSource } from '@/config/env';
import { prisma } from '@/lib/prisma';

import { syncLiveMatches } from './matchSyncService';

// Re-import the service fresh each test so its module-level throttle state resets.
async function loadService() {
  vi.resetModules();
  return import('./liveScoreService');
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.match.count).mockResolvedValue(1);
});

describe('refreshLiveScoresIfDue', () => {
  it('does nothing when the live data source is disabled', async () => {
    vi.mocked(isLiveDataSource).mockReturnValue(false);
    const { refreshLiveScoresIfDue } = await loadService();

    await refreshLiveScoresIfDue();

    expect(prisma.match.count).not.toHaveBeenCalled();
    expect(syncLiveMatches).not.toHaveBeenCalled();
  });

  it('does not hit the API when no match is in progress', async () => {
    vi.mocked(isLiveDataSource).mockReturnValue(true);
    vi.mocked(prisma.match.count).mockResolvedValue(0);
    const { refreshLiveScoresIfDue } = await loadService();

    await refreshLiveScoresIfDue();

    expect(syncLiveMatches).not.toHaveBeenCalled();
  });

  it('refreshes once when a match is live, then throttles subsequent calls', async () => {
    vi.mocked(isLiveDataSource).mockReturnValue(true);
    const { refreshLiveScoresIfDue } = await loadService();

    await refreshLiveScoresIfDue();
    await refreshLiveScoresIfDue();

    expect(syncLiveMatches).toHaveBeenCalledTimes(1);
  });
});
