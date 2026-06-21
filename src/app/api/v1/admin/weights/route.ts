import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { runRoute } from '@/server/api/handler';
import { fail, ok } from '@/server/api/response';
import { auth } from '@/server/auth';
import { getEnsembleWeights, setEnsembleWeights } from '@/server/services/settingsService';

export const dynamic = 'force-dynamic';

const weight = z.number().min(0).max(1);
const weightsSchema = z
  .object({
    poisson: weight,
    elo: weight,
    expectedGoals: weight,
    gradientBoostedTrees: weight,
    logisticRegression: weight,
    bayesian: weight,
    monteCarlo: weight,
  })
  .strict();

/** GET /api/v1/admin/weights — current ensemble weights. Admin only. */
export async function GET() {
  return runRoute('GET /api/v1/admin/weights', async () => {
    const session = await auth();
    if (!session?.user) {
      return fail('unauthorized', 'Sign in required.', 401);
    }
    return ok(await getEnsembleWeights(), 'Current ensemble weights.');
  });
}

/** PUT /api/v1/admin/weights — override ensemble weights. Admin only. */
export async function PUT(request: NextRequest) {
  return runRoute('PUT /api/v1/admin/weights', async () => {
    const session = await auth();
    if (!session?.user) {
      return fail('unauthorized', 'Sign in required.', 401);
    }

    const parsed = weightsSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return fail('invalid_weights', 'Each model weight must be a number between 0 and 1.', 400);
    }

    await setEnsembleWeights(parsed.data);
    return ok(parsed.data, 'Ensemble weights updated.');
  });
}
