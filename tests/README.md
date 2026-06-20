# tests

- `tests/setup.ts` — Vitest setup (Testing Library matchers + cleanup).
- `tests/unit/` — unit tests that do not live beside their source.
- `tests/e2e/` — Playwright end-to-end specs.

Unit/integration tests run with `npm run test`; end-to-end tests run with `npm run test:e2e`.
Critical prediction logic must stay above 90% coverage (`npm run test:coverage`).
