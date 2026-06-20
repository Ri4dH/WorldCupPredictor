import type { PredictionFactor } from '@/types/prediction';
import { cn } from '@/utils/cn';

function impactLabel(impact: PredictionFactor['impact']): string {
  if (impact === 'HOME') {
    return 'Favours home';
  }
  if (impact === 'AWAY') {
    return 'Favours away';
  }
  return 'Even';
}

/** Explainability factors as diverging bars (home to the right, away to the left). */
export function FactorList({ factors }: { factors: readonly PredictionFactor[] }) {
  return (
    <ul className="space-y-3">
      {factors.map((factor) => {
        const magnitude = `${Math.min(Math.abs(factor.weight) * 100, 100)}%`;
        const favorsHome = factor.impact === 'HOME';
        const favorsAway = factor.impact === 'AWAY';

        return (
          <li key={factor.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{factor.label}</span>
              <span
                className={cn(
                  'text-xs',
                  favorsHome && 'text-primary',
                  favorsAway && 'text-accent',
                  factor.impact === 'NEUTRAL' && 'text-muted-foreground',
                )}
              >
                {impactLabel(factor.impact)}
              </span>
            </div>
            <div className="mt-1.5 flex h-1.5 items-center" aria-hidden>
              <div className="flex h-full w-1/2 justify-end overflow-hidden">
                <div
                  className="h-full rounded-l-full bg-accent"
                  style={{ width: favorsAway ? magnitude : '0%' }}
                />
              </div>
              <div className="h-full w-px bg-border" />
              <div className="flex h-full w-1/2 overflow-hidden">
                <div
                  className="h-full rounded-r-full bg-primary"
                  style={{ width: favorsHome ? magnitude : '0%' }}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{factor.detail}</p>
          </li>
        );
      })}
    </ul>
  );
}
