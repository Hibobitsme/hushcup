import { describe, expect, it } from 'vitest';
import { HOUR } from './caffeine';
import { dayOf, dayStats, prevDay, streakAt } from './days';

const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).getTime();
const rules = { bedtimeMin: 23 * 60, cutoffHours: 8 };

describe('dayOf', () => {
  it('runs from mid-sleep to mid-sleep', () => {
    const day = dayOf(at(8, 14, 40), rules);
    expect(day.key).toBe('2026-10-08');
    expect(day.start).toBe(at(8, 3));
    expect(day.end).toBe(at(9, 3));
    expect(day.bedtime).toBe(at(8, 23));
    expect(day.cutoff).toBe(at(8, 15));
  });

  it('keeps the small hours with the evening before', () => {
    expect(dayOf(at(9, 2), rules).key).toBe('2026-10-08');
    expect(dayOf(at(9, 3), rules).key).toBe('2026-10-09');
  });

  it('handles bedtimes after midnight', () => {
    const late = { bedtimeMin: 30, cutoffHours: 8 };
    const day = dayOf(at(8, 23, 50), late);
    expect(day.key).toBe('2026-10-08');
    expect(day.bedtime).toBe(at(9, 0, 30));
    expect(day.cutoff).toBe(at(8, 16, 30));
  });

  it('steps back one day at a time', () => {
    expect(prevDay(dayOf(at(8, 12), rules), rules).key).toBe('2026-10-07');
  });
});

describe('dayStats', () => {
  const day = dayOf(at(8, 12), rules);

  it('totals only this day', () => {
    const s = dayStats([{ mg: 100, at: at(8, 9) }, { mg: 95, at: at(8, 13) }, { mg: 300, at: at(7, 9) }], day, 400, 5);
    expect(s.total).toBe(195);
    expect(s.lastDrinkAt).toBe(at(8, 13));
    expect(s.met).toBe(true);
  });

  it('breaks on a drink after cutoff', () => {
    const s = dayStats([{ mg: 40, at: at(8, 15, 30) }], day, 400, 5);
    expect(s.late).toBe(true);
    expect(s.met).toBe(false);
  });

  it('allows exactly the limit but not more', () => {
    expect(dayStats([{ mg: 400, at: at(8, 9) }], day, 400, 5).met).toBe(true);
    expect(dayStats([{ mg: 401, at: at(8, 9) }], day, 400, 5).overLimit).toBe(true);
  });

  it('reports caffeine left at bedtime', () => {
    const s = dayStats([{ mg: 200, at: day.bedtime - 5 * HOUR }], day, 400, 5);
    expect(s.bedMg).toBeGreaterThan(100);
    expect(s.bedMg).toBeLessThan(110);
  });
});

describe('streakAt', () => {
  const started = at(1, 8);
  const daily = (days: number[], mg = 200) => days.map((d) => ({ mg, at: at(d, 9) }));

  it('counts completed days since onboarding', () => {
    expect(streakAt(daily([1, 2, 3, 4, 5, 6, 7]), at(8, 10), rules, 400, 5, started)).toEqual({ current: 7, todayBroken: false });
  });

  it('stops at a broken day', () => {
    const doses = [...daily([1, 2, 3, 4, 6, 7]), { mg: 450, at: at(5, 9) }];
    expect(streakAt(doses, at(8, 10), rules, 400, 5, started).current).toBe(2);
  });

  it('resets to zero when today is already broken', () => {
    const doses = [...daily([1, 2, 3]), { mg: 95, at: at(8, 16) }];
    expect(streakAt(doses, at(8, 17), rules, 400, 5, started)).toEqual({ current: 0, todayBroken: true });
  });

  it('does not count days before onboarding', () => {
    expect(streakAt([], at(8, 10), rules, 400, 5, at(6, 20)).current).toBe(2);
  });
});
