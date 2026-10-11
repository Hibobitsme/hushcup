// Renders the app icon (cloud peeking over a cup, from Brand.dc.html) to PNGs.
// Run with: node scripts/make-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';

const CLOUD = 'M32 86 C14 86 6 72 11 59 C15 49 24 45 32 46 C33 30 46 19 62 21 C75 23 83 31 85 41 C99 39 113 48 113 63 C113 76 105 86 92 86 Z';

function art({ bg, cloud, face, cup, rim }) {
  return `
    <g transform="translate(30.4 29.2) scale(.8)">
      <path d="${CLOUD}" fill="${cloud}" stroke="${cloud}" stroke-width="8" stroke-linejoin="round"/>
      <circle cx="38" cy="67" r="5" fill="#FF9EC4" opacity=".55"/><circle cx="86" cy="67" r="5" fill="#FF9EC4" opacity=".55"/>
      <circle cx="50" cy="58" r="4.4" fill="${face}"/><circle cx="74" cy="58" r="4.4" fill="${face}"/>
      <path d="M55 67 Q62 74 69 67" fill="none" stroke="${face}" stroke-width="3.4" stroke-linecap="round"/>
    </g>
    <path d="M40 100 H120 V112 C120 134 104 146 80 146 C56 146 40 134 40 112 Z" fill="${cup}"/>
    <path d="M120 108 C139 108 140 130 117 131" fill="none" stroke="${cup}" stroke-width="8" stroke-linecap="round"/>
    <rect x="32" y="90" width="96" height="13" rx="6.5" fill="${rim}"/>`;
}

const LIGHT = { bg: '#6D4AE8', cloud: '#D5CAFF', face: '#2A1F4D', cup: '#FFFFFF', rim: '#F1ECFF' };

/** rounded: favicon look. full: square, iOS/Android mask it. safe: shrink art into the maskable safe zone. */
function svg({ rounded = false, safe = false } = {}) {
  const inner = safe ? `<g transform="translate(16 16) scale(.8)">${art(LIGHT)}</g>` : art(LIGHT);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <rect width="160" height="160" ${rounded ? 'rx="36"' : ''} fill="${LIGHT.bg}"/>${inner}</svg>`;
}

function png(svgText, size, file) {
  const r = new Resvg(svgText, { fitTo: { mode: 'width', value: size } });
  writeFileSync(file, r.render().asPng());
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon.svg', svg({ rounded: true }));
png(svg({ rounded: true }), 32, 'public/icons/favicon-32.png');
png(svg(), 180, 'public/icons/apple-touch-icon.png');
png(svg(), 192, 'public/icons/icon-192.png');
png(svg(), 512, 'public/icons/icon-512.png');
png(svg({ safe: true }), 512, 'public/icons/maskable-512.png');
console.log('icons written');
