import { useEffect, useRef, useState } from 'react';
import { Cloud } from '../components/Cloud';
import { CloseIcon, PathIcon, PlusIcon, SearchIcon } from '../components/icons';
import { amountAt } from '../lib/caffeine';
import type { Today } from '../lib/derive';
import { PRESETS, searchBrands } from '../lib/drinks';
import { clockShort, mg } from '../lib/format';
import { back, go } from '../router';
import { actions, getState } from '../store';

const AGO = [
  { min: 0, label: 'Now' },
  { min: 30, label: '30 min ago' },
  { min: 60, label: '1 h ago' },
];

interface Added {
  id: string;
  name: string;
  mg: number;
}

export function Log({ today: t }: { today: Today }) {
  const [q, setQ] = useState('');
  const [custom, setCustom] = useState('');
  const [ago, setAgo] = useState(0);
  const [added, setAdded] = useState<Added | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const results = searchBrands(q);
  const hasQ = q.trim().length > 0;
  const customMg = parseInt(custom, 10);
  const okCustom = customMg > 0;

  function add(name: string, amount: number) {
    const id = actions.addDrink({ name, mg: amount, at: Date.now() - ago * 60_000 });
    setAdded({ id, name, mg: amount });
    setQ('');
    setCustom('');
  }

  function undo() {
    if (added) actions.removeDrink(added.id);
    setAdded(null);
  }

  useEffect(() => {
    if (added) toastRef.current?.focus();
  }, [added]);

  const bedMg = added ? amountAt(getState().drinks, t.day.bedtime, t.halfLife) : 0;

  return (
    <main className="screen">
      <div className="header edge">
        <button className="icon-btn" onClick={() => back('today')} aria-label="Close">
          <CloseIcon />
        </button>
        <h1 className="title">Log a drink</h1>
        <div style={{ width: 44, height: 44 }} />
      </div>

      <div className="field" style={{ marginTop: 10, padding: '0 18px' }}>
        <SearchIcon />
        <label htmlFor="hc-q" className="sr-only">Search brands</label>
        <input id="hc-q" type="search" autoComplete="off" placeholder="Search Monster, Celsius, Starbucks…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="When">
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink2)', marginRight: 2 }}>When</span>
        {AGO.map((a) => (
          <button
            key={a.min}
            onClick={() => setAgo(a.min)}
            aria-pressed={ago === a.min}
            style={{
              border: 0, height: 44, padding: '0 16px', borderRadius: 22, fontSize: 14, fontWeight: 700,
              background: ago === a.min ? 'var(--accent)' : 'var(--surface2)', color: ago === a.min ? 'var(--on-accent)' : 'var(--ink)',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {hasQ ? (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
          {results.map((r) => (
            <button
              key={r.name}
              onClick={() => add(r.name, r.mg)}
              style={{
                border: 0, borderBottom: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', textAlign: 'left',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 60, padding: '8px 2px',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{r.name}</span>
                <span style={{ fontSize: 13, color: 'var(--ink2)' }}>{r.size}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--softink)' }}>{r.mg} mg</span>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusIcon size={16} stroke={3} />
                </span>
              </span>
            </button>
          ))}
          {results.length === 0 && (
            <div style={{ padding: '24px 4px', fontSize: 15, lineHeight: '22px', color: 'var(--ink2)' }}>No match for "{q.trim()}". Try a custom amount below.</div>
          )}
          <p style={{ margin: '10px 2px 0', fontSize: 12, color: 'var(--ink2)' }}>Brand amounts are approximate.</p>
        </div>
      ) : (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRESETS.map((cat) => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 'none', width: 76, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--soft)', color: 'var(--softink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PathIcon d={cat.icon} />
                </div>
                <span style={{ fontSize: 12, lineHeight: '14px', fontWeight: 700, textAlign: 'center' }}>{cat.name}</span>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                {cat.sizes.map((s) => (
                  <button
                    key={s.label}
                    className="choice"
                    onClick={() => add(`${s.label} ${cat.name.toLowerCase()}`, s.mg)}
                    aria-label={`${cat.name}, ${s.label} ${s.detail}, ${s.mg} milligrams`}
                    style={{ height: 62, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{s.label}</span>
                    <span className="num" style={{ fontSize: 16, fontWeight: 700 }}>
                      {s.mg}
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)' }}> mg</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (okCustom) add('Custom drink', customMg);
        }}
      >
        <label htmlFor="hc-custom" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>Custom</label>
        <div className="field" style={{ flex: 1, minWidth: 0 }}>
          <input id="hc-custom" type="text" inputMode="numeric" enterKeyHint="done" placeholder="Enter mg" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} />
          <span style={{ fontSize: 14, color: 'var(--ink2)' }}>mg</span>
        </div>
        <button
          type="submit"
          aria-disabled={!okCustom}
          style={{
            border: 0, height: 52, padding: '0 22px', borderRadius: 26, fontSize: 16, fontWeight: 700,
            background: okCustom ? 'var(--accent)' : 'var(--surface2)', color: okCustom ? 'var(--on-accent)' : 'var(--ink2)',
          }}
        >
          Add
        </button>
      </form>

      {added && (
        <div className="toast" role="status" ref={toastRef} tabIndex={-1}>
          <Cloud mood={bedMg < 100 ? 'calm' : 'buzzing'} size={52} style={{ flex: 'none' }} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700, lineHeight: '19px' }}>Added {added.name}, {added.mg} mg</span>
            <span className="num" style={{ fontSize: 13, lineHeight: '17px', color: 'var(--ink2)' }}>At {clockShort(t.day.bedtime)} you'd have ~{mg(bedMg)} mg</span>
          </div>
          <button className="btn-text" onClick={undo} style={{ fontSize: 14 }}>Undo</button>
          <button
            onClick={() => go('today')}
            style={{ border: 0, display: 'flex', alignItems: 'center', height: 44, padding: '0 18px', borderRadius: 22, background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 15, fontWeight: 700 }}
          >
            Done
          </button>
        </div>
      )}
    </main>
  );
}
