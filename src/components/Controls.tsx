import type { ReactNode } from 'react';
import { MinusIcon, PlusIcon } from './icons';

/** Big −/value/+ control used for bedtime and limit. */
export function Stepper({
  value,
  onDown,
  onUp,
  downLabel,
  upLabel,
  canDown = true,
  canUp = true,
}: {
  value: ReactNode;
  onDown: () => void;
  onUp: () => void;
  downLabel: string;
  upLabel: string;
  canDown?: boolean;
  canUp?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <button className="stepper-btn" onClick={onDown} aria-label={downLabel} disabled={!canDown}>
        <MinusIcon />
      </button>
      <div aria-live="polite" style={{ minWidth: 150, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
        {value}
      </div>
      <button className="stepper-btn" onClick={onUp} aria-label={upLabel} disabled={!canUp}>
        <PlusIcon size={24} />
      </button>
    </div>
  );
}

/** Full-width selectable card with a radio dot, as in the onboarding quiz. */
export function OptionCard({ on, onPick, title, sub }: { on: boolean; onPick: () => void; title: string; sub?: string }) {
  return (
    <button
      className="choice"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%',
        minHeight: sub ? 68 : 60, padding: sub ? '10px 18px' : '8px 18px', borderRadius: 20, textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{title}</span>
        {sub && <span style={{ fontSize: 14, lineHeight: '19px', color: 'var(--ink2)' }}>{sub}</span>}
      </span>
      <span
        aria-hidden="true"
        style={{ flex: 'none', width: 24, height: 24, borderRadius: 12, border: `2px solid ${on ? 'var(--accent)' : 'var(--line)'}`, background: on ? 'var(--accent)' : 'transparent' }}
      />
    </button>
  );
}

export const SENSITIVITY_OPTIONS = [
  { id: 'fast', title: 'Fast', sub: 'I clear it quickly. Half gone in about 3½ hours.' },
  { id: 'average', title: 'Average', sub: 'Half gone in about 5 hours.' },
  { id: 'slow', title: 'Slow', sub: 'It lingers. Half gone in about 7 hours.' },
] as const;

export const GROUP_OPTIONS = [
  { id: 'none', title: 'Neither' },
  { id: 'preg', title: 'Pregnant' },
  { id: 'teen', title: 'Under 18' },
] as const;

export const LIMIT_MIN = 50;
export const LIMIT_MAX = 600;
