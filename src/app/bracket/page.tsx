import type { Metadata } from 'next/types';

import { BracketView } from '@/components/bracket/BracketView';
import { LiveRefresher } from '@/components/match/LiveRefresher';
import { getBracketData } from '@/server/services/bracketService';
import { refreshLiveScoresIfDue } from '@/server/services/liveScoreService';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bracket',
  description: 'AI-predicted World Cup 2026 knockout bracket alongside the live official bracket.',
};

export default async function BracketPage() {
  await refreshLiveScoresIfDue();
  const data = await getBracketData();

  return (
    <div className="container py-8">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Knockout Bracket</h1>
        <p className="mt-1 text-muted-foreground">
          The engine&rsquo;s simulated path to the title, alongside the official tournament bracket
          as results come in.
        </p>
      </header>

      {data ? (
        <>
          {data.live.rounds.some((round) => round.matches.some((match) => match.status === 'LIVE')) ? (
            <LiveRefresher />
          ) : null}
          <div className="mt-6">
            <BracketView data={data} />
          </div>
        </>
      ) : (
        <p className="mt-10 text-muted-foreground">
          The knockout bracket will appear here once the Round of 32 draw is set.
        </p>
      )}
    </div>
  );
}
