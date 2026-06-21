import type { Metadata } from 'next/types';
import { redirect } from 'next/navigation';

import { AdminControls } from '@/features/admin/AdminControls';
import { auth, signOut } from '@/server/auth';
import { getSystemOverview } from '@/server/services/adminService';
import { getEnsembleWeights } from '@/server/services/settingsService';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Operations dashboard for the World Cup 2026 Predictor.',
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const [overview, weights] = await Promise.all([getSystemOverview(), getEnsembleWeights()]);
  const counts = [
    { label: 'Teams', value: overview.counts.teams },
    { label: 'Matches', value: overview.counts.matches },
    { label: 'Groups', value: overview.counts.groups },
    { label: 'Predictions', value: overview.counts.predictions },
  ];

  async function signOutAction() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                overview.dataSource === 'live' ? 'bg-primary' : 'bg-muted-foreground',
              )}
              aria-hidden
            />
            Data source: {overview.dataSource}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-border bg-card px-3 py-1 text-xs transition-colors hover:bg-muted"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Signed in as {session.user.email}.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map((count) => (
          <div key={count.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-3xl font-bold tabular-nums">{count.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{count.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">Match status</h2>
          <ul className="mt-3 space-y-2">
            {overview.statusBreakdown.map((entry) => (
              <li key={entry.status} className="flex items-center justify-between text-sm">
                <span>{entry.status}</span>
                <span className="font-semibold tabular-nums">{entry.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent predictions</h2>
          {overview.recentPredictions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No predictions generated yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border/60">
              {overview.recentPredictions.map((prediction) => (
                <li key={prediction.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{prediction.matchLabel}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatPercent(prediction.confidence)} confidence
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4">
        <AdminControls initialWeights={weights} />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Data also refreshes on a schedule via GitHub Actions (<code>npm run data:refresh</code>).
      </p>
    </div>
  );
}
