import { useState } from 'react';
import { Cloud } from '../components/Cloud';
import { CurveChart } from '../components/CurveChart';
import { ClockIcon, SunIcon } from '../components/icons';
import { HOUR, amountAt } from '../lib/caffeine';
import { bedtimeVerdict, type Today } from '../lib/derive';
import { clock } from '../lib/format';
import { href } from '../router';
import type { AppState } from '../store';

const WHAT_IF = [
  { label: 'Nothing', sub: 'skip it', mg: 0 },
  { label: 'Tea', sub: '+40 mg', mg: 40 },
  { label: 'Coffee', sub: '+95 mg', mg: 95 },
  { label: 'Energy', sub: '+160 mg', mg: 160 },
];

export function Forecast({ state, today: t, now }: { state: AppState; today: Today; now: number }) {
  const [extra, setExtra] = useState(0);
  const { day } = t;
  const doses = extra > 0 ? [...state.drinks, { mg: extra, at: now }] : state.drinks;
  const beforeBed = now < day.bedtime;
  // Look at the moment that matters: bedtime if it's ahead, otherwise right now.
  const focusMg = Math.round(amountAt(doses, beforeBed ? day.bedtime : now, t.halfLife));
  const v = bedtimeVerdict(focusMg);

  return (
    <main className="screen with-tabs">
      <div className="header">
        <h1 className="title">Tonight</h1>
        <a className="pill-link" href={href('checkin')} style={{ fontSize: 14 }}>
          <SunIcon />
          <span>Check-in</span>
        </a>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p aria-live="polite" style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 27, lineHeight: '33px', textWrap: 'balance' }}>
            {beforeBed ? <>At {clock(day.bedtime)} you'll still have </> : <>It's past bedtime. You have </>}
            <span className="num" style={{ color: 'var(--accent)', fontWeight: 600 }}>~{focusMg} mg</span>
            {beforeBed ? ' in your system.' : ' in your system now.'}
          </p>
          <span
            style={{
              alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 16, fontSize: 14, fontWeight: 700,
              background: v.tone === 'soft' ? 'var(--soft)' : 'var(--warm)', color: v.tone === 'soft' ? 'var(--softink)' : 'var(--warmink)',
            }}
          >
            {v.text}
          </span>
        </div>
        <Cloud mood={v.mood} size={104} style={{ flex: 'none' }} />
      </div>

      <section className="card" style={{ marginTop: 12, padding: '14px 14px 12px' }}>
        <CurveChart
          variant="forecast"
          doses={doses}
          halfLife={t.halfLife}
          from={now}
          to={beforeBed ? day.bedtime + 8.5 * HOUR : now + 10 * HOUR}
          now={now}
          bedtime={day.bedtime}
          tickStepHours={4}
          label={`Caffeine in your body from now until morning. About ${focusMg} mg ${beforeBed ? 'at bedtime' : 'now'}.`}
        />
      </section>

      <section className="card" style={{ marginTop: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>What if I have one more right now?</h2>
        <div role="group" aria-label="Hypothetical drink" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {WHAT_IF.map((o) => (
            <button
              key={o.label}
              className="choice"
              aria-pressed={extra === o.mg}
              onClick={() => setExtra(o.mg)}
              style={{ height: 56, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, padding: 0 }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>{o.label}</span>
              <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{o.sub}</span>
            </button>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '0 6px' }}>
        <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 20, background: 'var(--soft)', color: 'var(--softink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClockIcon />
        </div>
        <span style={{ fontSize: 14, lineHeight: '20px', color: 'var(--ink2)', textWrap: 'pretty' }}>
          Your cutoff {now > day.cutoff ? 'was' : 'is'} <strong style={{ color: 'var(--ink)' }}>{clock(day.cutoff)}</strong>, {t.settings.cutoffHours} hours before bed. Anything after that follows you into sleep.
        </span>
      </div>
    </main>
  );
}
