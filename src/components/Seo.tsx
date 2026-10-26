import { useEffect } from 'react';
import { business } from '../content/business';
import { siteUrl } from '../lib/siteUrl';

interface SeoProps {
  title: string;
  description: string;
  /** Route path, used to build the canonical URL when a site URL is configured. */
  path: string;
  image?: string;
  /** Set on pages that must not appear in search results. */
  noindex?: boolean;
  /** JSON-LD structured data for this page. */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const OG_IMAGE_DEFAULT = '/images/hero-fortuner-1280.webp';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Titles longer than this are truncated in search results, so aim below it. */
const MAX_TITLE = 60;

/**
 * Builds the document title.
 *
 * The brand name is appended only when the result still fits within a typical
 * search result snippet. A page whose own title is already descriptive keeps it
 * unadorned rather than being truncated to make room for the brand.
 */
function buildTitle(title: string): string {
  if (title.includes(business.name)) return title;
  const withBrand = `${title} | ${business.name}`;
  return withBrand.length <= MAX_TITLE ? withBrand : title;
}

/**
 * Per-page document head management.
 *
 * This is a client-rendered site, so metadata is applied on mount. Every tag
 * written here is also present in index.html as a sensible default, which is
 * what crawlers that do not execute JavaScript will read.
 */
export function Seo({
  title,
  description,
  path,
  image = OG_IMAGE_DEFAULT,
  noindex = false,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = buildTitle(title);
    document.title = fullTitle;

    setMeta('name', 'description', description);

    const canonical = siteUrl ? `${siteUrl}${path === '/' ? '/' : path}` : null;
    if (canonical) {
      setLink('canonical', canonical);
    }

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', business.name);
    setMeta('property', 'og:locale', 'en_IN');
    setMeta('property', 'og:image', siteUrl ? `${siteUrl}${image}` : image);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', siteUrl ? `${siteUrl}${image}` : image);

    if (canonical) {
      setMeta('property', 'og:url', canonical);
    } else {
      removeMeta('property', 'og:url');
    }

    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      removeMeta('name', 'robots');
    }

    const scriptId = 'page-structured-data';
    document.getElementById(scriptId)?.remove();
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, path, image, noindex, structuredData]);

  return null;
}
