import 'dotenv/config';

import { isLiveDataSource } from '@/config/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { syncLiveMatches } from '@/server/services/matchSyncService';
import { regeneratePredictions } from '@/server/services/predictionService';
import { syncTeams } from '@/server/services/teamSyncService';

const log = logger.child('refresh');

/**
 * Scheduled data refresh (see .github/workflows/refresh-data.yml):
 *   1. Sync teams + groups from the active provider.
 *   2. Sync live fixtures, scores and statuses (when live).
 *   3. Regenerate ensemble predictions so they reflect the latest strengths.
 * Each phase logs a structured summary; any failure aborts with exit code 1.
 */
async function main(): Promise<void> {
  const startedAt = Date.now();

  const teams = await syncTeams();
  log.info('Teams synced', {
    source: teams.source,
    groups: teams.groups,
    teams: teams.teams,
    retired: teams.retired,
  });

  if (isLiveDataSource()) {
    const matches = await syncLiveMatches();
    log.info('Live fixtures synced', {
      fixtures: matches.fixtures,
      removedSeed: matches.removedSeed,
      skipped: matches.skipped,
    });
  } else {
    log.info('Live data source disabled — skipping fixture sync', {});
  }

  const predictions = await regeneratePredictions();
  log.info('Predictions regenerated', {
    generated: predictions.generated,
    failed: predictions.failed,
  });

  log.info('Refresh complete', { durationMs: Date.now() - startedAt });
}

main()
  .catch((error: unknown) => {
    log.error('Refresh failed', { error: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
