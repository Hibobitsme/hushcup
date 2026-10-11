import { describe, expect, it } from 'vitest';
import { HALF_LIFE, HOUR, KA, amountAt, doseAmount, sampleCurve } from './caffeine';

describe('doseAmount', () => {
  it('is zero before and at the moment of the drink', () => {
    expect(doseAmount(100, -1, 5)).toBe(0);
    expect(doseAmount(100, 0, 5)).toBe(0);
  });

  it('peaks at ln(ka/ke)/(ka-ke) hours', () => {
    const ke = Math.LN2 / 5;
    const tmax = Math.log(KA / ke) / (KA - ke);
    expect(tmax).toBeCloseTo(1.225, 3);
    const peak = doseAmount(100, tmax, 5);
    expect(doseAmount(100, tmax - 0.1, 5)).toBeLessThan(peak);
    expect(doseAmount(100, tmax + 0.1, 5)).toBeLessThan(peak);
    expect(peak).toBeGreaterThan(80);
    expect(peak).toBeLessThan(100);
  });

  it('matches the closed form once absorption is done', () => {
    // 20 h at a 5 h half-life is exactly 4 half-lives: 100 · ka/(ka-ke) / 16
    expect(doseAmount(100, 20, 5)).toBeCloseTo(6.617, 3);
  });

  it('halves every half-life after absorption', () => {
    for (const hl of Object.values(HALF_LIFE)) {
      expect(doseAmount(200, 10 + hl, hl) / doseAmount(200, 10, hl)).toBeCloseTo(0.5, 6);
    }
  });

  it('lingers longer for slow metabolizers', () => {
    expect(doseAmount(95, 8, HALF_LIFE.slow)).toBeGreaterThan(doseAmount(95, 8, HALF_LIFE.average));
    expect(doseAmount(95, 8, HALF_LIFE.average)).toBeGreaterThan(doseAmount(95, 8, HALF_LIFE.fast));
  });
});

describe('amountAt', () => {
  const t0 = new Date(2026, 9, 8, 8, 0).getTime();

  it('sums doses and ignores ones not yet taken', () => {
    const doses = [
      { mg: 150, at: t0 },
      { mg: 70, at: t0 + 3.5 * HOUR },
      { mg: 300, at: t0 + 10 * HOUR },
    ];
    const expected = doseAmount(150, 6.5, 5) + doseAmount(70, 3, 5);
    expect(amountAt(doses, t0 + 6.5 * HOUR, 5)).toBeCloseTo(expected, 6);
  });

  it('keeps counting drinks from the previous day after midnight', () => {
    const evening = new Date(2026, 9, 7, 20, 0).getTime();
    const afterMidnight = new Date(2026, 9, 8, 0, 30).getTime();
    expect(amountAt([{ mg: 200, at: evening }], afterMidnight, 5)).toBeGreaterThan(100);
  });

  it('reproduces the design sample (Check-in shows ~35 mg at bedtime)', () => {
    // Home "calm": 150 mg at 8:00, 70 mg at 11:30, bedtime 23:00, average sensitivity.
    const doses = [
      { mg: 150, at: t0 },
      { mg: 70, at: t0 + 3.5 * HOUR },
    ];
    expect(Math.round(amountAt(doses, t0 + 15 * HOUR, 5))).toBe(35);
  });
});

describe('sampleCurve', () => {
  it('includes both ends', () => {
    const pts = sampleCurve([{ mg: 100, at: 0 }], 0, HOUR, 5, 20 * 60_000);
    expect(pts.map((p) => p.t)).toEqual([0, 20 * 60_000, 40 * 60_000, HOUR]);
  });
});
