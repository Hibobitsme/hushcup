# Hushcup

Caffeine, quieted. A mobile-first caffeine tracker (Vite + React + TypeScript, installable PWA). Everything is stored on the device in `localStorage`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # model, day/streak, insight and reminder tests
npm run build      # static site in dist/
npm run preview    # serve dist/ (service worker is only registered in builds)
```

Regenerate app icons after changing the art: `node scripts/make-icons.mjs`.

## Live app

https://hibobitsme.github.io/hushcup/ is rebuilt and published by GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

## Install on iPhone

Open the live app in Safari, then Share → Add to Home Screen. Reminders need the Home Screen app (iOS 16.4+).

## Where things are

| Path | What |
|---|---|
| `src/lib/caffeine.ts` | Absorption/elimination model, half-life by sensitivity |
| `src/lib/days.ts` | App day (runs bedtime+4 h to bedtime+4 h), cutoff, daily stats, streak |
| `src/lib/insights.ts` | Bedtime-mg split (median once there are 7+ nights), averages, trend line |
| `src/lib/derive.ts` | Mood, mood copy, bedtime verdict thresholds |
| `src/lib/drinks.ts` | Presets and the brand list |
| `src/store.ts` | Settings, drinks, check-ins in localStorage |
| `src/notify.ts` | Cutoff and morning check-in reminders |
| `src/screens/*` | Onboarding, Home, Log, Forecast, Check-in, History, Settings |
| `public/sw.js`, `public/manifest.webmanifest` | Offline shell and install metadata |

## Before launch

- **Limits:** the 200 mg (pregnant) and 100 mg (under 18) caps in `src/store.ts` are placeholders from the handoff. Review them with a trusted source.
- **Brand amounts** in `src/lib/drinks.ts` are approximate samples. Replace them with a verified dataset or API.
- **Verdict thresholds** (40 / 90 / 150 mg) in `src/lib/derive.ts` are placeholders. Tune them.
- **Weight** is collected but not used by the model yet.
- **Reminders** fire from timers while the app is open or recently backgrounded. Reminders that arrive with the app fully closed need Web Push from a server, which isn't set up.
