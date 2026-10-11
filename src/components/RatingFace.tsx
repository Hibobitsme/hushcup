import { CLOUD_PATH } from './Cloud';

/** Small cloud faces for the 1–5 sleep scale (Check-in). */
export const RATINGS = [
  { n: 1, label: 'Rough' },
  { n: 2, label: 'Meh' },
  { n: 3, label: 'Okay' },
  { n: 4, label: 'Good' },
  { n: 5, label: 'Great' },
] as const;

export function RatingFace({ n }: { n: number }) {
  const face = 'var(--face)';
  const sw = 3.6;
  return (
    <svg viewBox="0 0 124 112" style={{ display: 'block', width: 46, height: 'auto' }} aria-hidden="true">
      <path d={CLOUD_PATH} fill="var(--cloud)" stroke="var(--cloud)" strokeWidth={8} strokeLinejoin="round" />
      {n === 1 && (
        <>
          <circle cx={50} cy={61} r={4.4} fill={face} />
          <circle cx={74} cy={61} r={4.4} fill={face} />
          <path d="M42 54 L56 50 M68 50 L82 54" fill="none" stroke={face} strokeWidth={sw} strokeLinecap="round" />
          <path d="M55 73 Q62 66 69 73" fill="none" stroke={face} strokeWidth={sw} strokeLinecap="round" />
          <path d="M62 92 C62 92 55.5 99.5 55.5 104 A6.5 6.5 0 0 0 68.5 104 C68.5 99.5 62 92 62 92 Z" fill="var(--drop)" />
        </>
      )}
      {n === 2 && (
        <>
          <path d="M44 60 H56 A6 6 0 0 1 44 60 Z" fill={face} />
          <path d="M68 60 H80 A6 6 0 0 1 68 60 Z" fill={face} />
          <path d="M55 73 Q62 68 69 73" fill="none" stroke={face} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
      {n === 3 && (
        <>
          <circle cx={50} cy={58} r={4.4} fill={face} />
          <circle cx={74} cy={58} r={4.4} fill={face} />
          <path d="M54 70 H70" fill="none" stroke={face} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
      {n === 4 && (
        <>
          <circle cx={50} cy={58} r={4.4} fill={face} />
          <circle cx={74} cy={58} r={4.4} fill={face} />
          <path d="M54 67 Q62 76 70 67" fill="none" stroke={face} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
      {n === 5 && (
        <>
          <path d="M43 60 Q50 51 57 60 M67 60 Q74 51 81 60" fill="none" stroke={face} strokeWidth={sw} strokeLinecap="round" />
          <path d="M52 66 Q62 82 72 66 Z" fill={face} stroke={face} strokeWidth={3} strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}
