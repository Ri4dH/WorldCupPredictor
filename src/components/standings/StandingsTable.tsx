import Link from 'next/link';

import { TeamBadge } from '@/components/team/TeamBadge';
import type { TeamStanding } from '@/server/services/standingsService';
import { cn } from '@/utils/cn';

const QUALIFY_SLOTS = 2;

function formatGoalDifference(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

/** A single group's standings as a compact table. Top two rows are highlighted. */
export function StandingsTable({ group, table }: { group: string; table: readonly TeamStanding[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-semibold">Group {group}</h2>
        <span className="text-xs text-muted-foreground">Top 2 advance</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="w-8 px-3 py-2 text-left font-medium">#</th>
              <th className="py-2 text-left font-medium">Team</th>
              <th className="px-2 py-2 text-center font-medium">P</th>
              <th className="px-2 py-2 text-center font-medium">W</th>
              <th className="px-2 py-2 text-center font-medium">D</th>
              <th className="px-2 py-2 text-center font-medium">L</th>
              <th className="px-2 py-2 text-center font-medium">GD</th>
              <th className="px-3 py-2 text-center font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, index) => (
              <tr
                key={row.teamId}
                className={cn('border-t border-border/60', index < QUALIFY_SLOTS && 'bg-primary/5')}
              >
                <td className="px-3 py-2 tabular-nums">
                  <span
                    className={cn(
                      'inline-flex h-5 w-5 items-center justify-center rounded text-xs',
                      index < QUALIFY_SLOTS ? 'bg-primary/20 text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="py-2 pr-2">
                  <Link href={`/teams/${row.code}`} className="hover:underline">
                    <TeamBadge team={{ name: row.name, code: row.code, flagEmoji: row.flagEmoji }} />
                  </Link>
                </td>
                <td className="px-2 py-2 text-center tabular-nums">{row.played}</td>
                <td className="px-2 py-2 text-center tabular-nums">{row.won}</td>
                <td className="px-2 py-2 text-center tabular-nums">{row.drawn}</td>
                <td className="px-2 py-2 text-center tabular-nums">{row.lost}</td>
                <td className="px-2 py-2 text-center tabular-nums">{formatGoalDifference(row.goalDifference)}</td>
                <td className="px-3 py-2 text-center font-semibold tabular-nums">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
