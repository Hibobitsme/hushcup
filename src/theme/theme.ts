import { useCallback, useEffect, useState } from 'react';

export type ThemePref = 'auto' | 'light' | 'dark';

const KEY = 'hushcup.theme';

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
  } catch {
    /* storage unavailable */
  }
  return 'auto';
}

export function applyTheme(pref: ThemePref) {
  document.documentElement.dataset.theme = pref;
}

/** Theme preference: follows the system by default, with a persisted manual override. */
export function useTheme() {
  const [pref, setPrefState] = useState<ThemePref>(readPref);

  useEffect(() => {
    applyTheme(pref);
  }, [pref]);

  const setPref = useCallback((next: ThemePref) => {
    setPrefState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { pref, setPref };
}
