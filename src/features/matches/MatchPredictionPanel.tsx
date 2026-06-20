'use client';

import { FactorList } from '@/components/prediction/FactorList';
import { ModelComparisonChart } from '@/components/prediction/ModelComparisonChart';
import { OutcomeBar } from '@/components/prediction/OutcomeBar';
import { ScorelineList } from '@/components/prediction/ScorelineList';
import { Card } from '@/components/ui/Card';
import { useMatchPrediction } from '@/hooks/usePrediction';
import { formatScoreline } from '@/utils/format';

interface MatchPredictionPanelProps {
  readonly matchId: string;
  readonly homeName: string;
  readonly awayName: string;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function PredictionSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <Card>
        <div className="h-24 animate-pulse rounded bg-muted" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
        <Card>
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
      </div>
    </div>
  );
}

/** Client panel that loads and visualizes a match's ensemble prediction. */
export function MatchPredictionPanel({ matchId, homeName, awayName }: MatchPredictionPanelProps) {
  const { data, isLoading, isError, error } = useMatchPrediction(matchId);

  if (isLoading) {
    return <PredictionSkeleton />;
  }
  if (isError || !data) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          Couldn’t load the prediction{error instanceof Error ? `: ${error.message}` : ''}.
        </p>
      </Card>
    );
  }

  const { prediction } = data;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-sm font-semibold text-muted-foreground">Match outcome</h2>
        <p className="mb-4 mt-1 text-pretty">{prediction.explanation.summary}</p>
        <OutcomeBar outcome={prediction.outcome} homeName={homeName} awayName={awayName} />
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="Expected goals"
            value={`${prediction.expectedGoals.home.toFixed(1)} – ${prediction.expectedGoals.away.toFixed(1)}`}
          />
          <Stat
            label="Most likely score"
            value={formatScoreline(prediction.mostLikelyScoreline.home, prediction.mostLikelyScoreline.away)}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Likely scorelines</h2>
          <ScorelineList scorelines={prediction.topScorelines} />
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Why this prediction</h2>
          <FactorList factors={prediction.explanation.factors} />
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-muted-foreground">Model breakdown</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Each model’s home / draw / away split — the ensemble blends all seven.
        </p>
        <ModelComparisonChart models={prediction.modelOutputs} />
      </Card>
    </div>
  );
}
