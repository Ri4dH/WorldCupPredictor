# repositories

Thin, typed data-access modules over the Prisma client (`@/lib/prisma`). They
isolate persistence from the rest of the app, exclude soft-deleted rows by
default, and are the only place that talks to the database directly.

- `teamRepository` — teams (by id, code, group).
- `matchRepository` — matches joined with both teams and group.
- `predictionRepository` — upsert/read predictions keyed by (match, modelVersion).
