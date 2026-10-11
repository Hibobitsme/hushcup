import { pickMood, type Mood } from '../components/Cloud';
import { HALF_LIFE, amountAt } from './caffeine';
import { dayOf, dayStats, prevDay, streakAt, type Day, type DayRules, type DayStats, type Streak } from './days';
import { effectiveLimit, type AppState, type Checkin, type Settings } from '../store';

export interface Today {
  settings: Settings;
  rules: DayRules;
  halfLife: number;
  limit: number;
  day: Day;
  stats: DayStats;
  nowMg: number;
  streak: Streak;
  lastNight: Day;
  lastCheckin: Checkin | undefined;
  mood: Mood;
  moodName: string;
  moodLine: string;
}

/** Everything the Today/Sleep screens need, computed from stored state at `now`. */
export function deriveToday(state: AppState & { settings: Settings }, now: number): Today {
  const settings = state.settings;
  const rules = { bedtimeMin: settings.bedtimeMin, cutoffHours: settings.cutoffHours };
  const halfLife = HALF_LIFE[settings.sensitivity];
  const limit = effectiveLimit(settings);
  const day = dayOf(now, rules);
  const stats = dayStats(state.drinks, day, limit, halfLife);
  const streak = streakAt(state.drinks, now, rules, limit, halfLife, settings.startedAt);
  const lastNight = prevDay(day, rules);
  const lastCheckin = state.checkins.find((c) => c.day === lastNight.key);

  const poorSleep = !!lastCheckin && lastCheckin.rating <= 2;
  const mood = pickMood({
    overLimit: stats.overLimit || stats.late,
    poorSleep,
    nearLimit: stats.total >= 0.8 * limit,
    pastCutoff: now > day.cutoff,
  });

  const left = Math.max(limit - stats.total, 0);
  let moodName = 'Calm';
  let moodLine = stats.total === 0 ? 'Nothing logged yet. Tap + when you have a cup.' : 'Plenty of room. Tonight should be a quiet one.';
  if (mood === 'rough') {
    moodName = 'Rough one';
    moodLine = stats.overLimit
      ? 'Over your limit today. Tomorrow is a fresh start.'
      : stats.late
        ? 'A drink after your cutoff. Tomorrow is a fresh start.'
        : 'Rough night. Go easy today, I’ve got you.';
  } else if (mood === 'buzzing') {
    moodName = 'Buzzing';
    moodLine = `Near your limit, just ${left} mg left. Maybe water next?`;
  } else if (mood === 'sleepy') {
    moodName = 'Sleepy';
    moodLine = stats.total === 0 ? 'Past your cutoff, and not a drop today. A quiet night ahead.' : 'Past your cutoff. The caffeine is fading out.';
  }

  return {
    settings,
    rules,
    halfLife,
    limit,
    day,
    stats,
    nowMg: amountAt(state.drinks, now, halfLife),
    streak,
    lastNight,
    lastCheckin,
    mood,
    moodName,
    moodLine,
  };
}

export type Verdict = { text: string; tone: 'soft' | 'warm'; mood: Mood };

// Placeholder thresholds from the handoff; tune with real data.
export function bedtimeVerdict(bedMg: number): Verdict {
  if (bedMg < 40) return { text: 'Sleep-friendly', tone: 'soft', mood: 'calm' };
  if (bedMg < 90) return { text: 'A light buzz at lights-out', tone: 'warm', mood: 'calm' };
  if (bedMg < 150) return { text: 'Might cost you some sleep', tone: 'warm', mood: 'buzzing' };
  return { text: 'Likely to cost you sleep', tone: 'warm', mood: 'rough' };
}
