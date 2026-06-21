'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { EnsembleWeights } from '@/server/services/settingsService';
import type { ModelName } from '@/types/prediction';
import { cn } from '@/utils/cn';

const MODEL_ORDER: readonly ModelName[] = [
  'poisson',
  'elo',
  'expectedGoals',
  'gradientBoostedTrees',
  'logisticRegression',
  'bayesian',
  'monteCarlo',
];

const MODEL_LABELS: Record<ModelName, string> = {
  poisson: 'Poisson',
  elo: 'Elo',
  expectedGoals: 'Expected Goals',
  gradientBoostedTrees: 'Gradient-Boosted Trees',
  logisticRegression: 'Logistic Regression',
  bayesian: 'Bayesian',
  monteCarlo: 'Monte Carlo',
};

interface Feedback {
  kind: 'ok' | 'error';
  text: string;
}

interface RefreshBody {
  success: boolean;
  message?: string;
  data?: { teams: { teams: number }; matches: { fixtures: number } | null };
}

export function AdminControls({ initialWeights }: { initialWeights: EnsembleWeights }) {
  const router = useRouter();
  const [weights, setWeights] = useState<EnsembleWeights>(initialWeights);
  const [busy, setBusy] = useState<'refresh' | 'weights' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function refresh() {
    setBusy('refresh');
    setFeedback(null);
    try {
      const response = await fetch('/api/v1/admin/refresh', { method: 'POST' });
      const body = (await response.json()) as RefreshBody;
      if (!response.ok || !body.success || !body.data) {
        throw new Error(body.message ?? 'Refresh failed.');
      }
      const { teams, matches } = body.data;
      setFeedback({
        kind: 'ok',
        text: `Synced ${teams.teams} teams${matches ? `, ${matches.fixtures} fixtures` : ''}.`,
      });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: 'error', text: error instanceof Error ? error.message : 'Refresh failed.' });
    } finally {
      setBusy(null);
    }
  }

  async function saveWeights(event: React.FormEvent) {
    event.preventDefault();
    setBusy('weights');
    setFeedback(null);
    try {
      const response = await fetch('/api/v1/admin/weights', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(weights),
      });
      const body = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !body.success) {
        throw new Error(body.message ?? 'Update failed.');
      }
      setFeedback({ kind: 'ok', text: 'Model weights updated.' });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: 'error', text: error instanceof Error ? error.message : 'Update failed.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground">Controls</h2>
      {feedback ? (
        <p
          className={cn(
            'mt-3 rounded-md px-3 py-2 text-sm',
            feedback.kind === 'ok' ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive',
          )}
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Refresh tournament data</div>
          <div className="text-xs text-muted-foreground">Pull the latest teams, fixtures and scores.</div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={busy !== null}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {busy === 'refresh' ? 'Refreshing…' : 'Refresh now'}
        </button>
      </div>

      <form onSubmit={saveWeights} className="mt-6 border-t border-border pt-4">
        <div className="text-sm font-medium">Ensemble model weights</div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {MODEL_ORDER.map((model) => (
            <label key={model} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{MODEL_LABELS[model]}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={weights[model]}
                onChange={(event) =>
                  setWeights((current) => ({ ...current, [model]: Number(event.target.value) }))
                }
                className="w-24 rounded-md border border-input bg-background px-2 py-1 text-right text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={busy !== null}
          className="mt-4 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {busy === 'weights' ? 'Saving…' : 'Save weights'}
        </button>
      </form>
    </div>
  );
}
