/** API configuration (CLAUDE.md › Principle 7: tunables live in config). */
export const apiConfig = {
  version: 'v1',
  rateLimit: {
    /** Prediction generation is the expensive path, so it is rate limited. */
    predictions: { limit: 30, windowMs: 60_000 },
  },
  matches: {
    defaultLimit: 104,
    maxLimit: 200,
  },
} as const;
