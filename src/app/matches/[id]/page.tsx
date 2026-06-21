import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TeamBadge } from '@/components/team/TeamBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MatchPredictionPanel } from '@/features/matches/MatchPredictionPanel';
import { matchRepository } from '@/server/repositories/matchRepository';
import { formatKickoff, formatStage } from '@/utils/format';

export const dynamic = 'force-dynamic';

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await matchRepository.findById(id).catch(() => null);
  if (!match) {
    notFound();
  }

  const played = match.homeScore !== null && match.awayScore !== null;

  return (
    <div className="container py-8">
      <Link
        href="/matches"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> All matches
      </Link>

      <div className="mt-4 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatStage(match.stage)}</span>
          <StatusBadge status={match.status} />
        </div>
        <div className="mt-4 flex w-full max-w-md items-center justify-between gap-4">
          <Link href={`/teams/${match.homeTeam.code}`} className="flex-1">
            <TeamBadge
              team={match.homeTeam}
              className="flex-col gap-2 text-center transition-opacity hover:opacity-80"
            />
          </Link>
          <span className="font-mono text-3xl font-bold tabular-nums">
            {played ? `${match.homeScore}–${match.awayScore}` : 'vs'}
          </span>
          <Link href={`/teams/${match.awayTeam.code}`} className="flex-1">
            <TeamBadge
              team={match.awayTeam}
              className="flex-col gap-2 text-center transition-opacity hover:opacity-80"
            />
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {played ? 'Full time' : formatKickoff(match.kickoff)}
          {match.venue ? ` · ${match.venue}` : ''}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <MatchPredictionPanel
          matchId={match.id}
          homeName={match.homeTeam.name}
          awayName={match.awayTeam.name}
        />
      </div>
    </div>
  );
}
