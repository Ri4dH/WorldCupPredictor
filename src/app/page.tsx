import {
  Activity,
  ArrowRight,
  Brain,
  Dice5,
  LineChart,
  Sigma,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Capability {
  readonly icon: LucideIcon;
  readonly name: string;
  readonly description: string;
}

const MODELS: readonly Capability[] = [
  { icon: Sigma, name: 'Poisson Goal Model', description: 'Goal-rate distributions for exact scoreline probabilities.' },
  { icon: TrendingUp, name: 'Elo Ratings', description: 'Dynamic team strength updated after every result.' },
  { icon: Target, name: 'Expected Goals', description: 'Chance quality, not just raw shot counts.' },
  { icon: Brain, name: 'Gradient Boosted Trees', description: 'Learned non-linear interactions across features.' },
  { icon: LineChart, name: 'Logistic Regression', description: 'Calibrated baseline outcome probabilities.' },
  { icon: Activity, name: 'Bayesian Updates', description: 'Beliefs that adapt as new evidence arrives.' },
  { icon: Dice5, name: 'Monte Carlo', description: 'Thousands of simulated matches and tournaments.' },
] as const;

const STEPS: readonly { readonly step: string; readonly title: string; readonly description: string }[] = [
  { step: '01', title: 'Ingest', description: 'Live results, current form, expected goals and standings.' },
  { step: '02', title: 'Ensemble', description: 'Seven independent models each produce calibrated probabilities.' },
  { step: '03', title: 'Explain', description: 'A weighted prediction with the statistics that drove it.' },
] as const;

const STATS: readonly { readonly value: string; readonly label: string }[] = [
  { value: '48', label: 'Teams' },
  { value: '104', label: 'Matches' },
  { value: '7', label: 'Models' },
  { value: '16', label: 'Host cities' },
] as const;

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent)]"
      />

      <div className="container">
        <section className="flex flex-col items-center py-16 text-center sm:py-24" aria-labelledby="hero-heading">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            FIFA World Cup 2026 · USA · Canada · Mexico
          </span>

          <h1 id="hero-heading" className="mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Explainable predictions for every World Cup 2026 match
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            An ensemble of statistical and machine-learning models estimates outcomes, scorelines and
            the reasons behind them — fast, reproducible and built to improve over time.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/matches"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Explore matches
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 font-medium transition-colors hover:bg-muted"
            >
              How it works
            </a>
          </div>

          <dl className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-card px-4 py-6">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-3xl font-bold text-foreground">{stat.value}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="py-16" aria-labelledby="models-heading" id="models">
          <h2 id="models-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Seven models, one calibrated forecast
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            No single algorithm decides a match. Each model votes independently and the ensemble weights them.
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODELS.map(({ icon: Icon, name, description }) => (
              <li key={name} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-4 font-semibold">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-16" aria-labelledby="how-it-works-heading" id="how-it-works">
          <h2 id="how-it-works-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How a prediction is made
          </h2>

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ step, title, description }) => (
              <li key={step} className="rounded-xl border border-border bg-card p-6">
                <span className="font-mono text-sm text-accent">{step}</span>
                <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
