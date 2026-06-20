import type { Metadata } from 'next/types';

import { MatchCard } from '@/components/match/MatchCard';
import { matchRepository } from '@/server/repositories/matchRepository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Matches',
  description: 'World Cup 2026 fixtures, results and AI predictions.',
};

const STATUS_RANK: Record<string, number> = { LIVE: 0, SCHEDULED: 1, FINISHED: 2 };

export default async function MatchesPage() {
  const matches = [...(await matchRepository.listAll(200))].sort((a, b) => {
    const rank = (STATUS_RANK[a.status] ?? 3) - (STATUS_RANK[b.status] ?? 3);
    return rank !== 0 ? rank : a.kickoff.getTime() - b.kickoff.getTime();
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Matches</h1>
      <p className="mt-1 text-muted-foreground">
        {matches.length} fixtures · select a match for the full prediction.
      </p>

      {matches.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No matches available yet.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
