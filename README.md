# Ali Tours and Travels — website

Website for **Ali Tours and Travels**, a car hire, car rental and outstation taxi
service in Tanwar Nagar, Mumbra, Thane, Maharashtra – 400612.

The site is a WhatsApp-first enquiry service. Visitors describe a journey, and the
details are handed to the business on WhatsApp. Nothing on the site takes a
payment, creates an account, or confirms a booking.

- **WhatsApp / phone:** +91 93242 22911
- **Enquiry link:** <https://wa.me/919324222911>

---

## Requirements

- Node.js 20 or newer (developed on Node 24)
- npm 10 or newer

Optional, only for the helper scripts:

- Python 3 with Playwright, Pillow and Chromium — for the browser checks
- `sharp` is installed as a dev dependency and is used by the image pipeline

## Install and run

```bash
npm install          # install dependencies
npm run dev          # development server on http://localhost:5173
npm run build        # type-check, then build to dist/
npm run preview      # serve the production build locally
```

## All commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run typecheck` | `tsc -b`, no emit |
| `npm test` | Unit tests for validation and the WhatsApp message (`node --test`) |
| `npm run build` | `tsc -b && vite build` into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run seo:files` | Regenerate `robots.txt`, `sitemap.xml`, `_redirects`, `vercel.json`, `404.html`, `_headers` in `public/` |
| `npm run assets:images` | Re-download and re-encode photographs to WebP |
| `npm run assets:fonts` | Re-download the self-hosted fonts |
| `npm run assets:icons` | Regenerate the favicon and app icons |

Helper scripts (not part of `npm run build`):

| Script | What it does |
| --- | --- |
| `bash scripts/dev-preview.sh` | Build, then restart the preview server using a pidfile |
| `python3 scripts/check_site.py [url]` | Focused end-to-end browser check (routes, form, WhatsApp link, mobile layout, legal pages) |
| `python3 scripts/check_attribution.py [url]` | Confirms every photograph carries a visible credit |
| `python3 scripts/browser_audit.py [url]` | Broad audit: overflow, contrast, headings, SEO, structured data, focus, console |

The browser scripts need a running server. Start one first:

```bash
bash scripts/dev-preview.sh          # or: npm run preview
python3 scripts/check_site.py        # defaults to http://localhost:12000
```

## Deployment

The build output in `dist/` is a static site. Any static host works.

### Setting the site URL

Set `VITE_SITE_URL` to the real domain at build time. This does two things:

1. Emits canonical URLs and `og:url` metadata on every page.
2. Generates `public/sitemap.xml` and adds the `Sitemap:` line to `robots.txt`.

```bash
VITE_SITE_URL=https://your-domain.example npm run build
```

If `VITE_SITE_URL` is not set, no canonical tag is emitted and no sitemap is
written. That is deliberate: a sitemap needs absolute URLs, and guessing a domain
would publish wrong ones. **The domain has not been chosen yet, so no sitemap is
currently generated.**

### Host configuration files

`scripts/make-seo-files.mjs` writes these into `public/`, so they ship in `dist/`:

- `_redirects` — SPA fallback for Netlify
- `vercel.json` — SPA rewrite plus long-lived caching for `/assets`, `/images`, `/fonts`
- `404.html` — SPA fallback for GitHub Pages
- `_headers` — security headers (nosniff, frame options, referrer policy) for Netlify-style hosts
- `robots.txt` — always allowed, with the sitemap line added when the URL is known

### Typical deploys

```bash
# Netlify
npm run build && npx netlify deploy --prod --dir=dist

# Vercel
npm run build && npx vercel deploy --prod dist

# Any static host or VPS: upload the contents of dist/
```

HTTPS must be enabled at the host. The site itself makes no server-side requests.

## Project structure

```
src/
  content/
    business.ts        Single source of truth for business facts
    services.ts        The four services, their fields and copy
    faqs.ts            FAQ questions and answers
    site.ts            Navigation and page-level metadata
    imageCredits.ts    Generated photograph credits (author, licence, source)
  lib/
    enquiry.ts         Validation, message building, summary rows
    structuredData.ts  JSON-LD builders (TaxiService, FAQPage, BreadcrumbList)
    siteUrl.ts         Reads VITE_SITE_URL
  components/          Header, Footer, BookingForm, Seo, ResponsiveImage, PhotoCredit, …
  pages/               One file per route
  styles/              global.css and self-hosted font declarations
public/
  images/              10 photographs, 4 WebP widths each
  fonts/               4 variable woff2 files
  robots.txt, favicon, app icons, site.webmanifest, host config files
scripts/               Asset pipelines, SEO file generation, browser checks
tests/                 Unit tests for the enquiry logic
```

Routes: `/`, `/services`, `/booking`, `/about`, `/contact`, `/faq`, `/privacy`,
`/terms`, `/booking-policy`, plus a 404 page.

## How the enquiry flow works

1. The visitor picks a service. The form then shows only the fields that service
   needs — an airport transfer asks for a flight number, an outstation round trip
   asks for a return date.
2. `src/lib/enquiry.ts` validates the input and builds a plain-text summary.
3. Submitting opens WhatsApp with the summary pre-filled, and the same summary is
   shown on the page with a copy button and a tap-to-call fallback.

There is no backend and no database. Customer details go from the browser straight
to WhatsApp; they are never posted to a server, stored, or sent to analytics.

**An enquiry is not a booking.** The site says so on the form, in the summary, in
the policies, and in the WhatsApp message itself. Availability, the vehicle and the
fare are confirmed by the business.

## Content integrity

This website deliberately does **not** show prices, ratings, reviews, customer
testimonials, opening hours, founding dates, fleet counts, or GPS coordinates,
because none of those have been confirmed by the business. Adding any of them
requires the owner's confirmation — see `OWNER-GUIDE.md`.

Photographs are licensed Creative Commons images from Wikimedia Commons, used to
illustrate vehicle types. They are not photographs of the business's own vehicles,
and each one is credited where it appears. The full list is on the terms page.

## Known limitations

- No canonical URLs or sitemap until `VITE_SITE_URL` is set to the real domain.
- The map on the contact page is a **search link** for the address, not a pin,
  because no verified coordinates are available.
- `booking-policy` and the commercial terms on `terms` are marked as awaiting
  business approval. They must be reviewed before they are treated as binding.
- The site is verified locally only. It has not been deployed.
