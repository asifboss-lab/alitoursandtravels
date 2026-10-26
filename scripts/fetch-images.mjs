/**
 * Downloads the site photography from Wikimedia Commons and converts it to
 * responsive WebP variants.
 *
 * Commons is used because every file carries a verifiable licence and a
 * description of its actual subject, so the images we ship can be attributed
 * honestly and genuinely match the text they sit next to. No photograph here is
 * presented as the business's own fleet.
 *
 * Resumable: already-converted images are skipped, so a run interrupted by
 * Commons rate limiting can simply be started again.
 *
 * Run with: node scripts/fetch-images.mjs
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'AliToursAndTravelsWebsite/1.0 (static site asset pipeline)';
const OUT_DIR = path.resolve('public/images');
const META_JSON = path.resolve('src/content/imageCredits.json');
const META_TS = path.resolve('src/content/imageCredits.ts');
const WIDTHS = [480, 800, 1280, 1920];

const FILES = [
  { key: 'hero-fortuner', file: 'File:2021 Toyota Fortuner SRZ 2.7 4x2 (Indonesia) front view 01.jpg', alt: 'A white Toyota Fortuner SUV, an example of the vehicle class used for outstation journeys' },
  { key: 'vehicle-suv', file: 'File:2021 Toyota Fortuner SRZ 2.7 4x2 (Indonesia) front view 02.jpg', alt: 'A Toyota Fortuner SUV photographed from the front' },
  { key: 'vehicle-innova', file: 'File:Toyota Innova Crysta 2.4 Z front right.jpg', alt: 'A Toyota Innova Crysta MPV, an example of a family and group travel vehicle' },
  { key: 'vehicle-sedan', file: 'File:Honda City GN2 1.5 V Platinum White Pearl - front.jpg', alt: 'A white Honda City sedan' },
  { key: 'vehicle-mpv', file: 'File:Maruti Suzuki Ertiga(1).jpg', alt: 'A Maruti Suzuki Ertiga MPV' },
  { key: 'vehicle-taxi', file: 'File:AC Taxi (25 February 2024).jpg', alt: 'An air-conditioned sedan taxi on an Indian road' },
  { key: 'airport-terminal', file: 'File:Interior of Chhatrapati Shivaji Maharaj International Airport in Mumbai 02.jpg', alt: 'Interior of Chhatrapati Shivaji Maharaj International Airport, Mumbai' },
  { key: 'expressway', file: 'File:Mumbai-Pune Expressway 1.JPG', alt: 'The Mumbai-Pune Expressway, a route commonly used for outstation travel' },
  { key: 'night-road', file: 'File:DSCF1058 Nighttime long-exposure captures streaking headlights as cars speed through an empty urban interchange beneath glowing streetlights.jpg', alt: 'Headlights streaking along an illuminated road at night' },
  { key: 'mumbai-night', file: 'File:A night in Mumbai.jpg', alt: 'Mumbai city skyline at night' },
  { key: 'sea-link', file: 'File:Bandra-Worli Sea Link night.jpg', alt: 'The Bandra-Worli Sea Link in Mumbai at night' },
  { key: 'thane', file: 'File:Thane station (2).jpg', alt: 'Thane railway station in Maharashtra' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params, attempt = 1) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ ...params, format: 'json' })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 6) throw new Error(`API HTTP ${res.status} after ${attempt} attempts`);
    await sleep(4000 * attempt);
    return api(params, attempt + 1);
  }
  if (!res.ok) throw new Error(`API HTTP ${res.status}`);
  return res.json();
}

/** Commons throttles bursts, so back off and retry rather than losing the run. */
async function fetchBuffer(url, attempt = 1) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 6) throw new Error(`HTTP ${res.status} after ${attempt} attempts`);
    await sleep(4000 * attempt);
    return fetchBuffer(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function metadata(title) {
  const data = await api({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '2400',
  });
  const page = Object.values(data?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`No imageinfo for ${title}`);
  const em = info.extmetadata ?? {};
  const strip = (v) => (v ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return {
    downloadUrl: info.thumburl ?? info.url,
    source: info.descriptionurl,
    artist: strip(em.Artist?.value) || 'Unknown author',
    licence: strip(em.LicenseShortName?.value) || 'See source page',
    licenceUrl: strip(em.LicenseUrl?.value),
  };
}

async function loadCache() {
  const byKey = {};
  try {
    const raw = JSON.parse(await readFile(META_JSON, 'utf8'));
    for (const c of raw) byKey[c.key] = c;
  } catch {
    // No cache yet - a full run will build it.
  }
  // Treat already-converted images as done too, so a run interrupted between
  // "images written" and "cache written" does not repeat the download.
  try {
    for (const name of await readdir(OUT_DIR)) {
      const m = name.match(/^(.+)-(\d+)\.webp$/);
      if (!m) continue;
      const [, key, width] = m;
      byKey[key] ??= { key, pending: true };
      if (byKey[key].pending) (byKey[key].widths ??= []).push(Number(width));
    }
  } catch {
    // Output directory does not exist yet.
  }
  for (const c of Object.values(byKey)) {
    if (c.pending) {
      c.widths = [...new Set(c.widths)].sort((a, b) => a - b);
    }
  }
  return byKey;
}

/** Fills in attribution for an image whose bytes are already on disk. */
async function hydrateCredit(item, cache) {
  const meta = await metadata(item.file);
  const widths = (cache[item.key].widths ?? []).sort((a, b) => a - b);
  return {
    key: item.key,
    alt: item.alt,
    naturalWidth: Math.max(...widths),
    widths,
    artist: meta.artist,
    licence: meta.licence,
    licenceUrl: meta.licenceUrl,
    source: meta.source,
    title: item.file.replace(/^File:/, ''),
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(META_JSON), { recursive: true });
  const cache = await loadCache();
  const credits = [];

  for (const item of FILES) {
    const cached = cache[item.key];

    if (cached && !cached.pending) {
      credits.push(cached);
      console.log(`${item.key} ... cached`);
      continue;
    }

    if (cached?.pending) {
      process.stdout.write(`${item.key} ... metadata only (images present) `);
      credits.push(await hydrateCredit(item, cache));
      console.log('ok');
      await writeFile(META_JSON, JSON.stringify(credits, null, 2) + '\n', 'utf8');
      await sleep(1200);
      continue;
    }

    process.stdout.write(`${item.key} ... `);
    const meta = await metadata(item.file);
    await sleep(1500);
    const buffer = await fetchBuffer(meta.downloadUrl);
    const { width: naturalWidth } = await sharp(buffer).metadata();

    const widths = WIDTHS.filter((w) => w <= naturalWidth);
    if (!widths.length) widths.push(naturalWidth);

    for (const w of widths) {
      await sharp(buffer)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 76, effort: 5 })
        .toFile(path.join(OUT_DIR, `${item.key}-${w}.webp`));
    }

    credits.push({
      key: item.key,
      alt: item.alt,
      naturalWidth,
      widths,
      artist: meta.artist,
      licence: meta.licence,
      licenceUrl: meta.licenceUrl,
      source: meta.source,
      title: item.file.replace(/^File:/, ''),
    });
    console.log(`ok (${naturalWidth}px -> ${widths.join(', ')}px)`);
    // Persist after every image so an interrupted run never repeats finished work.
    await writeFile(META_JSON, JSON.stringify(credits, null, 2) + '\n', 'utf8');
    await sleep(6000);
  }

  await writeFile(META_JSON, JSON.stringify(credits, null, 2) + '\n', 'utf8');
  await writeFile(
    META_TS,
    `// Generated by scripts/fetch-images.mjs - do not edit by hand.\n` +
      `export interface ImageCredit {\n` +
      `  key: string;\n  alt: string;\n  naturalWidth: number;\n  widths: number[];\n` +
      `  artist: string;\n  licence: string;\n  licenceUrl: string;\n  source: string;\n  title: string;\n}\n\n` +
      `export const imageCredits: ImageCredit[] = ${JSON.stringify(credits, null, 2)};\n\n` +
      `export const imageCreditByKey: Record<string, ImageCredit> = Object.fromEntries(\n` +
      `  imageCredits.map((c) => [c.key, c]),\n);\n`,
    'utf8',
  );
  console.log(`\nWrote ${credits.length} credits to ${META_TS}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
