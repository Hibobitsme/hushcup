import { useState, type ReactNode } from 'react';
import { GROUP_OPTIONS, LIMIT_MAX, LIMIT_MIN, SENSITIVITY_OPTIONS } from '../components/Controls';
import { BackIcon, MinusIcon, PlusIcon } from '../components/icons';
import { minuteLabel } from '../lib/format';
import { notificationsSupported, permission, requestPermission } from '../notify';
import { back, go } from '../router';
import { actions, effectiveLimit, GROUP_CAP, type Settings as S } from '../store';
import type { ThemePref } from '../theme/theme';

function Row({ label, sub, children, last }: { label: string; sub?: string; children: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 60, padding: '8px 0', borderBottom: last ? 0 : '1px solid var(--line)' }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
        {sub && <span style={{ fontSize: 13, lineHeight: '18px', color: 'var(--ink2)' }}>{sub}</span>}
      </span>
      {children}
    </div>
  );
}

function MiniStepper({ value, onDown, onUp, label, canDown = true, canUp = true }: { value: string; onDown: () => void; onUp: () => void; label: string; canDown?: boolean; canUp?: boolean }) {
  const btn = { border: 0, width: 44, height: 44, borderRadius: 22, background: 'var(--soft)', color: 'var(--softink)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
      <button style={{ ...btn, opacity: canDown ? 1 : 0.4 }} onClick={onDown} disabled={!canDown} aria-label={`Decrease ${label}`}><MinusIcon /></button>
      <span className="num" aria-live="polite" style={{ minWidth: 84, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>{value}</span>
      <button style={{ ...btn, opacity: canUp ? 1 : 0.4 }} onClick={onUp} disabled={!canUp} aria-label={`Increase ${label}`}><PlusIcon size={22} stroke={2.6} /></button>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{ flex: 'none', border: 0, width: 52, height: 32, borderRadius: 16, padding: 3, background: on ? 'var(--accent)' : 'var(--line)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', margin: '6px 0' }}
    >
      <span style={{ width: 26, height: 26, borderRadius: 13, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section style={{ marginTop: 20 }}>
    <h2 style={{ margin: '0 0 8px 6px', fontSize: 13, fontWeight: 700, color: 'var(--ink2)' }}>{title}</h2>
    <div className="card" style={{ padding: '2px 16px' }}>{children}</div>
  </section>
);

export function Settings({ settings: s, theme, setTheme }: { settings: S; theme: ThemePref; setTheme: (t: ThemePref) => void }) {
  const set = actions.updateSettings;
  const [perm, setPerm] = useState(permission());
  const cap = GROUP_CAP[s.group];

  async function setReminder(key: 'cutoff' | 'morning', on: boolean) {
    if (on && !(await requestPermission())) {
      setPerm(permission());
      return;
    }
    setPerm(permission());
    set({ reminders: { ...s.reminders, [key]: on } });
  }

  return (
    <main className="screen">
      <div className="header edge">
        <button className="icon-btn" onClick={() => back('streaks')} aria-label="Back"><BackIcon /></button>
        <h1 className="title">Settings</h1>
        <div style={{ width: 44, height: 44 }} />
      </div>

      <Section title="Sleep">
        <Row label="Bedtime">
          <MiniStepper label="bedtime" value={minuteLabel(s.bedtimeMin)} onDown={() => set({ bedtimeMin: (s.bedtimeMin + 1425) % 1440 })} onUp={() => set({ bedtimeMin: (s.bedtimeMin + 15) % 1440 })} />
        </Row>
        <Row label="Cutoff" sub={`No caffeine after ${minuteLabel(s.bedtimeMin - s.cutoffHours * 60)}`} last>
          <MiniStepper label="cutoff hours" value={`${s.cutoffHours} h`} onDown={() => set({ cutoffHours: s.cutoffHours - 1 })} onUp={() => set({ cutoffHours: s.cutoffHours + 1 })} canDown={s.cutoffHours > 4} canUp={s.cutoffHours < 12} />
        </Row>
      </Section>

      <Section title="Caffeine">
        <Row label="Daily limit" sub={cap < s.limit ? `Capped at ${effectiveLimit(s)} mg` : undefined}>
          <MiniStepper label="daily limit" value={`${s.limit} mg`} onDown={() => set({ limit: Math.max(s.limit - 25, LIMIT_MIN) })} onUp={() => set({ limit: Math.min(s.limit + 25, LIMIT_MAX) })} canDown={s.limit > LIMIT_MIN} canUp={s.limit < LIMIT_MAX} />
        </Row>
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Sensitivity</span>
          <div className="seg" role="group" aria-label="Sensitivity" style={{ marginTop: 8 }}>
            {SENSITIVITY_OPTIONS.map((o) => (
              <button key={o.id} aria-pressed={s.sensitivity === o.id} onClick={() => set({ sensitivity: o.id })} style={{ flex: 1, height: 44 }}>{o.title}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Pregnant or under 18</span>
          <div className="seg" role="group" aria-label="Pregnant or under 18" style={{ marginTop: 8 }}>
            {GROUP_OPTIONS.map((o) => (
              <button key={o.id} aria-pressed={s.group === o.id} onClick={() => set({ group: o.id })} style={{ flex: 1, height: 44, padding: 0 }}>{o.title}</button>
            ))}
          </div>
          {s.group !== 'none' && (
            <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: '18px', color: 'var(--warmink)' }}>Limit capped at {cap} mg. A doctor can tell you what's right for you.</p>
          )}
        </div>
      </Section>

      <Section title="Body">
        <Row label="Weight" sub="Optional. Not used in the curve yet." last>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="hc-w" className="sr-only">Weight</label>
            <input
              id="hc-w"
              inputMode="numeric"
              value={s.weight ?? ''}
              placeholder="—"
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                set({ weight: v ? parseInt(v, 10) : null });
              }}
              style={{ width: 64, height: 44, borderRadius: 14, border: '2px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', textAlign: 'center', fontSize: 16, fontWeight: 700 }}
            />
            <div className="seg" role="group" aria-label="Unit">
              {(['lb', 'kg'] as const).map((u) => (
                <button key={u} aria-pressed={s.unit === u} onClick={() => set({ unit: u })} style={{ height: 36, minWidth: 40, padding: '0 10px' }}>{u}</button>
              ))}
            </div>
          </div>
        </Row>
      </Section>

      <Section title="Appearance">
        <div style={{ padding: '12px 0' }}>
          <div className="seg" role="group" aria-label="Theme">
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)} style={{ flex: 1, height: 44, textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Reminders">
        <Row label="Cutoff reminder" sub="30 minutes before your cutoff">
          <Toggle label="Cutoff reminder" on={s.reminders.cutoff && perm === 'granted'} onChange={(v) => void setReminder('cutoff', v)} />
        </Row>
        <Row label="Morning check-in" sub="When you wake, 8 hours after bedtime" last>
          <Toggle label="Morning check-in reminder" on={s.reminders.morning && perm === 'granted'} onChange={(v) => void setReminder('morning', v)} />
        </Row>
      </Section>
      <p style={{ margin: '8px 6px 0', fontSize: 12, lineHeight: '17px', color: 'var(--ink2)' }}>
        {!notificationsSupported()
          ? 'On iPhone, add Hushcup to your Home Screen first (Share → Add to Home Screen), then turn reminders on here.'
          : perm === 'denied'
            ? 'Notifications are blocked for Hushcup. Allow them in your device settings to get reminders.'
            : 'Reminders arrive while Hushcup is open or recently used.'}
      </p>

      <Section title="Data">
        <Row label="Erase everything" sub="Drinks, sleep scores and settings on this device" last>
          <button
            onClick={() => {
              if (confirm('Erase all Hushcup data on this device? This cannot be undone.')) {
                actions.reset();
                go('today');
              }
            }}
            style={{ flex: 'none', border: 0, height: 44, padding: '0 16px', borderRadius: 22, background: 'var(--warm)', color: 'var(--warmink)', fontSize: 14, fontWeight: 700 }}
          >
            Erase
          </button>
        </Row>
      </Section>
    </main>
  );
}
