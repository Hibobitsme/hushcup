import { Cloud } from '../components/Cloud';
import { useWidth } from '../components/CurveChart';
import { GearIcon } from '../components/icons';
import { dayOf, dayStats, prevDay, type Day } from '../lib/days';
import type { Today } from '../lib/derive';
import { MIN_NIGHTS, compare, trendLine } from '../lib/insights';
import { href } from '../router';
import type { AppState } from '../store';

const BADGES = [3, 7, 14, 30];
const CHECK = 'M5 12l5 5 9-10';
const CROSS = 'M7 7l10 10M17 7L7 17';
const PLUS = 'M12 8v8M8 12h8';

export function History({ state, today: t }: { state: AppState; today: Today }) {
  const streak = t.streak.current;
  const nextBadge = BADGES.find((b) => b > streak);

  let streakLine: string;
  if (t.streak.todayBroken) streakLine = 'Today went past your limit or cutoff. Your streak starts fresh tomorrow.';
  else if (!nextBadge) streakLine = "Days under your limit and done before cutoff. You've earned every badge.";
  else {
    const need = nextBadge - streak;
    streakLine = `Days under your limit and done before cutoff. ${need === 1 ? 'One more' : `${need} more`} for a ${nextBadge}-day badge.`;
  }

  // Last 6 completed days plus today.
  const days: Day[] = [t.day];
  while (days.length < 7) days.unshift(prevDay(days[0], t.rules));
  const firstDay = dayOf(t.settings.startedAt, t.rules).start;

  const nights = [...state.checkins]
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-14)
    .map((c) => ({ bedMg: c.bedMg, rating: c.rating }));

  return (
    <main className="screen with-tabs">
      <div className="header">
        <h1 className="title">Streaks</h1>
        <a className="icon-btn" href={href('settings')} aria-label="Settings" style={{ marginRight: -10 }}>
          <GearIcon />
        </a>
      </div>

      <section className="card" style={{ marginTop: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Cloud mood={t.streak.todayBroken ? 'rough' : 'calm'} size={96} style={{ flex: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="display num" style={{ fontSize: 56, lineHeight: '60px' }}>{streak}</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink2)' }}>day streak</span>
            </div>
            <span style={{ fontSize: 14, lineHeight: '19px', color: 'var(--ink2)', textWrap: 'pretty' }}>{streakLine}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {BADGES.map((b) => {
            const earned = streak >= b;
            const next = b === nextBadge;
            return (
              <div key={b} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} role="img" aria-label={`${b}-day badge, ${earned ? 'earned' : next ? 'next up' : 'locked'}`}>
                <div
                  className="display"
                  style={{
                    width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    border: `2px ${next ? 'dashed' : 'solid'} ${earned || next ? 'var(--accent)' : 'var(--line)'}`,
                    background: earned ? 'var(--accent)' : 'transparent',
                    color: earned ? 'var(--on-accent)' : next ? 'var(--accent)' : 'var(--ink2)',
                  }}
                >
                  {b}
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{b} days</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card" aria-label="This week" style={{ marginTop: 12, padding: '14px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
        {days.map((d) => {
          const isToday = d.key === t.day.key;
          const before = d.start < firstDay;
          const s = dayStats(state.drinks, d, t.limit, t.halfLife);
          const date = new Date(d.start);
          const name = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
          let look = { icon: CHECK, border: 'var(--accent)', bg: 'var(--accent)', fg: 'var(--on-accent)', style: 'solid', aria: 'under limit and before cutoff' };
          if (before) look = { icon: '', border: 'var(--line)', bg: 'transparent', fg: 'var(--ink2)', style: 'solid', aria: 'before you started' };
          else if (!s.met) look = { icon: CROSS, border: 'var(--warmink)', bg: 'var(--warm)', fg: 'var(--warmink)', style: 'solid', aria: s.overLimit ? 'over limit' : 'caffeine after cutoff' };
          else if (isToday) look = { icon: PLUS, border: 'var(--accent)', bg: 'transparent', fg: 'var(--accent)', style: 'dashed', aria: 'today, in progress' };
          return (
            <div key={d.key} role="img" aria-label={`${name}, ${look.aria}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, border: `2px ${look.style} ${look.border}`, background: look.bg, color: look.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {look.icon && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={look.icon} />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--ink2)' }}>{date.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
            </div>
          );
        })}
      </section>

      <section className="card" style={{ marginTop: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Caffeine and sleep</h2>
          {nights.length >= MIN_NIGHTS && <span style={{ fontSize: 12, color: 'var(--ink2)' }}>last {nights.length} nights</span>}
        </div>
        {nights.length >= MIN_NIGHTS ? <Scatter nights={nights} /> : <ScatterEmpty count={state.checkins.length} />}
      </section>
    </main>
  );
}

function ScatterEmpty({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 2px' }}>
      <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: 'var(--ink2)', textWrap: 'pretty' }}>
        Check in each morning. After {MIN_NIGHTS} nights I'll show how the caffeine left at bedtime lines up with your sleep.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MIN_NIGHTS}, minmax(0, 1fr))`, gap: 6 }} role="img" aria-label={`${count} of ${MIN_NIGHTS} nights logged`}>
        {Array.from({ length: MIN_NIGHTS }, (_, i) => (
          <div key={i} style={{ height: 6, borderRadius: 3, background: i < count ? 'var(--accent)' : 'var(--line)' }} />
        ))}
      </div>
      <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--softink)' }}>{Math.min(count, MIN_NIGHTS)} of {MIN_NIGHTS} nights</span>
      <a href={href('checkin')} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', height: 44, padding: '0 16px', borderRadius: 22, background: 'var(--soft)', color: 'var(--softink)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
        Check in now
      </a>
    </div>
  );
}

function Scatter({ nights }: { nights: { bedMg: number; rating: number }[] }) {
  const [ref, W] = useWidth<HTMLDivElement>(318);
  const H = 176;
  const PX0 = 28;
  const PW = W - PX0;
  const maxMg = Math.max(220, Math.ceil((Math.max(...nights.map((n) => n.bedMg)) * 1.1) / 50) * 50);
  const X = (m: number) => PX0 + (m / maxMg) * PW;
  const Y = (r: number) => 150 - ((r - 1) / 4) * 130;
  const c = compare(nights);
  const line = trendLine(nights);
  const yAt = (m: number) => Y(Math.min(5.4, Math.max(0.6, line!.a + line!.b * m)));
  const step = maxMg <= 250 ? 50 : 100;
  const xTicks = Array.from({ length: Math.floor(maxMg / step) + 1 }, (_, i) => i * step).filter((m) => X(m) < W - 10);

  return (
    <>
      <div ref={ref} style={{ position: 'relative', height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Each dot is a night: caffeine left at bedtime against your sleep score" style={{ display: 'block' }}>
          <rect x={PX0} y={8} width={X(c.split) - PX0} height={152} rx={10} fill="var(--soft)" />
          <line x1={PX0} y1={160} x2={W} y2={160} stroke="var(--line)" strokeWidth={2} strokeLinecap="round" />
          <line x1={X(c.split)} y1={8} x2={X(c.split)} y2={160} stroke="var(--accent)" opacity={0.5} strokeWidth={2} strokeDasharray="3 5" strokeLinecap="round" />
          {line && <path d={`M${X(0)} ${yAt(0)} L${X(maxMg)} ${yAt(maxMg)}`} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" strokeDasharray="1 7" />}
          {nights.map((n, i) => (
            <circle key={i} cx={X(n.bedMg)} cy={Y(n.rating)} r={6} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} opacity={0.9} />
          ))}
        </svg>
        {[1, 2, 3, 4, 5].map((r) => (
          <span key={r} className="num" style={{ position: 'absolute', left: 6, top: Y(r) - 8, fontSize: 12, color: 'var(--ink2)' }} aria-hidden="true">{r}</span>
        ))}
      </div>
      <div style={{ position: 'relative', height: 18, marginTop: -6 }} aria-hidden="true">
        {xTicks.map((m, i) => (
          <span key={m} style={{ position: 'absolute', left: X(m), transform: 'translateX(-50%)', fontSize: 12, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>
            {i === xTicks.length - 1 ? `${m} mg` : m}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        <div style={{ padding: '10px 12px', borderRadius: 16, background: 'var(--soft)', color: 'var(--softink)', display: 'flex', flexDirection: 'column' }}>
          <span className="display num" style={{ fontSize: 22, lineHeight: '26px' }}>{c.lowAvg?.toFixed(1) ?? '–'} / 5</span>
          <span style={{ fontSize: 12 }}>under {c.split} mg at bedtime</span>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 16, background: 'var(--warm)', color: 'var(--warmink)', display: 'flex', flexDirection: 'column' }}>
          <span className="display num" style={{ fontSize: 22, lineHeight: '26px' }}>{c.highAvg?.toFixed(1) ?? '–'} / 5</span>
          <span style={{ fontSize: 12 }}>{c.split} mg or more at bedtime</span>
        </div>
      </div>
    </>
  );
}
