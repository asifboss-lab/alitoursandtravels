/**
 * Deployment URL configuration.
 *
 * Canonical URLs, the sitemap and Open Graph URLs all need to know the real
 * domain, but the domain is not known at build time until the site is hosted.
 * Set VITE_SITE_URL at build time (see .env.example) and those tags are emitted;
 * leave it unset and the site simply omits them rather than publishing a
 * canonical URL that points at the wrong host.
 */

const raw = (import.meta.env.VITE_SITE_URL ?? '').trim();

function normalise(value: string): string {
  if (!value) return '';
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/+$/, '');
}

/** Empty string when no site URL has been configured. */
export const siteUrl = normalise(raw);

export const hasSiteUrl = siteUrl.length > 0;

/** Absolute URL for a path, falling back to the relative path when unset. */
export function absoluteUrl(path: string): string {
  return siteUrl ? `${siteUrl}${path}` : path;
}
