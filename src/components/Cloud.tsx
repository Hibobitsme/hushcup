import type { CSSProperties } from 'react';

export type Mood = 'calm' | 'buzzing' | 'sleepy' | 'rough';

export const MOOD_LABEL: Record<Mood, string> = {
  calm: 'Calm',
  buzzing: 'Buzzing',
  sleepy: 'Sleepy',
  rough: 'Rough night',
};

export interface MoodInputs {
  /** Today's total is over the daily limit. */
  overLimit: boolean;
  /** Last night's sleep rating was 2 or lower. */
  poorSleep: boolean;
  /** Today's total is at or above 80% of the limit. */
  nearLimit: boolean;
  /** Current time is past the caffeine cutoff. */
  pastCutoff: boolean;
}

/** Priority: Rough > Buzzing > Sleepy > Calm. */
export function pickMood({ overLimit, poorSleep, nearLimit, pastCutoff }: MoodInputs): Mood {
  if (overLimit || poorSleep) return 'rough';
  if (nearLimit) return 'buzzing';
  if (pastCutoff) return 'sleepy';
  return 'calm';
}

/** The one cloud body shared by every mood and the app icon. */
export const CLOUD_PATH =
  'M32 86 C14 86 6 72 11 59 C15 49 24 45 32 46 C33 30 46 19 62 21 C75 23 83 31 85 41 C99 39 113 48 113 63 C113 76 105 86 92 86 Z';

interface CloudProps {
  mood: Mood;
  /** Rendered width in px; height follows the 124×110 viewBox. */
  size?: number;
  /** Turn off breathe/shake/float, e.g. for small inline uses. */
  still?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Cloud({ mood, size = 170, still = false, className, style }: CloudProps) {
  const breathe = !still && (mood === 'calm' || mood === 'sleepy');
  const shake = !still && mood === 'buzzing';
  const cheekY = mood === 'calm' ? 67 : mood === 'rough' ? 69 : 68;
  const cheekOpacity = mood === 'rough' ? 0.4 : 0.5;

  return (
    <div
      className={[breathe && 'hc-breathe', className].filter(Boolean).join(' ') || undefined}
      style={{ width: size, ...style }}
    >
      <svg
        viewBox="0 0 124 110"
        role="img"
        aria-label={`${MOOD_LABEL[mood]} cloud`}
        className={shake ? 'hc-shake' : undefined}
        style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <path
          d={CLOUD_PATH}
          fill="var(--cloud)"
          stroke="var(--cloud)"
          strokeWidth={8}
          strokeLinejoin="round"
        />
        <ellipse cx={44} cy={38} rx={9} ry={4.5} transform="rotate(-20 44 38)" fill="#fff" opacity={0.35} />
        <circle cx={38} cy={cheekY} r={5} fill="var(--blush)" opacity={cheekOpacity} />
        <circle cx={86} cy={cheekY} r={5} fill="var(--blush)" opacity={cheekOpacity} />
        <Face mood={mood} still={still} />
      </svg>
    </div>
  );
}

function Face({ mood, still }: { mood: Mood; still: boolean }) {
  const face = 'var(--face)';
  switch (mood) {
    case 'calm':
      return (
        <>
          <circle cx={50} cy={58} r={3.8} fill={face} />
          <circle cx={74} cy={58} r={3.8} fill={face} />
          <path d="M55 67 Q62 74 69 67" fill="none" stroke={face} strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case 'buzzing':
      return (
        <>
          <circle cx={50} cy={57} r={5.6} fill={face} />
          <circle cx={74} cy={57} r={5.6} fill={face} />
          <circle cx={51.8} cy={55} r={1.8} fill="#fff" />
          <circle cx={75.8} cy={55} r={1.8} fill="#fff" />
          <ellipse cx={62} cy={70} rx={3.4} ry={4} fill={face} />
          <path
            d="M18 34 L9 27 M14 48 L4 48 M106 34 L115 27 M110 48 L120 48 M62 12 L62 3"
            fill="none"
            stroke="var(--accent)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </>
      );
    case 'sleepy':
      return (
        <>
          <path d="M45 58 H55 A5 5 0 0 1 45 58 Z" fill={face} />
          <path d="M69 58 H79 A5 5 0 0 1 69 58 Z" fill={face} />
          <ellipse cx={62} cy={70} rx={2.4} ry={2.8} fill={face} />
          <g className={still ? undefined : 'hc-float'} fontFamily="Fredoka, sans-serif" fontWeight={600} fill="var(--accent)">
            <text x={92} y={22} fontSize={15}>z</text>
            <text x={103} y={11} fontSize={11}>z</text>
          </g>
        </>
      );
    case 'rough':
      return (
        <>
          <circle cx={50} cy={61} r={3.6} fill={face} />
          <circle cx={74} cy={61} r={3.6} fill={face} />
          <path d="M42 55 L56 51 M68 51 L82 55" fill="none" stroke={face} strokeWidth={3} strokeLinecap="round" />
          <path d="M55 72 Q62 66 69 72" fill="none" stroke={face} strokeWidth={3} strokeLinecap="round" />
          <path d="M62 92 C62 92 55.5 99.5 55.5 104 A6.5 6.5 0 0 0 68.5 104 C68.5 99.5 62 92 62 92 Z" fill="var(--drop)" />
        </>
      );
  }
}
