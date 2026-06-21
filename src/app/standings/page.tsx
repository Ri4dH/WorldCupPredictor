import type { Metadata } from 'next/types';

import { StandingsTable } from '@/components/standings/StandingsTable';
import { getAllGroupStandings } from '@/server/services/standingsService';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Standings',
  description: 'Live World Cup 2026 group standings.',
};

export default async function StandingsPage() {
  const groups = await getAllGroupStandings();

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Group standings</h1>
      <p className="mt-1 text-muted-foreground">
        Live group tables — the top two of each group advance to the knockout rounds.
      </p>

      {groups.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No groups available yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <StandingsTable key={group.group} group={group.group} table={group.table} />
          ))}
        </div>
      )}
    </div>
  );
}
