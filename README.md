# World Cup Predictor

An explainable, full-stack web app that predicts **FIFA World Cup 2026** matches using an ensemble of statistical and machine-learning models, driven by live tournament data.

Every prediction blends seven independent models into one calibrated forecast — and, crucially, shows *why*: the rating gap, expected-goals edge, recent form, injuries and more. The app tracks the real tournament through a live data feed and refreshes itself on a schedule.

**Main features**

- Explainable match predictions (win / draw / win, expected goals, likely scorelines)
- A seven-model ensemble (Poisson, Elo, Expected Goals, Gradient-Boosted Trees, Logistic Regression, Bayesian, Monte Carlo)
- Live tournament data — real fixtures, scores and standings
- A versioned REST API and a premium, dark, responsive UI

**Technologies:** Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL (Neon), TanStack Query, Recharts, and a custom TypeScript prediction engine.

---

# Demo

[Input screenshot here]

---

# Features

- **Match predictions** — Every fixture gets win/draw/win probabilities, expected goals for each side, and a ranked list of the most likely scorelines.
- **Explainability** — Each prediction is broken down into the factors that drove it (Elo difference, expected-goals edge, recent form, squad availability, home advantage, tournament context), shown as easy-to-read diverging bars.
- **Seven-model ensemble** — No single algorithm decides a match. Seven independent models each produce probabilities, and the ensemble blends them with configurable weights.
- **Live tournament data** — Teams, fixtures, scores and standings come from a live football data feed, so the app reflects the real, in-progress World Cup. A curated offline dataset is used when no API key is configured.
- **Versioned REST API** — A clean `/api/v1` surface (teams, matches, groups, predictions) with a consistent response envelope, input validation and rate limiting.
- **Scheduled auto-refresh** — A GitHub Action keeps the database in sync with live results on a schedule.
- **Reproducible** — The Monte Carlo simulation is seeded, so the same fixture always yields the same prediction.

---

# How It Works

### The pipeline

1. **Ingest** — A data provider pulls teams, fixtures, results and standings from the live feed (or a curated dataset) and stores them in PostgreSQL.
2. **Predict** — For a given match, the engine runs all seven models, each producing independent probabilities, then blends them into one calibrated forecast.
3. **Explain** — The engine attaches a plain-language summary and a weighted list of the statistics behind the result.
4. **Serve** — The REST API returns the prediction; the UI visualizes it with animated bars and charts.

### Architecture

- **Next.js App Router** powers both the UI (server + client components) and the REST API routes.
- **Prisma + PostgreSQL (Neon)** handle persistence behind a thin repository layer.
- **A pure-TypeScript prediction engine** (no framework dependencies) lives in `src/server/prediction`, which keeps it fully testable and reusable.
- **A pluggable data provider** abstracts the data source, so the curated dataset and the live feed are interchangeable.

### The prediction logic, at a glance

| Model | What it contributes |
| ----- | ------------------- |
| Poisson goal model | Goal-rate distributions for exact scoreline probabilities |
| Elo ratings | Team strength from the rating gap, updated by results |
| Expected Goals (xG) | Chance quality rather than raw goals |
| Gradient-Boosted Trees | Learned, non-linear interactions between features |
| Logistic Regression | A calibrated baseline outcome estimate |
| Bayesian update | An Elo prior adjusted by current form and availability |
| Monte Carlo | Thousands of simulated matches, seeded for reproducibility |

The final prediction is a **weighted average** of all seven, with scorelines and expected goals blended from the models that produce them.

> Note: production gradient-boosting libraries (XGBoost/LightGBM) are Python-only, so the gradient-boosted-trees model is implemented as in-process tree inference in TypeScript.

---

# Tech Stack

- **Frontend** — Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Recharts
- **Backend** — Next.js API Routes, Prisma ORM, Zod (validation)
- **Database** — PostgreSQL (Neon serverless)
- **Machine Learning / Modeling** — Custom TypeScript ensemble: Poisson, Elo, Expected Goals, gradient-boosted trees, logistic regression, Bayesian updates and Monte Carlo simulation
- **Deployment** — Vercel (app + API), Neon (database), GitHub Actions (scheduled data refresh)

---

# Installation

