import { z } from 'zod';

/**
 * Typed, validated access to environment variables.
 *
 * Per CLAUDE.md no secret or URL is ever hardcoded — everything is read from
 * the environment and validated here. Parsing is lazy + memoized so importing
 * this module never throws at build time; validation happens on first access.
 */

const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);
const nodeEnvSchema = z.enum(['development', 'test', 'production']);
const dataSourceSchema = z.enum(['seed', 'live']);

const serverSchema = z.object({
  NODE_ENV: nodeEnvSchema.default('development'),
  LOG_LEVEL: logLevelSchema.optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  PREDICTION_DATA_SOURCE: dataSourceSchema.default('seed'),
  FOOTBALL_DATA_API_KEY: z.string().min(1).optional(),
  FOOTBALL_DATA_BASE_URL: z.string().url().default('https://api.football-data.org/v4'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

let serverEnvCache: ServerEnv | null = null;
let clientEnvCache: ClientEnv | null = null;

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === '' ? undefined : value;
}

function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`).join('\n');
}

/** Validated server-side environment. Throws a descriptive error if invalid. */
export function getServerEnv(): ServerEnv {
  if (serverEnvCache) {
    return serverEnvCache;
  }

  const parsed = serverSchema.safeParse({
    NODE_ENV: emptyToUndefined(process.env.NODE_ENV),
    LOG_LEVEL: emptyToUndefined(process.env.LOG_LEVEL),
    DATABASE_URL: emptyToUndefined(process.env.DATABASE_URL),
    DIRECT_URL: emptyToUndefined(process.env.DIRECT_URL),
    PREDICTION_DATA_SOURCE: emptyToUndefined(process.env.PREDICTION_DATA_SOURCE),
    FOOTBALL_DATA_API_KEY: emptyToUndefined(process.env.FOOTBALL_DATA_API_KEY),
    FOOTBALL_DATA_BASE_URL: emptyToUndefined(process.env.FOOTBALL_DATA_BASE_URL),
  });

  if (!parsed.success) {
    throw new Error(`Invalid server environment variables:\n${formatIssues(parsed.error)}`);
  }

  serverEnvCache = parsed.data;
  return serverEnvCache;
}

/** Validated browser-safe environment. */
export function getClientEnv(): ClientEnv {
  if (clientEnvCache) {
    return clientEnvCache;
  }

  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL),
  });

  if (!parsed.success) {
    throw new Error(`Invalid client environment variables:\n${formatIssues(parsed.error)}`);
  }

  clientEnvCache = parsed.data;
  return clientEnvCache;
}

/** True only when live data is requested AND an API key is configured. */
export function isLiveDataSource(): boolean {
  const env = getServerEnv();
  return env.PREDICTION_DATA_SOURCE === 'live' && Boolean(env.FOOTBALL_DATA_API_KEY);
}
