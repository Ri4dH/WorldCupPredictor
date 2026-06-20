import { MatchStage } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { apiConfig } from '@/config/api';
import { runRoute } from '@/server/api/handler';
import { fail, ok } from '@/server/api/response';
import { matchRepository, type MatchWithTeams } from '@/server/repositories/matchRepository';

export const dynamic = 'force-dynamic';

const stageSchema = z.nativeEnum(MatchStage).optional();
const limitSchema = z.coerce.number().int().positive().max(apiConfig.matches.maxLimit).optional();

/** GET /api/v1/matches — list matches (filter with ?stage, ?upcoming, ?limit). */
export function GET(request: NextRequest) {
  return runRoute('GET /api/v1/matches', async () => {
    const query = request.nextUrl.searchParams;
    const stage = stageSchema.safeParse(query.get('stage') ?? undefined);
    const limit = limitSchema.safeParse(query.get('limit') ?? undefined);
    if (!stage.success || !limit.success) {
      return fail('invalid_query', 'Invalid stage or limit parameter.', 400);
    }

    const take = limit.data ?? apiConfig.matches.defaultLimit;
    let matches: MatchWithTeams[];
    if (stage.data) {
      matches = await matchRepository.listByStage(stage.data);
    } else if (query.get('upcoming') === 'true') {
      matches = await matchRepository.listUpcoming(take);
    } else {
      matches = await matchRepository.listAll(take);
    }

    return ok(matches, `${matches.length} matches`);
  });
}
