import { HOUR, amountAt, type Dose } from './caffeine';

// An "app day" runs from the middle of one night's sleep to the middle of the next
// (bedtime + 4 h). That way a 1 AM bedtime still belongs to the evening before it,
// and a 6 AM coffee belongs to the new day.

export interface DayRules {
  /** Minutes after midnight, e.g. 1380 for 11:00 PM. */
  bedtimeMin: number;
  /** Hours before bedtime after which caffeine breaks the streak. */
  cutoffHours: number;
}

export interface Day {
  key: string;
  start: number;
  end: number;
  bedtime: number;
  cutoff: number;
}

const MIDSLEEP_OFFSET_MIN = 4 * 60;

function boundaryMin(rules: DayRules) {
  return (rules.bedtimeMin + MIDSLEEP_OFFSET_MIN) % 1440;
}

function atMinute(base: Date, minuteOfDay: number) {
  const d = new Date(base);
  d.setHours(0, minuteOfDay, 0, 0);
  return d;
}

export function dayKeyOf(start: number) {
  const d = new Date(start);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** The app day that contains time `t`. */
export function dayOf(t: number, rules: DayRules): Day {
  const b = boundaryMin(rules);
  const startD = atMinute(new Date(t), b);
  if (startD.getTime() > t) startD.setDate(startD.getDate() - 1);
  const start = startD.getTime();

  const endD = new Date(startD);
  endD.setDate(endD.getDate() + 1);

  const bedD = atMinute(startD, rules.bedtimeMin);
  if (bedD.getTime() <= start) bedD.setDate(bedD.getDate() + 1);
  const bedtime = bedD.getTime();

  return {
    key: dayKeyOf(start),
    start,
    end: endD.getTime(),
    bedtime,
    cutoff: bedtime - rules.cutoffHours * HOUR,
  };
}

/** The app day before `day`. */
export function prevDay(day: Day, rules: DayRules): Day {
  return dayOf(day.start - 1, rules);
}

export interface DayStats {
  total: number;
  lastDrinkAt: number | null;
  /** A drink was logged after the cutoff (and before the day ended). */
  late: boolean;
  overLimit: boolean;
  /** Meets the streak rule: total ≤ limit and nothing after cutoff. */
  met: boolean;
  /** Caffeine left in the body at this day's bedtime. */
  bedMg: number;
}

export function dayStats(doses: readonly Dose[], day: Day, limit: number, halfLife: number): DayStats {
  let total = 0;
  let last: number | null = null;
  let late = false;
  for (const d of doses) {
    if (d.at < day.start || d.at >= day.end) continue;
    total += d.mg;
    if (last === null || d.at > last) last = d.at;
    if (d.at > day.cutoff) late = true;
  }
  const overLimit = total > limit;
  return {
    total,
    lastDrinkAt: last,
    late,
    overLimit,
    met: !overLimit && !late,
    bedMg: amountAt(doses, day.bedtime, halfLife),
  };
}

export interface Streak {
  /** Consecutive completed days meeting the rule (0 if today is already broken). */
  current: number;
  todayBroken: boolean;
}

/**
 * Counts back from yesterday through completed days that meet the rule.
 * Days before `startedAt` (onboarding) never count.
 */
export function streakAt(
  doses: readonly Dose[],
  now: number,
  rules: DayRules,
  limit: number,
  halfLife: number,
  startedAt: number,
): Streak {
  const today = dayOf(now, rules);
  const todayBroken = !dayStats(doses, today, limit, halfLife).met;
  if (todayBroken) return { current: 0, todayBroken };

  const firstDay = dayOf(startedAt, rules).start;
  let current = 0;
  let day = prevDay(today, rules);
  while (day.start >= firstDay && dayStats(doses, day, limit, halfLife).met) {
    current++;
    day = prevDay(day, rules);
  }
  return { current, todayBroken };
}
