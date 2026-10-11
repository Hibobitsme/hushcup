import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Sensitivity } from './lib/caffeine';

// Everything the app knows lives in one localStorage record.

export type Group = 'none' | 'preg' | 'teen';

export interface Settings {
  bedtimeMin: number;
  /** The limit the person chose; see effectiveLimit for the capped value. */
  limit: number;
  group: Group;
  sensitivity: Sensitivity;
  /** Collected but not used by the model yet. */
  weight: number | null;
  unit: 'lb' | 'kg';
  cutoffHours: number;
  /** When onboarding finished; days before this never count for streaks. */
  startedAt: number;
  reminders: { cutoff: boolean; morning: boolean };
}

export interface Drink {
  id: string;
  name: string;
  mg: number;
  at: number;
}

export interface Checkin {
  /** Key of the app day whose night was rated. */
  day: string;
  rating: number;
  bedMg: number;
  savedAt: number;
}

export interface AppState {
  settings: Settings | null;
  drinks: Drink[];
  checkins: Checkin[];
}

// Placeholder caps from the handoff. Review with a trusted source before launch.
export const GROUP_CAP: Record<Group, number> = { none: Infinity, preg: 200, teen: 100 };

export const DEFAULT_SETTINGS: Omit<Settings, 'startedAt'> = {
  bedtimeMin: 23 * 60,
  limit: 400,
  group: 'none',
  sensitivity: 'average',
  weight: null,
  unit: 'lb',
  cutoffHours: 8,
  reminders: { cutoff: false, morning: false },
};

export function effectiveLimit(s: Settings) {
  return Math.min(s.limit, GROUP_CAP[s.group]);
}

const KEY = 'hushcup.v1';
const EMPTY: AppState = { settings: null, drinks: [], checkins: [] };

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return {
        settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : null,
        drinks: parsed.drinks ?? [],
        checkins: parsed.checkins ?? [],
      };
    }
  } catch {
    /* unreadable or blocked storage: start fresh */
  }
  return EMPTY;
}

let state = load();
const listeners = new Set<() => void>();

function set(next: AppState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

export function useAppState() {
  return useSyncExternalStore(subscribe, () => state);
}

export function getState() {
  return state;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const actions = {
  finishOnboarding(s: Omit<Settings, 'startedAt' | 'reminders' | 'cutoffHours'>) {
    set({ ...state, settings: { ...DEFAULT_SETTINGS, ...s, startedAt: Date.now() } });
  },
  updateSettings(patch: Partial<Settings>) {
    if (!state.settings) return;
    set({ ...state, settings: { ...state.settings, ...patch } });
  },
  addDrink(d: Omit<Drink, 'id'>): string {
    const drink = { ...d, id: uid() };
    set({ ...state, drinks: [...state.drinks, drink].sort((a, b) => a.at - b.at) });
    return drink.id;
  },
  removeDrink(id: string) {
    set({ ...state, drinks: state.drinks.filter((d) => d.id !== id) });
  },
  saveCheckin(c: Checkin) {
    set({ ...state, checkins: [...state.checkins.filter((x) => x.day !== c.day), c] });
  },
  reset() {
    set(EMPTY);
  },
};

/** Current time, refreshed every 30 s so curves and moods stay live. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    const onVisible = () => document.visibilityState === 'visible' && setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return now;
}
