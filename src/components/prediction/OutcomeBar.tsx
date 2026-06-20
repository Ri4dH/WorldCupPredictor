'use client';

import { motion } from 'framer-motion';

import type { OutcomeProbabilities } from '@/types/prediction';
import { formatPercent } from '@/utils/format';

interface OutcomeBarProps {
  readonly outcome: OutcomeProbabilities;
  readonly homeName: string;
  readonly awayName: string;
}

/** Animated three-segment win/draw/win probability bar. */
export function OutcomeBar({ outcome, homeName, awayName }: OutcomeBarProps) {
  const items = [
    { label: homeName, value: outcome.home, color: 'bg-primary' },
    { label: 'Draw', value: outcome.draw, color: 'bg-muted-foreground' },
    { label: awayName, value: outcome.away, color: 'bg-accent' },
  ];

  const description = `${homeName} ${formatPercent(outcome.home)}, draw ${formatPercent(
    outcome.draw,
  )}, ${awayName} ${formatPercent(outcome.away)}`;

  return (
    <div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Win probabilities: ${description}`}
      >
        {items.map((item) => (
          <motion.div
            key={item.label}
            className={item.color}
            initial={{ width: 0 }}
            animate={{ width: `${item.value * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-lg font-bold tabular-nums">{formatPercent(item.value)}</div>
            <div className="truncate text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
