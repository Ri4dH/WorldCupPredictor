import { describe, expect, it } from 'vitest';

import { createLogger, type LogRecord } from './logger';

function capture() {
  const records: LogRecord[] = [];
  return { records, sink: (record: LogRecord) => records.push(record) };
}

describe('createLogger', () => {
  it('suppresses records below the configured level', () => {
    const { records, sink } = capture();
    const log = createLogger({ level: 'warn', sink });

    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');

    expect(records.map((record) => record.level)).toEqual(['warn', 'error']);
  });

  it('redacts sensitive metadata keys', () => {
    const { records, sink } = capture();
    const log = createLogger({ level: 'debug', sink });

    log.info('auth attempt', { password: 'hunter2', apiKey: 'abc', userId: 7 });

    expect(records[0]?.meta).toEqual({
      password: '[REDACTED]',
      apiKey: '[REDACTED]',
      userId: 7,
    });
  });

  it('namespaces messages through child scopes', () => {
    const { records, sink } = capture();
    const log = createLogger({ scope: 'engine', level: 'debug', sink }).child('poisson');

    log.info('ready');

    expect(records[0]?.scope).toBe('engine:poisson');
  });
});
