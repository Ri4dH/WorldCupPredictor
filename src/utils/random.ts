/**
 * Seeded pseudo-random utilities.
 *
 * The Monte Carlo model must be reproducible (CLAUDE.md › Mission), so it seeds
 * a deterministic generator from the fixture rather than using `Math.random`.
 */

/** Mulberry32 PRNG: fast, deterministic, returns values in [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic 32-bit FNV-1a hash, used to seed the PRNG from a fixture key. */
export function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Sample a Poisson(lambda) variate using Knuth's algorithm. */
export function samplePoisson(lambda: number, random: () => number): number {
  if (lambda <= 0) {
    return 0;
  }
  const threshold = Math.exp(-lambda);
  let k = 0;
  let product = 1;
  do {
    k += 1;
    product *= random();
  } while (product > threshold);
  return k - 1;
}
