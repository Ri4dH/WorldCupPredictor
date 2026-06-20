import 'dotenv/config';

import { isLiveDataSource } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { syncLiveMatches } from '@/server/services/matchSyncService';
import { syncTeams } from '@/server/services/teamSyncService';

async function main(): Promise<void> {
  const teams = await syncTeams();
  console.log(
    `Teams synced from "${teams.source}": ${teams.groups} groups, ${teams.teams} teams (${teams.retired} retired).`,
  );

  if (isLiveDataSource()) {
    const matches = await syncLiveMatches();
    console.log(
      `Live fixtures synced: ${matches.fixtures} matches (${matches.removedSeed} seed fixtures removed).`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error('Refresh failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
