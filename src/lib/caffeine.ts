// One-compartment model with first-order absorption.
// amount(t) = mg * ka/(ka-ke) * (e^(-ke·h) - e^(-ka·h)), h = hours since the drink.

export const HOUR = 3_600_000;

/** Absorption rate, per hour. */
export const KA = 2.5;

/** Elimination half-life in hours, by self-reported sensitivity. */
export const HALF_LIFE = { fast: 3.5, average: 5, slow: 7 } as const;
export type Sensitivity = keyof typeof HALF_LIFE;

/** Doses older than this contribute well under 1% and are ignored. */
const LOOKBACK = 72 * HOUR;

export interface Dose {
  mg: number;
  /** Epoch ms when the drink was had. */
  at: number;
}

/** Caffeine remaining from one dose, `hours` after it was taken. */
export function doseAmount(mg: number, hours: number, halfLife: number): number {
  if (hours <= 0 || mg <= 0) return 0;
  const ke = Math.LN2 / halfLife;
  return ((mg * KA) / (KA - ke)) * (Math.exp(-ke * hours) - Math.exp(-KA * hours));
}

/** Total caffeine in the body at time `t` (epoch ms). */
export function amountAt(doses: readonly Dose[], t: number, halfLife: number): number {
  let sum = 0;
  for (const d of doses) {
    const dt = t - d.at;
    if (dt <= 0 || dt > LOOKBACK) continue;
    sum += doseAmount(d.mg, dt / HOUR, halfLife);
  }
  return sum;
}

export interface CurvePoint {
  t: number;
  mg: number;
}

/** Evenly spaced samples from `from` to `to` inclusive. */
export function sampleCurve(
  doses: readonly Dose[],
  from: number,
  to: number,
  halfLife: number,
  step = 15 * 60_000,
): CurvePoint[] {
  const pts: CurvePoint[] = [];
  for (let t = from; t < to; t += step) pts.push({ t, mg: amountAt(doses, t, halfLife) });
  pts.push({ t: to, mg: amountAt(doses, to, halfLife) });
  return pts;
}
