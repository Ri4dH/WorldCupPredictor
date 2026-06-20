import { runRoute } from '@/server/api/handler';
import { ok } from '@/server/api/response';
import { groupRepository } from '@/server/repositories/groupRepository';

export const dynamic = 'force-dynamic';

/** GET /api/v1/groups — all groups with their teams. */
export function GET() {
  return runRoute('GET /api/v1/groups', async () => {
    const groups = await groupRepository.listWithTeams();
    return ok(groups, `${groups.length} groups`);
  });
}
