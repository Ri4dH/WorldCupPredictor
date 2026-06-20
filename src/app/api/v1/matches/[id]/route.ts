import { z } from 'zod';

import { runRoute } from '@/server/api/handler';
import { fail, ok } from '@/server/api/response';
import { matchRepository } from '@/server/repositories/matchRepository';

export const dynamic = 'force-dynamic';

const idSchema = z.string().uuid();

/** GET /api/v1/matches/:id — a single match with both teams. */
export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return runRoute('GET /api/v1/matches/[id]', async () => {
    const { id } = await context.params;
    if (!idSchema.safeParse(id).success) {
      return fail('invalid_id', 'Invalid match id.', 400);
    }

    const match = await matchRepository.findById(id);
    if (!match) {
      return fail('not_found', 'Match not found.', 404);
    }
    return ok(match, `${match.homeTeam.name} vs ${match.awayTeam.name}`);
  });
}