> Requires **Node.js 20+** and a PostgreSQL database — a free [Neon](https://neon.tech) project works well.

```bash
# 1. Clone the repository
git clone https://github.com/Ri4dH/WorldCupPredictor.git
cd WorldCupPredictor

# 2. Install dependencies (also generates the Prisma client)
npm install

# 3. Configure environment variables
cp .env.example .env
# then edit .env — see "Environment Variables" below

# 4. Apply the database schema
npm run prisma:deploy

# 5. Load data
npm run db:seed         # curated World Cup 2026 dataset (no API key needed)
# or, for the live tournament (requires a football-data.org key):
# npm run data:refresh

# 6. Start the app
npm run dev             # http://localhost:3000
```

---

# Environment Variables

Copy `.env.example` to `.env` and fill in the values. The `.env` file is git-ignored — never commit real secrets.

| Variable | Required | Purpose | Example |
| -------- | -------- | ------- | ------- |
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection used by the app at runtime | `postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | Yes | Direct (unpooled) connection used for migrations | `postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require` |
| `PREDICTION_DATA_SOURCE` | No | Data source: `seed` (curated, default) or `live` | `live` |
| `FOOTBALL_DATA_API_KEY` | For live | API token for the live football data feed | `your-football-data-token` |
| `FOOTBALL_DATA_BASE_URL` | No | Base URL for the data feed (has a default) | `https://api.football-data.org/v4` |
| `FOOTBALL_DATA_COMPETITION` | No | Competition code for the live feed (default `WC`) | `WC` |
| `NEXT_PUBLIC_APP_URL` | No | Public base URL of the app | `http://localhost:3000` |
| `LOG_LEVEL` | No | Logger verbosity: `debug` / `info` / `warn` / `error` | `info` |

**Where to get them**

- `DATABASE_URL` / `DIRECT_URL` — from your Neon project dashboard. Use the **pooled** string for `DATABASE_URL` and the **direct** string for `DIRECT_URL`, both with the database owner role (e.g. `neondb_owner`) so migrations can run.
- `FOOTBALL_DATA_API_KEY` — from football-data.org. Only needed when `PREDICTION_DATA_SOURCE=live`.

---

# Required APIs & Services

### Neon — PostgreSQL database

- **Purpose:** stores teams, matches, groups and generated predictions.
- **Get it:** create a free project at https://neon.tech
- **Where it goes:** the **pooled** connection string → `DATABASE_URL`; the **direct** connection string → `DIRECT_URL` in `.env`. Use the database owner role so migrations can run.
- **Free tier:** generous for this project; compute scales to zero when idle.

### football-data.org — live match data

- **Purpose:** real teams, fixtures, scores and standings for the live tournament.
- **Get it:** register for a free API token at https://www.football-data.org/client/register
- **Where it goes:** `FOOTBALL_DATA_API_KEY` in `.env`, and set `PREDICTION_DATA_SOURCE=live`.
- **Free tier:** roughly 10 requests/minute and a limited set of competitions (the World Cup is included). The app makes only a few calls per refresh. Without a key, it falls back to the curated dataset.

---

# Running the Project

```bash
npm install            # install dependencies (generates the Prisma client)
npm run dev            # start the development server (http://localhost:3000)

npm run build          # production build
npm run start          # run the production build

npm test               # unit & integration tests (Vitest)
npm run test:coverage  # tests with a coverage report
npm run test:e2e       # end-to-end tests (Playwright)

npm run lint           # ESLint
npm run typecheck      # TypeScript type-check
```

**Data commands**

```bash
npm run prisma:deploy  # apply database migrations
npm run db:seed        # load the curated World Cup 2026 dataset
npm run data:refresh   # sync live teams & fixtures (needs PREDICTION_DATA_SOURCE=live + API key)
```

---

# Project Structure

```
src/
  app/             Next.js routes, layouts and the /api/v1 REST API
  components/      Reusable UI (cards, badges, charts, match views)
  features/        Feature modules (e.g. the match prediction panel)
  hooks/           Reusable React hooks (data fetching)
  lib/             Infrastructure: Prisma client, logger, API client
  server/
    prediction/    Pure-TypeScript prediction engine (models + ensemble)
    data/          Data providers (curated + live) and mappers
    repositories/  Database access
    services/      Use-case services (prediction, data sync)
    api/           API helpers (response envelope, validation, rate limiting)
  config/          Typed configuration and environment access
  types/           Shared TypeScript types
  utils/           Pure utilities (math, formatting)
prisma/            Schema, migrations and seed script
tests/             Test fixtures and Playwright end-to-end specs
.github/           Scheduled data-refresh workflow
```

---

# Screenshots

## Home Page

[Input screenshot here]

## Match Prediction

[Input screenshot here]

## Team Details

[Input screenshot here]

## Standings

[Input screenshot here]

## Admin Dashboard

[Input screenshot here]

---

# Deployment (Vercel)

The app deploys to **Vercel** with a Neon database.

1. Import this GitHub repository into Vercel — it auto-detects Next.js, no extra config required.
2. In the Vercel project settings, add the environment variables from the table above (at minimum `DATABASE_URL` and `DIRECT_URL`; for live data also `PREDICTION_DATA_SOURCE=live` and `FOOTBALL_DATA_API_KEY`).
3. Deploy. The build runs `prisma generate` automatically (via the `postinstall` script) and the Prisma client includes the serverless binary target, so it works in Vercel's runtime out of the box.

Apply migrations once against your Neon database with `npm run prisma:deploy` (from your machine or a one-off job). To keep live data current after deployment, add the same secrets to the GitHub repository (**Settings → Secrets and variables → Actions**); the included workflow refreshes the data on a schedule.

---

# Future Improvements

- **Knockout bracket simulation** — Monte Carlo the full tournament for live title odds.
- **Team detail pages** — per-team form, fixtures, squad and rating history.
- **Standings page** — live group tables (the data and API already exist).
- **User accounts** — sign-in with saved predictions and favorites (Auth.js).
- **Admin dashboard** — manage data refreshes, model weights and overrides.
- **Model calibration & backtesting** — tune ensemble weights against historical results.

---

# License

Released under the [MIT License](./LICENSE).
