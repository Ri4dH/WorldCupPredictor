import { TeamFlag } from '@/components/team/TeamBadge';
import type { BracketTeam, PredictedBracketMatch } from '@/types/bracket';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

function TeamRow({
  team,
  probability,
  winner,
}: {
  team: BracketTeam;
  probability: number;
  winner: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded px-1.5 py-1',
        winner ? 'bg-primary/10' : 'opacity-55',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <TeamFlag flag={team.flagEmoji} />
        <span
          className={cn(
            'truncate text-xs',
            winner ? 'font-semibold text-foreground' : 'text-muted-foreground',
          )}
        >
          {team.name}
        </span>
      </span>
      <span
        className={cn(
          'shrink-0 font-mono text-xs tabular-nums',
          winner ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {formatPercent(probability)}
      </span>
    </div>
  );
}

/** A single simulated knockout tie: both sides, advance %, predicted score, confidence. */
export function PredictedTieCard({ match }: { match: PredictedBracketMatch }) {
  const homeWins = match.winnerId === match.home.id;

  return (
    <div className="w-full rounded-lg border border-border bg-card p-1.5 shadow-sm">
      <TeamRow team={match.home} probability={match.homeAdvanceProbability} winner={homeWins} />
      <div className="my-0.5 flex items-center justify-between px-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className="font-mono">
          {match.scoreHome}–{match.scoreAway}
        </span>
        <span>conf {formatPercent(match.confidence)}</span>
      </div>
      <TeamRow team={match.away} probability={match.awayAdvanceProbability} winner={!homeWins} />
    </div>
  );
}
