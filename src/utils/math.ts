/** Pure mathematical helpers shared across the prediction models. */

/** Constrain a value to [min, max]; NaN collapses to min. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

/** Logistic sigmoid, mapping the real line to (0, 1). */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`factorial expects a non-negative integer, received ${n}`);
  }
  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

/** Poisson probability mass: P(X = k) for rate lambda. */
export function poissonProbability(k: number, lambda: number): number {
  if (!Number.isInteger(k) || k < 0) {
    return 0;
  }
  if (lambda <= 0) {
    return k === 0 ? 1 : 0;
  }
  return (lambda ** k * Math.exp(-lambda)) / factorial(k);
}

/** Scale non-negative weights so they sum to 1; falls back to a uniform split. */
export function normalize(values: readonly number[]): number[] {
  const total = sum(values);
  if (total <= 0) {
    return values.map(() => (values.length > 0 ? 1 / values.length : 0));
  }
  return values.map((value) => value / total);
}

/** Weighted arithmetic mean; falls back to the plain mean when weights sum to 0. */
export function weightedMean(values: readonly number[], weights: readonly number[]): number {
  if (values.length !== weights.length) {
    throw new Error('weightedMean: values and weights must be the same length');
  }
  const weightTotal = sum(weights);
  if (weightTotal <= 0) {
    return mean(values);
  }
  let accumulator = 0;
  for (let i = 0; i < values.length; i += 1) {
    accumulator += (values[i] ?? 0) * (weights[i] ?? 0);
  }
  return accumulator / weightTotal;
}

/** Round to a fixed number of decimal places. */
export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
