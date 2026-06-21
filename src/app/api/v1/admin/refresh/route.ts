import { isLiveDataSource } from '@/config/env';
import { runRoute } from '@/server/api/handler';
import { fail, ok } from '@/server/api/response';
import { auth } from '@/server/auth';
import { syncLiveMatches } from '@/server/services/matchSyncService';
import { syncTeams } from '@/server/services/teamSyncService';

export const dynamic = 'force-dynamic';

/** POST /api/v1/admin/refresh — sync teams and (when live) fixtures. Admin only. */
export async function POST() {
  return runRoute('POST /api/v1/admin/refresh', async () => {
    const session = await auth();
    if (!session?.user) {
      return fail('unauthorized', 'Sign in required.', 401);
    }

    const teams = await syncTeams();
    const matches = isLiveDataSource() ? await syncLiveMatches() : null;
    return ok({ teams, matches }, 'Data refreshed.');
  });
}
