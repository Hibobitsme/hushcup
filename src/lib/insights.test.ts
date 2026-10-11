import { describe, expect, it } from 'vitest';
import { MIN_NIGHTS, compare, pickSplit, trendLine } from './insights';

// The 14 sample nights from the History design: [mg at bedtime, rating].
const SAMPLE = [
  [20, 5], [35, 4], [150, 2], [60, 4], [30, 5], [45, 4], [210, 1],
  [40, 4], [25, 5], [95, 3], [120, 2], [35, 4], [15, 5], [55, 4],
].map(([bedMg, rating]) => ({ bedMg, rating }));

describe('insights', () => {
  it('uses 50 mg until there are enough nights', () => {
    expect(pickSplit(SAMPLE.slice(0, MIN_NIGHTS - 1))).toBe(50);
  });

  it('splits at the rounded median once there are enough nights', () => {
    // median of the sample is (40 + 45) / 2 = 42.5, rounded to 45
    expect(pickSplit(SAMPLE)).toBe(45);
  });

  it('falls back to 50 when every night sits on one side', () => {
    expect(pickSplit(Array.from({ length: 8 }, () => ({ bedMg: 0, rating: 4 })))).toBe(50);
  });

  it('matches the design numbers at a 50 mg split', () => {
    const c = compare(SAMPLE, 50);
    expect(c.lowAvg).toBeCloseTo(4.5, 6);
    expect(c.highAvg).toBeCloseTo(16 / 6, 6);
  });

  it('fits a downward trend for the sample', () => {
    expect(trendLine(SAMPLE)!.b).toBeLessThan(0);
    expect(trendLine([{ bedMg: 10, rating: 3 }])).toBeNull();
  });
});
