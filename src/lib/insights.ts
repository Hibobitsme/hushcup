// Caffeine × sleep insights from morning check-ins.

export interface Night {
  /** mg left in the body at bedtime that night. */
  bedMg: number;
  /** Sleep rating, 1–5. */
  rating: number;
}

/** Nights needed before insights are shown. */
export const MIN_NIGHTS = 7;

const DEFAULT_SPLIT = 50;

/** Bedtime-mg threshold splitting nights into "low" and "high" groups. */
export function pickSplit(nights: readonly Night[]): number {
  if (nights.length < MIN_NIGHTS) return DEFAULT_SPLIT;
  const sorted = nights.map((n) => n.bedMg).sort((a, b) => a - b);
  const mid = sorted.length / 2;
  const median = sorted.length % 2 ? sorted[Math.floor(mid)] : (sorted[mid - 1] + sorted[mid]) / 2;
  const split = Math.max(5, Math.round(median / 5) * 5);
  // Both groups must have nights in them, otherwise the comparison says nothing.
  const low = nights.filter((n) => n.bedMg < split).length;
  if (low === 0 || low === nights.length) return DEFAULT_SPLIT;
  return split;
}

export function average(xs: readonly number[]): number | null {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null;
}

export interface Comparison {
  split: number;
  lowAvg: number | null;
  highAvg: number | null;
}

export function compare(nights: readonly Night[], split = pickSplit(nights)): Comparison {
  return {
    split,
    lowAvg: average(nights.filter((n) => n.bedMg < split).map((n) => n.rating)),
    highAvg: average(nights.filter((n) => n.bedMg >= split).map((n) => n.rating)),
  };
}

/** Least-squares line rating = a + b·mg, or null when it can't be fit. */
export function trendLine(nights: readonly Night[]): { a: number; b: number } | null {
  if (nights.length < 2) return null;
  const mx = average(nights.map((n) => n.bedMg))!;
  const my = average(nights.map((n) => n.rating))!;
  let num = 0;
  let den = 0;
  for (const n of nights) {
    num += (n.bedMg - mx) * (n.rating - my);
    den += (n.bedMg - mx) ** 2;
  }
  if (den === 0) return null;
  const b = num / den;
  return { a: my - b * mx, b };
}
