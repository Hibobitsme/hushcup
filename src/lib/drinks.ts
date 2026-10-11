// Preset sizes and the brand list for the Log screen.
// The brand mg values are APPROXIMATE samples from the design. Replace them with a
// verified dataset or API before launch.

export interface Preset {
  name: string;
  icon: string;
  sizes: { label: string; detail: string; mg: number }[];
}

export const PRESETS: Preset[] = [
  {
    name: 'Coffee',
    icon: 'M5 9h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z M16 11h1.5a2.5 2.5 0 0 1 0 5H16 M8 3v2 M12 3v2',
    sizes: [{ label: 'Small', detail: '8 oz', mg: 95 }, { label: 'Medium', detail: '12 oz', mg: 140 }, { label: 'Large', detail: '16 oz', mg: 190 }],
  },
  {
    name: 'Energy drink',
    icon: 'M8 3h8l1 3v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6z M7 7h10 M13 11l-3 4h4l-3 4',
    sizes: [{ label: 'Small', detail: '8 oz', mg: 80 }, { label: 'Medium', detail: '12 oz', mg: 120 }, { label: 'Large', detail: '16 oz', mg: 160 }],
  },
  {
    name: 'Tea',
    icon: 'M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M16 12h2a2 2 0 0 1 0 4h-2 M9 4c0 1.5 2 1.5 2 3',
    sizes: [{ label: 'Small', detail: '8 oz', mg: 40 }, { label: 'Medium', detail: '12 oz', mg: 60 }, { label: 'Large', detail: '16 oz', mg: 80 }],
  },
  {
    name: 'Pre-workout',
    icon: 'M6 6h12v3H6z M7 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M10 14h4',
    sizes: [{ label: 'Light', detail: '½ scoop', mg: 100 }, { label: 'Standard', detail: '1 scoop', mg: 200 }, { label: 'Strong', detail: '1½ scoop', mg: 300 }],
  },
];

export interface Brand {
  name: string;
  size: string;
  mg: number;
}

export const BRANDS: Brand[] = [
  { name: 'Monster Energy', size: '16 oz can', mg: 160 },
  { name: 'Celsius', size: '12 oz can', mg: 200 },
  { name: 'Red Bull', size: '8.4 oz can', mg: 80 },
  { name: 'Starbucks Pike Place', size: 'Grande, 16 oz', mg: 310 },
  { name: 'Starbucks Caffè Latte', size: 'Grande, 16 oz', mg: 150 },
  { name: 'Starbucks Cold Brew', size: 'Grande, 16 oz', mg: 205 },
  { name: 'Ghost Energy', size: '16 oz can', mg: 200 },
  { name: 'Bang Energy', size: '16 oz can', mg: 300 },
  { name: 'Coca-Cola', size: '12 oz can', mg: 34 },
  { name: 'Mountain Dew', size: '12 oz can', mg: 54 },
];

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function searchBrands(q: string): Brand[] {
  const words = fold(q).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return BRANDS.filter((b) => words.every((w) => fold(b.name).includes(w)));
}
