import { describe, expect, it } from 'vitest';
import { upcomingReminders } from './notify';
import { DEFAULT_SETTINGS, type AppState } from './store';

const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).getTime();

function state(reminders: { cutoff: boolean; morning: boolean }, checkins: AppState['checkins'] = []): AppState {
  return { settings: { ...DEFAULT_SETTINGS, startedAt: at(1, 9), reminders }, drinks: [], checkins };
}

describe('upcomingReminders', () => {
  it('reminds 30 minutes before the cutoff', () => {
    const [r] = upcomingReminders(state({ cutoff: true, morning: false }), at(8, 10));
    expect(r.at).toBe(at(8, 14, 30));
    expect(r.tag).toBe('cutoff-2026-10-08');
  });

  it('skips the cutoff reminder once it has passed', () => {
    expect(upcomingReminders(state({ cutoff: true, morning: false }), at(8, 15))).toEqual([]);
  });

  it("schedules the morning check-in for tonight's sleep", () => {
    const [r] = upcomingReminders(state({ cutoff: false, morning: true }), at(8, 20));
    expect(r.at).toBe(at(9, 7));
    expect(r.url).toBe('#/checkin');
  });

  it('reminds this morning if last night has no check-in yet', () => {
    const [r] = upcomingReminders(state({ cutoff: false, morning: true }), at(9, 5));
    expect(r.at).toBe(at(9, 7));
    expect(r.tag).toBe('morning-2026-10-08');
  });

  it('skips a night that is already checked in', () => {
    const done = [{ day: '2026-10-08', rating: 4, bedMg: 20, savedAt: at(9, 6) }];
    const [r] = upcomingReminders(state({ cutoff: false, morning: true }, done), at(9, 6, 30));
    expect(r.tag).toBe('morning-2026-10-09');
  });

  it('does nothing when reminders are off', () => {
    expect(upcomingReminders(state({ cutoff: false, morning: false }), at(8, 10))).toEqual([]);
  });
});
