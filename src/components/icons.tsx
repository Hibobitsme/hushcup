import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
  stroke?: number;
  children: ReactNode;
}

function Icon({ size = 24, stroke = 2.2, children }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const HomeIcon = () => <Icon><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Icon>;
export const MoonIcon = ({ size = 24, stroke = 2.2 }: { size?: number; stroke?: number }) => (
  <Icon size={size} stroke={stroke}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Icon>
);
export const BarsIcon = () => <Icon><path d="M5 20V11M12 20V4M19 20v-6" /></Icon>;
export const PlusIcon = ({ size = 26, stroke = 2.6 }: { size?: number; stroke?: number }) => (
  <Icon size={size} stroke={stroke}><path d="M12 5v14M5 12h14" /></Icon>
);
export const MinusIcon = () => <Icon stroke={2.6}><path d="M6 12h12" /></Icon>;
export const CloseIcon = () => <Icon stroke={2.4}><path d="M6 6l12 12M18 6L6 18" /></Icon>;
export const BackIcon = () => <Icon stroke={2.4}><path d="M15 5l-7 7 7 7" /></Icon>;
export const FlameIcon = () => (
  <Icon size={18}><path d="M12 3c1 3.5 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.2 1-3.6 2.4-4.8.2 2 1 3 2.2 3.3C10.3 8.5 10.4 5.5 12 3z" /></Icon>
);
export const SunIcon = () => (
  <Icon size={18}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></Icon>
);
export const SearchIcon = () => <Icon size={20} stroke={2.4}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>;
export const ClockIcon = () => <Icon size={20}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
export const GearIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Icon>
);
export const TrashIcon = () => <Icon size={18}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Icon>;

/** Inline path data, used where the icon path comes from data. */
export const PathIcon = ({ d, size = 24, stroke = 2 }: { d: string; size?: number; stroke?: number }) => (
  <Icon size={size} stroke={stroke}><path d={d} /></Icon>
);
