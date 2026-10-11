import { useState } from 'react';
import { Cloud, type Mood } from '../components/Cloud';
import { CloseIcon } from '../components/icons';
import { RATINGS, RatingFace } from '../components/RatingFace';
import { dayStats } from '../lib/days';
import type { Today } from '../lib/derive';
import { clock, clockShort, longDate } from '../lib/format';
import { MIN_NIGHTS, compare } from '../lib/insights';
import { back, href } from '../router';
import { actions, type AppState } from '../store';

const SUBS: Record<number, string> = {
  0: "Your answer becomes today's sleep score.",
  1: "Ouch. Let's see what lined up.",
  2: 'Not your best. Noted.',
  3: 'Fair enough.',
  4: 'Nice. Sounds restful.',
  5: 'Wonderful. Cloud approves.',
};

export function Checkin({ state, today: t, now }: { state: AppState; today: Today; now: number }) {
  const night = t.lastNight;
  const existing = state.checkins.find((c) => c.day === night.key);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [saved, setSaved] = useState(!!existing);

  const y = dayStats(state.drinks, night, t.limit, t.halfLife);
  const bedMg = Math.round(y.bedMg);
  const mood: Mood = rating === 1 || rating === 2 ? 'rough' : rating >= 4 ? 'calm' : 'sleepy';

  const nights = state.checkins.map((c) => ({ bedMg: c.bedMg, rating: c.rating }));
  const enough = nights.length >= MIN_NIGHTS;
  const c = compare(nights);

  function save() {
    if (!rating) return;
    actions.saveCheckin({ day: night.key, rating, bedMg, savedAt: Date.now() });
    setSaved(true);
  }

  return (
    <main className="screen">
      <div className="header edge">
        <button className="icon-btn" onClick={() => back('sleep')} aria-label="Close"><CloseIcon /></button>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink2)' }}>{longDate(now)} · {clock(now)}</span>
        <div style={{ width: 44, height: 44 }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <Cloud mood={mood} size={148} />
      </div>

      <h1 className="display" style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 32, lineHeight: '38px' }}>How'd you sleep?</h1>
      <p style={{ margin: '6px 0 0', textAlign: 'center', fontSize: 15, lineHeight: '21px', color: 'var(--ink2)' }}>{SUBS[rating]}</p>

      <div role="radiogroup" aria-label="Sleep rating" style={{ marginTop: 22, display: 'flex', gap: 8 }}>
        {RATINGS.map((r) => (
          <button
            key={r.n}
            className="choice"
            role="radio"
            aria-checked={rating === r.n}
            aria-label={`${r.n} of 5, ${r.label.toLowerCase()}`}
            onClick={() => {
              setRating(r.n);
              setSaved(false);
            }}
            style={{ flex: 1, minWidth: 0, borderRadius: 20, padding: '8px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <RatingFace n={r.n} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</span>
          </button>
        ))}
      </div>

      <section className="card" style={{ marginTop: 20, borderRadius: 24, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink2)' }}>Yesterday's caffeine</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {[
            [`${y.total} mg`, 'total'],
            [y.lastDrinkAt ? clockShort(y.lastDrinkAt) : '—', 'last drink'],
            [`~${bedMg} mg`, 'at bedtime'],
          ].map(([v, k]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="num" style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{v}</span>
              <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{k}</span>
            </div>
          ))}
        </div>
      </section>

      {saved && (
        <div role="status" style={{ marginTop: 14, padding: '12px 16px', borderRadius: 18, background: 'var(--soft)', color: 'var(--softink)', fontSize: 14, lineHeight: '20px', textWrap: 'pretty' }}>
          Saved. Your sleep score is <strong>{rating} of 5</strong>.{' '}
          {enough && c.lowAvg !== null
            ? `On nights under ${c.split} mg at bedtime, you've averaged ${c.lowAvg.toFixed(1)}.`
            : `${MIN_NIGHTS - nights.length} more ${MIN_NIGHTS - nights.length === 1 ? 'night' : 'nights'} and I'll show how caffeine and sleep connect.`}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 24 }} />

      {saved ? (
        <a className="btn-primary" href={href('streaks')}>See how caffeine and sleep connect</a>
      ) : (
        <button className="btn-primary" onClick={save} aria-disabled={!rating}>Save my sleep score</button>
      )}
    </main>
  );
}
