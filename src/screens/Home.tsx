import { useState } from 'react';
import { Cloud } from '../components/Cloud';
import { CurveChart } from '../components/CurveChart';
import { FlameIcon, MoonIcon, TrashIcon } from '../components/icons';
import { HOUR } from '../lib/caffeine';
import type { Today } from '../lib/derive';
import { clock, clockShort, longDate, mg } from '../lib/format';
import { href } from '../router';
import { actions, type AppState } from '../store';

const RANGES = [12, 24] as const;

export function Home({ state, today: t, now }: { state: AppState; today: Today; now: number }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(12);
  const { stats, limit, day } = t;
  const pct = Math.min(stats.total / limit, 1) * 100;
  const warm = stats.total / limit >= 0.8;
  const todays = state.drinks.filter((d) => d.at >= day.start && d.at < day.end);

  const cutoffSoon = now < day.cutoff && day.cutoff - now <= HOUR;
  const needsCheckin = !t.lastCheckin && now < day.cutoff && t.lastNight.end > t.settings.startedAt;

  return (
    <main className="screen with-tabs">
      <div className="header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className="title">Hushcup</h1>
          <span style={{ fontSize: 13, lineHeight: '16px', color: 'var(--ink2)' }}>{longDate(now)}</span>
        </div>
        <a className="pill-link" href={href('streaks')} aria-label={`Streak: ${t.streak.current} days`}>
          <FlameIcon />
          <span className="num">{t.streak.current}</span>
          <span style={{ fontWeight: 500, fontSize: 13 }}>day streak</span>
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
        <Cloud mood={t.mood} size={112} style={{ flex: 'none' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span className="display" style={{ fontSize: 28, lineHeight: '32px' }}>{t.moodName}</span>
          <span style={{ fontSize: 15, lineHeight: '21px', color: 'var(--ink2)', textWrap: 'pretty' }}>{t.moodLine}</span>
        </div>
      </div>

      <section className="card" style={{ marginTop: 14, padding: '16px 16px 14px' }} aria-label="Caffeine in your body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="display num" style={{ fontSize: 52, lineHeight: '56px' }}>{mg(t.nowMg)}</span>
              <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink2)' }}>mg</span>
            </div>
            <span style={{ fontSize: 14, lineHeight: '18px', color: 'var(--ink2)' }}>in your body right now</span>
          </div>
          <div style={{ display: 'flex', marginRight: -8 }} role="group" aria-label="Forecast range">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                aria-label={`Show next ${r} hours`}
                style={{ border: 0, background: 'transparent', padding: 0, width: 48, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span
                  style={{
                    display: 'block', padding: '0 10px', height: 30, lineHeight: '30px', borderRadius: 15, fontSize: 13, fontWeight: 700,
                    background: range === r ? 'var(--accent)' : 'transparent', color: range === r ? 'var(--on-accent)' : 'var(--ink2)',
                  }}
                >
                  {r} h
                </span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 6 }}>
          <CurveChart
            variant="home"
            doses={state.drinks}
            halfLife={t.halfLife}
            from={now - 3 * HOUR}
            to={now + range * HOUR}
            now={now}
            bedtime={day.bedtime}
            tickStepHours={range === 12 ? 3 : 6}
            label={`Caffeine in your body over the next ${range} hours. About ${mg(stats.bedMg)} mg at bedtime.`}
          />
        </div>
      </section>

      <div style={{ marginTop: 16, padding: '0 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)' }}>Today</span>
          <span className="num" style={{ fontSize: 13, color: 'var(--ink2)' }}>{stats.total} of {limit} mg</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--surface2)', overflow: 'hidden' }} role="progressbar" aria-label="Today's caffeine" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={stats.total}>
          <div style={{ height: 6, borderRadius: 3, width: `${pct}%`, background: warm ? 'var(--warmink)' : 'var(--accent)', transition: 'width .3s' }} />
        </div>
      </div>

      {needsCheckin && (
        <a href={href('checkin')} className="card" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', background: 'var(--soft)', borderColor: 'transparent', color: 'var(--softink)' }}>
          <MoonIcon size={20} />
          <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>How'd you sleep? Check in</span>
          <span aria-hidden="true">›</span>
        </a>
      )}
      {cutoffSoon && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 18, background: 'var(--warm)', color: 'var(--warmink)', fontSize: 14, lineHeight: '20px' }}>
          Your cutoff is <strong>{clock(day.cutoff)}</strong>. Last call for caffeine today.
        </div>
      )}

      {todays.length > 0 && (
        <section style={{ marginTop: 20 }} aria-label="Today's drinks">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {todays.map((d) => (
              <li key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 48, borderBottom: '1px solid var(--line)', padding: '0 0 0 4px' }}>
                <span className="num" style={{ width: 64, flex: 'none', fontSize: 13, color: 'var(--ink2)' }}>{clockShort(d.at)}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                <span className="num" style={{ fontSize: 15, fontWeight: 700, color: 'var(--softink)' }}>{d.mg} mg</span>
                <button className="icon-btn" onClick={() => actions.removeDrink(d.id)} aria-label={`Remove ${d.name}, ${d.mg} mg at ${clockShort(d.at)}`} style={{ color: 'var(--ink2)' }}>
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
