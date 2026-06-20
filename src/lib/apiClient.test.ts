import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchJson } from './apiClient';

afterEach(() => vi.unstubAllGlobals());

describe('fetchJson', () => {
  it('unwraps the data envelope on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { x: 1 }, error: null, message: 'OK' }),
      }),
    );
    await expect(fetchJson('/api/v1/x')).resolves.toEqual({ x: 1 });
  });

  it('throws the server message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({ success: false, data: null, error: 'not_found', message: 'Match not found.' }),
      }),
    );
    await expect(fetchJson('/api/v1/x')).rejects.toThrow('Match not found.');
  });
});
