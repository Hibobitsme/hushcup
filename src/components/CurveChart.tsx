import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { HOUR, amountAt, sampleCurve, type Dose } from '../lib/caffeine';
import { clock, clockShort, mg } from '../lib/format';
import { MoonIcon } from './icons';

export function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

interface Props {
  doses: readonly Dose[];
  halfLife: number;
  from: number;
  to: number;
  now: number;
  bedtime: number;
  /** Sleep window length in hours, shaded from bedtime. */
  sleepHours?: number;
  /** Home style (past faded, dashed "now" line) vs. Forecast style (dashed bedtime line). */
  variant: 'home' | 'forecast';
  tickStepHours: number;
  label: string;
}

const pathOf = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

/** Caffeine-in-body curve with now dot, bedtime marker and sleep zone. */
export function CurveChart({ doses, halfLife, from, to, now, bedtime, sleepHours = 8, variant, tickStepHours, label }: Props) {
  const [ref, W] = useWidth<HTMLDivElement>(326);
  const [hover, setHover] = useState<number | null>(null);
  const hideTimer = useRef<number>();
  useEffect(() => () => clearTimeout(hideTimer.current), []);
  const home = variant === 'home';
  const H = home ? 180 : 150;
  const base = home ? 170 : 140;
  const top = home ? 46 : 34;

  const pts = sampleCurve(doses, from, to, halfLife);
  const peak = Math.max(...pts.map((p) => p.mg));
  const ymax = home ? Math.max(peak * 1.2, 120) : Math.max(peak * 1.15, 140);
  const X = (t: number) => ((t - from) / (to - from)) * W;
  const Y = (a: number) => base - (a / ymax) * (base - top);
  const xy = (p: { t: number; mg: number }): [number, number] => [X(p.t), Y(p.mg)];

  const nowMg = amountAt(doses, now, halfLife);
  const bedMg = amountAt(doses, bedtime, halfLife);
  const nowX = X(now);
  const nowY = Y(nowMg);
  const bedVisible = bedtime >= from && bedtime <= to;
  const bedX = X(bedtime);
  const bedY = Y(bedMg);

  const past = home ? pts.filter((p) => p.t < now).map(xy).concat([[nowX, nowY]]) : [];
  const future = ([[nowX, nowY]] as [number, number][]).concat(pts.filter((p) => p.t > now).map(xy));
  const all = home ? past.concat(future.slice(1)) : future;
  const area = `${pathOf(all)} L${all[all.length - 1][0].toFixed(1)} ${base} L${all[0][0].toFixed(1)} ${base} Z`;

  const zoneStart = Math.max(bedX, 0);
  const zoneEnd = Math.min(X(bedtime + sleepHours * HOUR), W);
  const zoneW = Math.max(zoneEnd - zoneStart, 0);

  // Ticks on whole clock hours divisible by the step, kept clear of edges and the "Now" label.
  const ticks: { x: number; label: string }[] = [];
  const d = new Date(from);
  d.setMinutes(0, 0, 0);
  if (d.getTime() < from) d.setHours(d.getHours() + 1);
  for (; d.getTime() <= to; d.setHours(d.getHours() + 1)) {
    if (d.getHours() % tickStepHours) continue;
    const x = X(d.getTime());
    if (x < 22 || x > W - 22 || Math.abs(x - nowX) < 38) continue;
    ticks.push({ x, label: clockShort(d) });
  }

  const pillText = `${clockShort(bedtime)} · ~${mg(bedMg)} mg`;
  const pillHalf = 4 + pillText.length * 3.4;
  const pillLeft = bedVisible ? Math.min(Math.max(bedX, pillHalf), W - pillHalf) : W - pillHalf;
  const pillTop = bedVisible ? Math.max(bedY - (home ? 40 : 38), home ? 4 : 2) : 4;
  const clampLabel = (x: number) => Math.min(Math.max(x, 14), W - 14);

  // Scrubbing: hover (mouse), drag (touch) or arrow keys pick a moment on the curve.
  const STEP = 5 * 60_000;
  const snap = (t: number) => Math.min(Math.max(Math.round(t / STEP) * STEP, from), to);
  const tAtX = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return snap(from + ((clientX - r.left) / r.width) * (to - from));
  };
  const hoverMg = hover === null ? 0 : amountAt(doses, hover, halfLife);
  const hoverX = hover === null ? 0 : X(hover);
  const hoverY = Y(hoverMg);
  const tipHalf = 46;
  const tipLeft = Math.min(Math.max(hoverX, tipHalf), W - tipHalf);
  const tipTop = Math.max(hoverY - 58, -6);

  function onPointer(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' && e.type === 'pointermove' && e.buttons === 0) return;
    clearTimeout(hideTimer.current);
    setHover(tAtX(e.clientX, e.currentTarget));
  }

  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse') setHover(null);
    // On touch, leave the reading up briefly after the finger lifts.
    else hideTimer.current = window.setTimeout(() => setHover(null), 2500);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = (e.shiftKey ? 60 : 15) * 60_000;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const start = hover ?? snap(now);
      setHover(snap(start + (e.key === 'ArrowRight' ? step : -step)));
    } else if (e.key === 'Escape') setHover(null);
  }

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <div
        style={{ position: 'relative', height: H, touchAction: 'pan-y', cursor: 'crosshair', borderRadius: 8 }}
        tabIndex={0}
        aria-label={`${label} Use the left and right arrow keys to read the curve.`}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onPointerLeave={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label} style={{ display: 'block', overflow: 'visible' }}>
          {bedVisible && zoneW > 0 && <rect x={zoneStart} y={0} width={zoneW} height={base} rx={14} fill="var(--soft)" />}
          <line x1={0} y1={base} x2={W} y2={base} stroke="var(--line)" strokeWidth={2} strokeLinecap="round" />
          <path d={area} fill="var(--accent)" opacity={0.12} />
          {home && <path d={pathOf(past)} fill="none" stroke="var(--accent)" opacity={0.4} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
          <path d={pathOf(future)} fill="none" stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          {home && <line x1={nowX} y1={14} x2={nowX} y2={base} stroke="var(--accent)" opacity={0.5} strokeWidth={2} strokeDasharray="3 5" strokeLinecap="round" />}
          {!home && bedVisible && <line x1={bedX} y1={30} x2={bedX} y2={base} stroke="var(--accent)" opacity={0.5} strokeWidth={2} strokeDasharray="3 5" strokeLinecap="round" />}
          <circle cx={nowX} cy={nowY} r={7} fill="var(--accent)" stroke="var(--surface)" strokeWidth={3} />
          {bedVisible && <circle cx={bedX} cy={bedY} r={6} fill="var(--surface)" stroke="var(--accent)" strokeWidth={3} />}
          {hover !== null && (
            <g pointerEvents="none">
              <line x1={hoverX} y1={0} x2={hoverX} y2={base} stroke="var(--ink)" opacity={0.3} strokeWidth={1.5} />
              <circle cx={hoverX} cy={hoverY} r={6} fill="var(--accent)" stroke="var(--surface)" strokeWidth={3} />
            </g>
          )}
        </svg>
        {bedVisible && zoneW > 48 && (
          <span style={{ position: 'absolute', left: zoneStart + 10, top: home ? 10 : 8, fontSize: 12, fontWeight: 700, color: 'var(--softink)' }}>Sleep</span>
        )}
        {bedtime >= from && hover === null && <div
          style={{
            position: 'absolute', left: pillLeft, top: pillTop, transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 4, height: 26, padding: '0 9px', borderRadius: 13,
            background: 'var(--ink)', color: 'var(--bg)', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
          }}
          className="num"
        >
          <MoonIcon size={12} stroke={2.6} />
          <span>{pillText}{bedVisible ? '' : ' →'}</span>
        </div>}
        <div
          aria-live="polite"
          className="num"
          style={{
            position: 'absolute', left: tipLeft, top: tipTop, transform: 'translateX(-50%)', zIndex: 2, pointerEvents: 'none',
            display: hover === null ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center',
            minWidth: 2 * tipHalf, padding: '5px 10px', borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: '0 4px 14px rgba(40, 20, 100, .16)',
            whiteSpace: 'nowrap',
          }}
        >
          {hover !== null && (
            <>
              <span style={{ fontSize: 12, lineHeight: '15px', color: 'var(--ink2)' }}>{clock(hover)}</span>
              <span style={{ fontSize: 15, lineHeight: '19px', fontWeight: 700, color: 'var(--ink)' }}>{mg(hoverMg)} mg</span>
            </>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: 20, marginTop: 4 }} aria-hidden="true">
        <span style={{ position: 'absolute', left: clampLabel(nowX), transform: 'translateX(-50%)', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>Now</span>
        {ticks.map((t) => (
          <span key={t.x} style={{ position: 'absolute', left: t.x, transform: 'translateX(-50%)', fontSize: 12, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>{t.label}</span>
        ))}
      </div>
    </div>
  );
}
