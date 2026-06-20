import type { ScorelineProbability } from '@/types/prediction';
import { formatPercent, formatScoreline } from '@/utils/format';

/** Most likely scorelines as a ranked bar list. */
export function ScorelineList({ scorelines }: { scorelines: readonly ScorelineProbability[] }) {
  const max = scorelines[0]?.probability ?? 1;

  return (
    <ul className="space-y-2">
      {scorelines.map((scoreline) => (
        <li key={`${scoreline.home}-${scoreline.away}`} className="flex items-center gap-3">
          <span className="w-10 font-mono text-sm tabular-nums">
            {formatScoreline(scoreline.home, scoreline.away)}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${(scoreline.probability / max) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm tabular-nums text-muted-foreground">
            {formatPercent(scoreline.probability, 1)}
          </span>
        </li>
      ))}
    </ul>
  );
}
