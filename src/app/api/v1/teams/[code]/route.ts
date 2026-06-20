import { z } from 'zod';

import { runRoute } from '@/server/api/handler';
import { fail, ok } from '@/server/api/response';
import { teamRepository } from '@/server/repositories/teamRepository';

export const dynamic = 'force-dynamic';

const codeSchema = z.string().regex(/^[A-Za-z]{2,3}$/);

/** GET /api/v1/teams/:code — a single team by FIFA code. */
export function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  return runRoute('GET /api/v1/teams/[code]', async () => {
    const { code } = await context.params;
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      return fail('invalid_code', 'Team code must be 2–3 letters.', 400);
    }

    const team = await teamRepository.findByCode(parsed.data.toUpperCase());
    if (!team) {
      return fail('not_found', 'Team not found.', 404);
    }
    return ok(team, team.name);
  });
}
