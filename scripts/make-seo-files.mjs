/**
 * Generates the deployment and SEO files that cannot be hand-written because
 * they depend on the host and the domain:
 *
 *   public/sitemap.xml          - only when VITE_SITE_URL is set (a sitemap
 *                                 requires absolute URLs)
 *   public/robots.txt           - updated with the Sitemap line
 *   public/_redirects           - Netlify SPA fallback
 *   public/vercel.json          - Vercel SPA rewrite + asset caching
 *   public/404.html             - GitHub Pages SPA redirect
 *   public/_headers             - security headers for Netlify-style hosts
 *
 * Run automatically by `npm run build`; can also be run on its own with
 * `node scripts/make-seo-files.mjs`.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PUBLIC = path.resolve('public');

/** Routes that should appear in the sitemap, with their relative priority. */
const ROUTES = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/services', changefreq: 'monthly', priority: '0.9' },
  { path: '/booking', changefreq: 'monthly', priority: '0.9' },
  { path: '/contact', changefreq: 'yearly', priority: '0.7' },
  { path: '/about', changefreq: 'yearly', priority: '0.6' },
  { path: '/faq', changefreq: 'yearly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/booking-policy', changefreq: 'yearly', priority: '0.3' },
];

/** Deliberately excluded: /404 and any noindex route. */

function normaliseSiteUrl(raw) {
  const value = (raw ?? '').trim();
  if (!value) return '';
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/+$/, '');
}

const siteUrl = normaliseSiteUrl(process.env.VITE_SITE_URL);

const today = new Date().toISOString().slice(0, 10);

async function writeSitemap() {
  if (!siteUrl) {
    console.log('VITE_SITE_URL is not set - skipping sitemap.xml (a sitemap needs absolute URLs).');
    return false;
  }

  const urls = ROUTES.map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  await writeFile(path.join(PUBLIC, 'sitemap.xml'), xml, 'utf8');
  console.log(`Wrote sitemap.xml with ${ROUTES.length} URLs for ${siteUrl}`);
  return true;
}

async function updateRobots(hasSitemap) {
  const file = path.join(PUBLIC, 'robots.txt');
  let contents = await readFile(file, 'utf8');

  // Remove any previously appended Sitemap line so re-runs stay idempotent.
  contents = contents.replace(/\nSitemap:.*\n?/g, '\n');

  if (hasSitemap) {
    contents = contents.trimEnd() + `\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
    console.log('Added the Sitemap line to robots.txt');
  }

  await writeFile(file, contents, 'utf8');
}

/** Netlify: send every unknown path to index.html so client routes resolve. */
async function writeRedirects() {
  await writeFile(
    path.join(PUBLIC, '_redirects'),
    `# Client-side routing: serve the app shell for any path that is not a real file.
/*  /index.html  200
`,
    'utf8',
  );
}

async function writeVercelConfig() {
  const config = {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    rewrites: [{ source: '/((?!images/|fonts/|assets/).*)', destination: '/index.html' }],
    headers: [
      {
        source: '/assets/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(images|fonts)/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ],
  };
  await writeFile(
    path.join(PUBLIC, 'vercel.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf8',
  );
}

/** Security headers for hosts that read a _headers file (Netlify, Cloudflare Pages). */
async function writeHeaders() {
  await writeFile(
    path.join(PUBLIC, '_headers'),
    `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`,
    'utf8',
  );
}

/**
 * GitHub Pages cannot rewrite unknown paths, so the standard single-page-app
 * shim is used: the host serves 404.html, which forwards to the real route.
 *
 * Note: this assumes the site is served from the domain root. If it is hosted
 * under a subpath such as /ali-tours/, set BASE_PATH in the build so the router
 * and this shim agree on where the app starts.
 */
async function writeGithubPagesShim() {
  await writeFile(
    path.join(PUBLIC, '404.html'),
    `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <script>
      // GitHub Pages serves this file for any path that is not a real file.
      // Rebuild the requested URL and replace the history entry so the router
      // sees the intended route. location.origin is used so the redirect cannot
      // be pointed at another host.
      (function () {
        var base = ${JSON.stringify(process.env.VITE_BASE_PATH ?? '/')};
        var path = window.location.pathname || '/';
        if (base !== '/' && path.indexOf(base) === 0) {
          path = path.slice(base.length - 1);
        }
        window.location.replace(
          window.location.origin + base.replace(/\\/$/, '') + path + window.location.search + window.location.hash,
        );
      })();
    </script>
    <noscript>
      <meta http-equiv="refresh" content="0; url=/" />
    </noscript>
  </head>
  <body>
    <p>Redirecting to <a href="/">Ali Tours and Travels</a>…</p>
  </body>
</html>
`,
    'utf8',
  );
}

async function main() {
  const hasSitemap = await writeSitemap();
  await updateRobots(hasSitemap);
  await writeRedirects();
  await writeVercelConfig();
  await writeHeaders();
  await writeGithubPagesShim();
  console.log('Deployment files written to public/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
