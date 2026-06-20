# components

Reusable presentational components, grouped by domain:

- `ui/` — primitives (`Card`, `StatusBadge`)
- `team/` — `TeamBadge` (renders crest URLs or emoji flags)
- `match/` — `MatchCard`
- `prediction/` — prediction visualizations (`OutcomeBar`, `ModelComparisonChart`,
  `FactorList`, `ScorelineList`)
- `layout/` — `SiteHeader`

Components are Server Components by default; only those needing animation, charts
or interactivity are marked `'use client'` (`OutcomeBar`, `ModelComparisonChart`).
They accept minimal structural props so they work with both server (Prisma) and
client (DTO) data.
