/**
 * Generates the site icons from the same geometry as the inline logo mark.
 *
 * Keeping one source of truth for the emblem means the favicon, the app icon and
 * the header logo cannot drift apart. Outputs an SVG favicon plus PNG icons and
 * an ICO for older browsers and Android home screens.
 *
 * Run with: node scripts/make-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = path.resolve('public');

const GOLD_LIGHT = '#f2dca0';
const GOLD_MID = '#e6c878';
const GOLD_DARK = '#b48a30';
const NAVY = '#05080f';
const ROAD = '#cbd6ea';

/** The emblem, drawn on a 48x48 grid to match src/components/Logo.tsx. */
function emblemSvg({ rounded = false, size = 48 } = {}) {
  const bg = rounded
    ? `<rect x="0" y="0" width="48" height="48" rx="11" fill="${NAVY}"/>`
    : `<rect x="0" y="0" width="48" height="48" fill="${NAVY}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${GOLD_LIGHT}"/>
      <stop offset="55%" stop-color="${GOLD_MID}"/>
      <stop offset="100%" stop-color="${GOLD_DARK}"/>
    </linearGradient>
    <linearGradient id="road" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${ROAD}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${ROAD}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  ${bg}
  <circle cx="24" cy="24" r="19.5" fill="none" stroke="url(#gold)" stroke-width="1.6"/>
  <path d="M11.5 17.5c7.4 2.1 17.6 2.1 25 0" fill="none" stroke="url(#gold)" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
  <path d="M13.5 39.5C15.4 30.6 19 22.6 23.2 15.6" fill="none" stroke="url(#road)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M34.5 39.5C32.6 30.6 29 22.6 24.8 15.6" fill="none" stroke="url(#road)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M24 39.5V15.6" fill="none" stroke="url(#gold)" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="3.2 3.4"/>
  <circle cx="24" cy="14.4" r="2.6" fill="url(#gold)"/>
</svg>`;
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  // Scalable favicon: crisp at every size and readable in dark browser chrome.
  await writeFile(path.join(PUBLIC, 'favicon.svg'), emblemSvg(), 'utf8');

  // Raster fallbacks.
  const square = Buffer.from(emblemSvg({ rounded: false, size: 512 }));
  await sharp(square).resize(32, 32).png().toFile(path.join(PUBLIC, 'favicon-32.png'));
  await sharp(square).resize(180, 180).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
  await sharp(square).resize(192, 192).png().toFile(path.join(PUBLIC, 'icon-192.png'));
  await sharp(square).resize(512, 512).png().toFile(path.join(PUBLIC, 'icon-512.png'));

  // ICO: browsers that still request /favicon.ico get the mark rather than a 404.
  await sharp(square).resize(32, 32).png().toFile(path.join(PUBLIC, 'favicon.ico'));

  // Maskable icon for Android home screens needs safe padding around the mark.
  const maskable = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="${NAVY}"/>
      <g transform="translate(102,102) scale(6.42)">${emblemSvg()
        .replace(/^<svg[^>]*>/, '')
        .replace(/<\/svg>$/, '')
        .replace(/<rect x="0" y="0" width="48" height="48" fill="#05080f"\/>/, '')}</g>
    </svg>`,
  );
  await sharp(maskable).resize(512, 512).png().toFile(path.join(PUBLIC, 'icon-maskable.png'));

  console.log('Icons written to public/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
