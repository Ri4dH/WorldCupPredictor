'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { ModelOutput } from '@/types/prediction';

const MODEL_LABELS: Record<string, string> = {
  poisson: 'Poisson',
  elo: 'Elo',
  expectedGoals: 'xG',
  gradientBoostedTrees: 'GBT',
  logisticRegression: 'Logistic',
  bayesian: 'Bayesian',
  monteCarlo: 'Monte Carlo',
};

/** Per-model home/draw/away split, showing where the models agree and differ. */
export function ModelComparisonChart({ models }: { models: readonly ModelOutput[] }) {
  const data = models.map((model) => ({
    name: MODEL_LABELS[model.model] ?? model.model,
    Home: Math.round(model.outcome.home * 100),
    Draw: Math.round(model.outcome.draw * 100),
    Away: Math.round(model.outcome.away * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={models.length * 34 + 16}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8 }} barCategoryGap={6}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={76}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            color: 'hsl(var(--foreground))',
            fontSize: 12,
          }}
          formatter={(value) => `${value}%`}
        />
        <Bar dataKey="Home" stackId="o" fill="hsl(var(--primary))" />
        <Bar dataKey="Draw" stackId="o" fill="hsl(var(--muted-foreground))" />
        <Bar dataKey="Away" stackId="o" fill="hsl(var(--accent))" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
