# World Cup 2026 Predictor

Explainable FIFA World Cup 2026 match predictions powered by an ensemble of statistical and
machine-learning models (Poisson, Elo, Expected Goals, Gradient Boosted Trees, Logistic Regression,
Bayesian updates and Monte Carlo simulation).

> Engineering standards, architecture and rules for this repository live in [`CLAUDE.md`](./CLAUDE.md),
> which is the source of truth for all work here.

## Tech stack

- **Framework:** Next.js (App Router) + React + TypeScript (strict)
- **Styling:** Tailwind CSS (dark-first design tokens) + Framer Motion
- **Data:** Prisma ORM + PostgreSQL (Neon)
- **Client state:** TanStack Query
- **Validation:** Zod
- **Charts:** Recharts
- **Testing:** Vitest (unit/integration) + Playwright (E2E)
- **Tooling:** ESLint + Prettier

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env   # then fill in DATABASE_URL / DIRECT_URL (Neon)

# 3. Run the dev server
npm run dev            # http://localhost:3000
```

## Project structure

```
src/
  app/        Next.js App Router routes, layouts and API handlers
  components/ Reusable presentational components
  features/   Feature modules (composition of components + hooks)
  hooks/      Reusable React hooks
  lib/        Infrastructure (logger, db client, integrations)
  services/   Application/use-case services
  types/      Shared TypeScript types
  utils/      Pure utility functions
  styles/     Global styles and design tokens
  config/     Typed configuration and environment access
  server/     Server-only domain logic (e.g. the prediction engine)
prisma/       Prisma schema, migrations and seed
scripts/      One-off utility scripts
tests/        Unit, integration and E2E tests
```

## Scripts

| Script                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the development server                 |
| `npm run build`        | Production build                             |
| `npm run start`        | Start the production server                  |
| `npm run lint`         | ESLint                                       |
| `npm run typecheck`    | TypeScript type-check (no emit)              |
| `npm run test`         | Run unit/integration tests (Vitest)          |
| `npm run test:coverage`| Tests with coverage report                   |
| `npm run test:e2e`     | End-to-end tests (Playwright)                |
| `npm run format`       | Format with Prettier                         |
| `npm run prisma:migrate` | Run Prisma migrations (dev)                |
| `npm run db:seed`      | Seed the database                            |

## Environment variables

See [`.env.example`](./.env.example). Never commit a real `.env`.

| Variable                 | Required | Purpose                                         |
| ------------------------ | -------- | ----------------------------------------------- |
| `DATABASE_URL`           | yes\*    | Neon pooled connection string                   |
| `DIRECT_URL`             | yes\*    | Neon direct connection (Prisma Migrate)         |
| `NEXT_PUBLIC_APP_URL`    | no       | Public base URL (defaults to localhost)         |
| `LOG_LEVEL`              | no       | `debug` \| `info` \| `warn` \| `error`          |
| `PREDICTION_DATA_SOURCE` | no       | `seed` (default) \| `live`                      |
| `FOOTBALL_DATA_API_KEY`  | no       | Required only when `PREDICTION_DATA_SOURCE=live` |

\* Required once the database milestone is wired; the app builds without it.
