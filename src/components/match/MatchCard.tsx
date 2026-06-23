import Link from 'next/link';

import { TeamBadge, type TeamBadgeTeam } from '@/components/team/TeamBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatMatchTimeLabel, formatStage } from '@/utils/format';

export interface MatchCardMatch {
  readonly id: string;
  readonly status: string;
  readonly stage: string;
  readonly kickoff: string | Date;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly homeTeam: TeamBadgeTeam;
  readonly awayTeam: TeamBadgeTeam;
}

/** Compact, linkable summary of a single match. */
export function MatchCard({ match }: { match: MatchCardMatch }) {
  // A score is shown once it exists (live or finished); "vs" until then.
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatStage(match.stage)}</span>
        <StatusBadge status={match.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <TeamBadge team={match.homeTeam} className="min-w-0 flex-1" />
        <span className="shrink-0 font-mono text-lg font-bold tabular-nums">
          {hasScore ? `${match.homeScore}–${match.awayScore}` : 'vs'}
        </span>
        <TeamBadge team={match.awayTeam} className="min-w-0 flex-1 flex-row-reverse text-right" />
      </div>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        {formatMatchTimeLabel(match.status, match.kickoff)}
      </div>
    </Link>
  );
}
