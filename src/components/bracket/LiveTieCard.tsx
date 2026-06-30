import Link from 'next/link';

import { TeamFlag } from '@/components/team/TeamBadge';
import type { BracketSlot, LiveBracketMatch, LiveMatchStatus } from '@/types/bracket';
import { cn } from '@/utils/cn';
import { formatKickoff } from '@/utils/format';

const STATUS_BORDER: Record<LiveMatchStatus, string> = {
  LIVE: 'border-destructive/50',
  FINISHED: 'border-border',
  SCHEDULED: 'border-primary/40',
  TBD: 'border-dashed border-border/60',
};

const STATUS_DOT: Record<LiveMatchStatus, string> = {
  LIVE: 'bg-destructive animate-pulse',
  FINISHED: 'bg-muted-foreground',
  SCHEDULED: 'bg-primary',
  TBD: 'bg-border',
};

const STATUS_LABEL: Record<LiveMatchStatus, string> = {
  LIVE: 'Live',
  FINISHED: 'Full time',
  SCHEDULED: 'Upcoming',
  TBD: 'To be decided',
};

function SlotRow({
  slot,
  score,
  winner,
}: {
  slot: BracketSlot;
  score: number | null;
  winner: boolean;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-2 rounded px-1.5 py-1', winner && 'bg-primary/10')}>
      <span className="flex min-w-0 items-center gap-1.5">
        {slot ? <TeamFlag flag={slot.flagEmoji} /> : <span className="w-6 text-center text-muted-foreground">–</span>}
        <span
          className={cn(
            'truncate text-xs',
            !slot && 'italic text-muted-foreground',
            slot && winner && 'font-semibold text-foreground',
            slot && !winner && 'text-foreground/80',
          )}
        >
          {slot ? slot.name : 'TBD'}
        </span>
      </span>
      <span className="shrink-0 font-mono text-xs tabular-nums">{score ?? ''}</span>
    </div>
  );
}

/** A single official knockout tie: real result, live state, or upcoming kickoff. */
export function LiveTieCard({ match }: { match: LiveBracketMatch }) {
  const decided =
    match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null;
  const homeWins = decided && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWins = decided && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  // The status pill carries the state word; the footer adds the kickoff time for
  // fixtures still to be played (and stays empty once they are live or done).
  const footer =
    (match.status === 'SCHEDULED' || match.status === 'TBD') && match.kickoff
      ? formatKickoff(match.kickoff)
      : '';

  const card = (
    <div className={cn('w-full rounded-lg border bg-card p-1.5 shadow-sm', STATUS_BORDER[match.status])}>
      <SlotRow slot={match.home} score={match.homeScore} winner={homeWins} />
      <div className="my-0.5 flex items-center justify-between gap-1 px-1.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[match.status])} aria-hidden />
          {STATUS_LABEL[match.status]}
        </span>
        <span className="truncate">{footer}</span>
      </div>
      <SlotRow slot={match.away} score={match.awayScore} winner={awayWins} />
    </div>
  );

  return match.matchId ? (
    <Link
      href={`/matches/${match.matchId}`}
      className="block rounded-lg transition-opacity hover:opacity-90"
    >
      {card}
    </Link>
  ) : (
    card
  );
}
