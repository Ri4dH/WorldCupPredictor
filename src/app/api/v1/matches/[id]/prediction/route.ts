import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { apiConfig } from '@/config/api';
import { runRoute } from '@/server/api/handler';
import { clientKey, rateLimit } from '@/server/api/rateLimit';
import { fail, ok } from '@/server/api/response';
import { getMatchPrediction } from '@/server/services/predictionService';

export const dynamic = 'force-dynamic';

const idSchema = z.string().uuid();

/** GET /api/v1/matches/:id/prediction — generate, persist and return the prediction. */
export function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return runRoute('GET /api/v1/matches/[id]/prediction', async () => {
    const { limit, windowMs } = apiConfig.rateLimit.predictions;
    if (!rateLimit(clientKey(request), limit, windowMs).allowed) {
      return fail('rate_limited', 'Too many prediction requests. Please retry shortly.', 429);
    }

    const { id } = await context.params;
    if (!idSchema.safeParse(id).success) {
      return fail('invalid_id', 'Invalid match id.', 400);
    }

    const result = await getMatchPrediction(id);
    if (!result) {
      return fail('not_found', 'Match not found.', 404);
    }

    return ok(
      {
        match: {
          id: result.match.id,
          stage: result.match.stage,
          kickoff: result.match.kickoff,
          venue: result.match.venue,
          homeTeam: result.match.homeTeam,
          awayTeam: result.match.awayTeam,
        },
        prediction: result.prediction,
      },
      'Prediction generated.',
    );
  });
}
