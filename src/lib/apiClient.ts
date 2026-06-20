import type { ApiEnvelope } from '@/types/api';

/**
 * Fetch a `/api/v1` endpoint and unwrap the standard envelope. Throws with the
 * server's safe message on failure, so callers (and React Query) get a clean error.
 */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });

  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }
  return body.data;
}
