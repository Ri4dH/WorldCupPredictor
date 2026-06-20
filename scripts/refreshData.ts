import 'dotenv/config';

import { prisma } from '@/lib/prisma';
import { syncTeams } from '@/server/services/teamSyncService';

async function main(): Promise<void> {
  const result = await syncTeams();
  console.log(
    `Synced from "${result.source}" provider: ${result.groups} groups, ${result.teams} teams.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Refresh failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
