import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MatchCard } from '@/components/match/MatchCard';
import { TeamBadge } from '@/components/team/TeamBadge';
import { matchRepository } from '@/server/repositories/matchRepository';
import { teamRepository } from '@/server/repositories/teamRepository';

export const dynamic = 'force-dynamic';

const CONFEDERATIONS: Record<string, string> = {
  UEFA: 'Europe (UEFA)',
  CONMEBOL: 'South America (CONMEBOL)',
  CONCACAF: 'North & Central America (CONCACAF)',
  CAF: 'Africa (CAF)',
  AFC: 'Asia (AFC)',
  OFC: 'Oceania (OFC)',
};

export default async function TeamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const team = await teamRepository.findByCode(code.toUpperCase()).catch(() => null);
  if (!team) {
    notFound();
  }

  const matches = await matchRepository.listByTeam(team.id);

  const stats = [
    { label: 'Elo rating', value: Math.round(team.elo).toString() },
    { label: 'Form', value: `${team.form.toFixed(1)} pts/game` },
    { label: 'Attack', value: `${team.attackStrength.toFixed(2)} goals/game` },
    { label: 'Defense', value: `${team.defenseStrength.toFixed(2)} conceded/game` },
    { label: 'Expected goals for', value: team.expectedGoalsFor.toFixed(2) },
    { label: 'Expected goals against', value: team.expectedGoalsAgainst.toFixed(2) },
  ];

  return (
    <div className="container py-8">
      <Link
        href="/standings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Standings
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <TeamBadge team={team} size="lg" />
        <div className="text-right text-sm text-muted-foreground">
          <div>{CONFEDERATIONS[team.confederation] ?? team.confederation}</div>
          {team.group ? <div>Group {team.group.name}</div> : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums">{stat.value}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Fixtures &amp; results</h2>
      {matches.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No fixtures yet.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
