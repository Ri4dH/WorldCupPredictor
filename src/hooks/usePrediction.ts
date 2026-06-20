import { useQuery } from '@tanstack/react-query';

import { fetchJson } from '@/lib/apiClient';
import type { MatchPredictionResponse } from '@/types/api';

/** Fetch (generating + caching) the ensemble prediction for a match. */
export function useMatchPrediction(matchId: string) {
  return useQuery({
    queryKey: ['prediction', matchId],
    queryFn: () => fetchJson<MatchPredictionResponse>(`/api/v1/matches/${matchId}/prediction`),
    staleTime: 5 * 60_000,
  });
}
