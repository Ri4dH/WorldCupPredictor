import { describe, expect, it } from 'vitest';

import { fail, ok } from './response';

describe('ok', () => {
  it('wraps data in the success envelope', async () => {
    const response = ok({ value: 1 }, 'done', 201);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { value: 1 },
      error: null,
      message: 'done',
    });
  });
});

describe('fail', () => {
  it('wraps an error without leaking internals', async () => {
    const response = fail('not_found', 'Match not found.', 404);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: 'not_found',
      message: 'Match not found.',
    });
  });
});
