import { runRoute } from '@/server/api/handler';
import { ok } from '@/server/api/response';
import { teamRepository } from '@/server/repositories/teamRepository';

export const dynamic = 'force-dynamic';

/** GET /api/v1/teams — all teams, strongest first. */
export function GET() {
  return runRoute('GET /api/v1/teams', async () => {
    const teams = await teamRepository.findAll();
    return ok(teams, `${teams.length} teams`);
  });
}
