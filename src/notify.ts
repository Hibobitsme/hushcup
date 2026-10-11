import { useEffect } from 'react';
import { HOUR } from './lib/caffeine';
import { dayOf, prevDay } from './lib/days';
import { clock } from './lib/format';
import type { AppState } from './store';

// Local reminders. Timers run while the app is open or suspended in the background,
// so they are best-effort. Reminders that arrive with the app fully closed need
// Web Push from a server, which is not set up.

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function permission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  return (await Notification.requestPermission()) === 'granted';
}

const FIRED_KEY = 'hushcup.fired';

function alreadyFired(tag: string) {
  try {
    return (JSON.parse(localStorage.getItem(FIRED_KEY) || '[]') as string[]).includes(tag);
  } catch {
    return false;
  }
}

function markFired(tag: string) {
  try {
    const list = (JSON.parse(localStorage.getItem(FIRED_KEY) || '[]') as string[]).slice(-20);
    localStorage.setItem(FIRED_KEY, JSON.stringify([...list, tag]));
  } catch {
    /* ignore */
  }
}

async function show(tag: string, title: string, body: string, url: string) {
  if (alreadyFired(tag) || permission() !== 'granted') return;
  markFired(tag);
  const opts: NotificationOptions = { body, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url } };
  const reg = await navigator.serviceWorker?.getRegistration();
  if (reg) await reg.showNotification(title, opts);
  else new Notification(title, opts);
}

export interface Reminder {
  tag: string;
  at: number;
  title: string;
  body: string;
  url: string;
}

/** The next cutoff and morning check-in reminders after `now`. */
export function upcomingReminders(state: AppState, now: number): Reminder[] {
  const s = state.settings;
  if (!s) return [];
  const rules = { bedtimeMin: s.bedtimeMin, cutoffHours: s.cutoffHours };
  const today = dayOf(now, rules);
  const out: Reminder[] = [];

  if (s.reminders.cutoff) {
    const at = today.cutoff - 30 * 60_000;
    if (at > now) {
      out.push({ tag: `cutoff-${today.key}`, at, title: 'Cutoff in 30 minutes', body: `Last call for caffeine before ${clock(today.cutoff)}.`, url: '#/today' });
    }
  }

  if (s.reminders.morning) {
    // Wake-up is bedtime + 8 h. Remind for last night if that's still ahead, otherwise tonight.
    for (const night of [prevDay(today, rules), today]) {
      const at = night.bedtime + 8 * HOUR;
      const done = state.checkins.some((c) => c.day === night.key);
      if (at > now && !done) {
        out.push({ tag: `morning-${night.key}`, at, title: "Good morning. How'd you sleep?", body: 'Tap to log your sleep score.', url: '#/checkin' });
        break;
      }
    }
  }
  return out;
}

/** Keeps timers armed for upcoming reminders while the app is running. */
export function useReminders(state: AppState, now: number) {
  useEffect(() => {
    if (permission() !== 'granted') return;
    const timers = upcomingReminders(state, now)
      .filter((r) => r.at - now < 2 ** 31 - 1)
      .map((r) => setTimeout(() => void show(r.tag, r.title, r.body, r.url), r.at - Date.now()));
    return () => timers.forEach(clearTimeout);
    // Re-arm when data or settings change, and every few minutes via `now`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, Math.floor(now / (5 * 60_000))]);
}
