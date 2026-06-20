/**
 * Centralized application logger (CLAUDE.md › Logging).
 *
 * - Level-based filtering (debug < info < warn < error).
 * - Verbose, human-readable output in development; compact JSON in production.
 * - Sensitive metadata keys are redacted so secrets are never logged.
 * - A `sink` can be injected, which keeps the logger pure and unit-testable.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogMeta = Record<string, unknown>;

export interface LogRecord {
  level: LogLevel;
  message: string;
  time: string;
  scope?: string;
  meta?: LogMeta;
}

export type LogSink = (record: LogRecord) => void;

export interface LoggerOptions {
  scope?: string;
  level?: LogLevel;
  sink?: LogSink;
}

export interface Logger {
  debug: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
  child: (scope: string) => Logger;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEY = /(pass(word)?|secret|token|api[-_]?key|authorization|cookie|credential)/i;

function isLogLevel(value: string | undefined): value is LogLevel {
  return value === 'debug' || value === 'info' || value === 'warn' || value === 'error';
}

function resolveDefaultLevel(): LogLevel {
  const fromEnv = process.env.LOG_LEVEL;
  if (isLogLevel(fromEnv)) {
    return fromEnv;
  }
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
}

function redact(meta: LogMeta): LogMeta {
  const safe: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    safe[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : value;
  }
  return safe;
}

function formatPretty(record: LogRecord): string {
  const scope = record.scope ? ` (${record.scope})` : '';
  const meta = record.meta && Object.keys(record.meta).length > 0 ? ` ${JSON.stringify(record.meta)}` : '';
  return `${record.time} ${record.level.toUpperCase()}${scope}: ${record.message}${meta}`;
}

function defaultSink(record: LogRecord): void {
  const payload = process.env.NODE_ENV === 'production' ? JSON.stringify(record) : formatPretty(record);
  const out = console;
  if (record.level === 'error') {
    out.error(payload);
  } else if (record.level === 'warn') {
    out.warn(payload);
  } else {
    out.log(payload);
  }
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const threshold = LEVEL_PRIORITY[options.level ?? resolveDefaultLevel()];
  const sink = options.sink ?? defaultSink;
  const scope = options.scope;

  function emit(level: LogLevel, message: string, meta?: LogMeta): void {
    if (LEVEL_PRIORITY[level] < threshold) {
      return;
    }
    const record: LogRecord = {
      level,
      message,
      time: new Date().toISOString(),
      ...(scope ? { scope } : {}),
      ...(meta ? { meta: redact(meta) } : {}),
    };
    sink(record);
  }

  return {
    debug: (message, meta) => emit('debug', message, meta),
    info: (message, meta) => emit('info', message, meta),
    warn: (message, meta) => emit('warn', message, meta),
    error: (message, meta) => emit('error', message, meta),
    child: (childScope) =>
      createLogger({
        ...options,
        scope: scope ? `${scope}:${childScope}` : childScope,
      }),
  };
}

/** Shared application logger instance. */
export const logger = createLogger();
