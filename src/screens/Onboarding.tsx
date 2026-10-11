import { useState, type ReactNode } from 'react';
import { Cloud, type Mood } from '../components/Cloud';
import { GROUP_OPTIONS, LIMIT_MAX, LIMIT_MIN, OptionCard, SENSITIVITY_OPTIONS, Stepper } from '../components/Controls';
import { BackIcon } from '../components/icons';
import type { Sensitivity } from '../lib/caffeine';
import { minuteLabel } from '../lib/format';
import { go } from '../router';
import { actions, DEFAULT_SETTINGS, GROUP_CAP, type Group } from '../store';

const SENS_NAME: Record<Sensitivity, string> = { fast: 'Fast', average: 'Average', slow: 'Slow' };

const Bubble = ({ children }: { children: ReactNode }) => (
  <h1
    className="card"
    style={{ margin: '12px 0 0', padding: '14px 20px', borderRadius: 22, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, lineHeight: '30px', textWrap: 'balance' }}
  >
    {children}
  </h1>
);
const Note = ({ children }: { children: ReactNode }) => (
  <p style={{ margin: '20px 0 0', maxWidth: 290, fontSize: 15, lineHeight: '22px', color: 'var(--ink2)' }}>{children}</p>
);
const Body = ({ children }: { children: ReactNode }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>{children}</div>
);
const Next = ({ label = 'Next', onClick }: { label?: string; onClick: () => void }) => (
  <button className="btn-primary" onClick={onClick}>{label}</button>
);

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [bed, setBed] = useState(DEFAULT_SETTINGS.bedtimeMin);
  const [limit, setLimit] = useState(DEFAULT_SETTINGS.limit);
  const [sens, setSens] = useState<Sensitivity>('average');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'lb' | 'kg'>('lb');
  const [group, setGroup] = useState<Group>('none');

  const cap = GROUP_CAP[group];
  const effLimit = Math.min(limit, cap);
  const next = () => setStep((s) => Math.min(s + 1, 6));
  const mood: Mood = step === 1 ? 'sleepy' : step === 3 && sens === 'fast' ? 'buzzing' : 'calm';

  const finish = () => {
    actions.finishOnboarding({
      bedtimeMin: ((bed % 1440) + 1440) % 1440,
      limit,
      group,
      sensitivity: sens,
      weight: weight ? parseInt(weight, 10) : null,
      unit,
    });
    go('today');
  };

  return (
    <main className="screen" style={{ paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, marginLeft: -12 }}>
        {step > 0 ? (
          <button className="icon-btn" onClick={() => setStep(step - 1)} aria-label="Back">
            <BackIcon />
          </button>
        ) : (
          <div style={{ width: 44, height: 44 }} />
        )}
        <div
          role="progressbar"
          aria-label="Setup progress"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={Math.min(step, 5)}
          style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6, marginRight: 12, opacity: step === 0 ? 0 : 1 }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: 6, borderRadius: 3, background: step >= i ? 'var(--accent)' : 'var(--line)' }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <Cloud mood={mood} size={step === 0 ? 210 : 150} />
      </div>

      {step === 0 && (
        <>
          <Body>
            <h1 className="display" style={{ margin: '8px 0 0', fontSize: 44, lineHeight: '48px' }}>Hushcup</h1>
            <span style={{ marginTop: 6, fontSize: 18, lineHeight: '24px', color: 'var(--ink2)' }}>Caffeine, quieted.</span>
            <p style={{ margin: '28px 0 0', maxWidth: 280, fontSize: 16, lineHeight: '24px', color: 'var(--ink2)' }}>
              Hi, I'm your cloud. Five quick questions and I'll show you what's in your body, and when it fades.
            </p>
          </Body>
          <Next label="Let's go" onClick={next} />
          <span style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: 'var(--ink2)' }}>Takes about a minute</span>
        </>
      )}

      {step === 1 && (
        <>
          <Body>
            <Bubble>What time do you usually go to bed?</Bubble>
            <div style={{ marginTop: 36 }}>
              <Stepper
                value={<span className="display num" style={{ fontSize: 40, lineHeight: '48px', whiteSpace: 'nowrap' }}>{minuteLabel(bed)}</span>}
                onDown={() => setBed(bed - 15)}
                onUp={() => setBed(bed + 15)}
                downLabel="15 minutes earlier"
                upLabel="15 minutes later"
              />
            </div>
            <Note>I'll mark it on your curve so you can see what's left when the lights go out.</Note>
          </Body>
          <Next onClick={next} />
        </>
      )}

      {step === 2 && (
        <>
          <Body>
            <Bubble>What's your daily caffeine limit?</Bubble>
            <div style={{ marginTop: 32 }}>
              <Stepper
                value={
                  <>
                    <span className="display num" style={{ fontSize: 56, lineHeight: '60px' }}>{limit}</span>
                    <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink2)' }}>mg</span>
                  </>
                }
                onDown={() => setLimit(Math.max(limit - 25, LIMIT_MIN))}
                onUp={() => setLimit(Math.min(limit + 25, LIMIT_MAX))}
                canDown={limit > LIMIT_MIN}
                canUp={limit < LIMIT_MAX}
                downLabel="25 mg less"
                upLabel="25 mg more"
              />
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
              {[200, 300, 400].map((v) => (
                <button
                  key={v}
                  className="choice"
                  aria-pressed={limit === v}
                  onClick={() => setLimit(v)}
                  style={{ height: 44, padding: '0 18px', borderRadius: 22, fontSize: 15, fontWeight: 700, color: limit === v ? 'var(--softink)' : 'var(--ink)' }}
                >
                  {v}
                </button>
              ))}
            </div>
            <Note>400 mg is the default. Most healthy adults stay under about that much a day.</Note>
          </Body>
          <Next onClick={next} />
        </>
      )}

      {step === 3 && (
        <>
          <Body>
            <Bubble>How sensitive are you to caffeine?</Bubble>
            <div role="radiogroup" aria-label="Sensitivity" style={{ marginTop: 24, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SENSITIVITY_OPTIONS.map((o) => (
                <OptionCard key={o.id} on={sens === o.id} onPick={() => setSens(o.id)} title={o.title} sub={o.sub} />
              ))}
            </div>
          </Body>
          <div style={{ height: 16 }} />
          <Next onClick={next} />
        </>
      )}

      {step === 4 && (
        <>
          <Body>
            <Bubble>What's your body weight?</Bubble>
            <span style={{ marginTop: 10, fontSize: 14, color: 'var(--ink2)' }}>Optional</span>
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
              <label htmlFor="hc-weight" className="sr-only">Body weight</label>
              <input
                id="hc-weight"
                type="text"
                inputMode="numeric"
                placeholder={unit === 'lb' ? '150' : '68'}
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                style={{
                  width: 150, height: 64, borderRadius: 20, border: '2px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)',
                  textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32,
                }}
              />
              <div className="seg" role="group" aria-label="Unit">
                {(['lb', 'kg'] as const).map((u) => (
                  <button key={u} aria-pressed={unit === u} onClick={() => setUnit(u)} style={{ height: 44 }}>{u}</button>
                ))}
              </div>
            </div>
            <Note>It helps me fine-tune your curve. Skip it and I'll use an average.</Note>
          </Body>
          <Next onClick={next} />
          <button className="btn-text" onClick={() => { setWeight(''); next(); }} style={{ marginTop: 4 }}>Skip</button>
        </>
      )}

      {step === 5 && (
        <>
          <Body>
            <Bubble>Are you pregnant or under 18?</Bubble>
            <div role="radiogroup" aria-label="Pregnant or under 18" style={{ marginTop: 24, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GROUP_OPTIONS.map((o) => (
                <OptionCard key={o.id} on={group === o.id} onPick={() => setGroup(o.id)} title={o.title} />
              ))}
            </div>
            {group !== 'none' && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 16, background: 'var(--warm)', color: 'var(--warmink)', fontSize: 14, lineHeight: '20px', textAlign: 'left' }}>
                We'll set a gentler limit of {cap} mg. A doctor can tell you what's right for you.
              </div>
            )}
          </Body>
          <div style={{ height: 16 }} />
          <Next onClick={next} />
        </>
      )}

      {step === 6 && (
        <>
          <Body>
            <Bubble>All set. Let's keep it quiet.</Bubble>
            <div className="card" style={{ marginTop: 24, alignSelf: 'stretch', borderRadius: 24, padding: '6px 18px', textAlign: 'left' }}>
              {[
                ['Bedtime', minuteLabel(bed)],
                ['Daily limit', `${effLimit} mg`],
                ['Sensitivity', SENS_NAME[sens]],
              ].map(([k, v], i) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 52, borderBottom: i < 2 ? '1px solid var(--line)' : 0 }}>
                  <span style={{ fontSize: 15, color: 'var(--ink2)' }}>{k}</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <Note>You can change any of this later in settings.</Note>
          </Body>
          <Next label="Show me my curve" onClick={finish} />
        </>
      )}
    </main>
  );
}
