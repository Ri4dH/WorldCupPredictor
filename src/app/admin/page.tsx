import type { Metadata } from 'next/types';

import { getSystemOverview } from '@/server/services/adminService';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Operations overview for the World Cup 2026 Predictor.',
};

const MODEL_LABELS: Record<string, string> = {
  poisson: 'Poisson',
  elo: 'Elo',
  expectedGoals: 'Expected Goals',
  gradientBoostedTrees: 'Gradient-Boosted Trees',
  logisticRegression: 'Logistic Regression',
  bayesian: 'Bayesian',
  monteCarlo: 'Monte Carlo',
};

export default async function AdminPage() {
  const overview = await getSystemOverview();
  const maxWeight = Math.max(...overview.modelWeights.map((entry) => entry.weight), 0.0001);
  const counts = [
    { label: 'Teams', value: overview.counts.teams },
    { label: 'Matches', value: overview.counts.matches },
    { label: 'Groups', value: overview.counts.groups },
    { label: 'Predictions', value: overview.counts.predictions },
  ];

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin dashboard</h1>
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
      </div>
      <p className="mt-1 text-muted-foreground">Read-only operations overview.</p>

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
          <h2 className="text-sm font-semibold text-muted-foreground">Ensemble model weights</h2>
          <ul className="mt-3 space-y-2.5">
            {overview.modelWeights.map((entry) => (
              <li key={entry.model}>
                <div className="flex items-center justify-between text-sm">
                  <span>{MODEL_LABELS[entry.model] ?? entry.model}</span>
                  <span className="tabular-nums text-muted-foreground">{formatPercent(entry.weight)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(entry.weight / maxWeight) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-5">
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

      <p className="mt-6 text-xs text-muted-foreground">
        Data refreshes run on a schedule via GitHub Actions (or <code>npm run data:refresh</code>).
        Write actions and model-weight overrides are planned for a future authenticated release.
      </p>
    </div>
  );
}
