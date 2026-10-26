# Handover — Ali Tours and Travels website

Status: **complete and verified locally. Not deployed.**

Everything below was run against this workspace on 2026-10-22. Results are actual
exit codes and counts, not estimates.

---

## 1. Verified results

| Check | Command | Result |
| --- | --- | --- |
| Type-check | `npm run typecheck` | exit 0 |
| Unit tests | `npm test` | exit 0 — 20 passed, 0 failed |
| Production build | `npm run build` | exit 0 — 66 modules, ~940 ms |
| Focused browser test | `python3 scripts/check_site.py` | exit 0 — 51 passed, 0 failed |
| Photograph attribution | `python3 scripts/check_attribution.py` | exit 0 — 14 passed, 0 failed |
| Broad browser audit | `python3 scripts/browser_audit.py` | exit 0 — 188 passed, 0 failed, 1 note |

Build output: `dist/` ≈ 3.3 MB, `index.js` 97 kB, `router.js` 164 kB, `index.css` 28 kB.

The single audit note is that `Tab` on `/contact` moves focus into the embedded map
iframe, whose internal focus ring belongs to the map provider and cannot be styled
from this site. The surrounding link is reachable and has a visible focus ring.

### What the browser tests actually exercise

Run in real Chromium (Playwright), not simulated:

- All nine routes render, each with exactly one `h1`, and no console errors
- Every WhatsApp link on the site targets `wa.me/919324222911`
- The enquiry form: selecting a service re-renders the right fields; an empty
  submission shows 8 field errors; an invalid mobile number is rejected; the
  airport form swaps destination for flight number; an outstation one-way hides the
  return date and round trip reveals it
- A valid submission produces a `wa.me` link whose message carries every detail
- The message contains no price and no fabricated booking reference
- No price, rating, or review count appears on any principal page
- No horizontal scrolling at 360, 412, 768, 1280 and 1920 px
- Legal pages present; the booking policy is visibly marked as awaiting approval
- Header navigation reaches `/services`, `/booking` and `/contact`
- Every photograph has a visible credit naming its author and licence
- The hero credit does not overlap the buttons at 360, 412 and 1280 px

## 2. Project structure

```
src/content/business.ts     Single source of truth for business facts
src/content/services.ts     Four services: fields, copy, image keys
src/content/faqs.ts         FAQ content
src/content/imageCredits.ts Generated credits (author, licence, source)
src/lib/enquiry.ts          Validation, WhatsApp message, summary rows
src/lib/structuredData.ts   JSON-LD: TaxiService, FAQPage, BreadcrumbList
src/components/             Header, Footer, BookingForm, Seo, ResponsiveImage, PhotoCredit…
src/pages/                  One file per route (9 routes + 404)
src/styles/                 global.css, self-hosted font declarations
public/images/              10 photographs × 4 WebP widths
public/fonts/               4 variable woff2 files
scripts/                    Asset pipelines, SEO file generation, browser checks
tests/enquiry.test.mjs      20 unit tests
```

## 3. Commands

```bash
npm install
npm run dev                 # development, http://localhost:5173
npm run typecheck
npm test
npm run build
npm run preview

# Local verification helpers
bash scripts/dev-preview.sh                    # build + restart preview (pidfile)
python3 scripts/check_site.py                  # focused end-to-end check
python3 scripts/check_attribution.py           # photograph credits
python3 scripts/browser_audit.py               # broad audit
```

To publish the site with correct canonical URLs and a sitemap:

```bash
VITE_SITE_URL=https://your-domain.example npm run build
```

## 4. Deployment status

- **Not deployed.** No hosting credentials, domain, or server access were provided.
- No Git remote is configured (`git remote` returns nothing).
- HTTPS, live WhatsApp link testing, and production serving are therefore unverified.
- `dist/` is a static bundle and can be uploaded to any static host. See README.md.

## 5. Git status

- Branch: `master`
- **Commits: 0.** The repository has never been committed to.
- All work is present in the working tree as untracked files.
- No commit was made, and nothing was pushed, per instructions.
- `.gitignore` covers `node_modules`, `dist`, `.env*`, logs, `*.tsbuildinfo`, and the
  local preview artefacts (`.preview.pid`, `.preview.log`, `.preview.build.log`).

To make the first commit when authorised:

```bash
git add -A
git commit -m "Add Ali Tours and Travels website"
```

## 6. Remaining limitations

These are deliberate, not defects:

1. **No sitemap and no canonical URLs** until `VITE_SITE_URL` is set to the real
   domain. A sitemap needs absolute URLs; inventing a domain would publish wrong
   ones. This is why no domain was guessed.
2. **No map pin.** The contact page links to a Google Maps search for the address
   because the office coordinates were never confirmed.
3. **Two policy pages need the owner's decision.** `/booking-policy` is a
   placeholder, and the commercial terms on `/terms` are marked as awaiting
   approval. Both carry a visible notice that must stay until the terms are agreed.
4. **`/terms` and the booking policy are not legal advice.** They should be reviewed
   by the business before being treated as binding.
5. **Browser checks cover the routes and flows listed above**, not every conceivable
   state. The tests were written against the built site, not the dev server.
6. **No backend, by design.** There is no database and no server-side enquiry
   storage. Details pass from the browser to WhatsApp only.

## 7. Content integrity

Nothing on the site is invented. Prices, fares, ratings, reviews, testimonials,
opening hours, founding dates, fleet size, staff credentials and GPS coordinates are
all deliberately absent because the business has not confirmed them.

Photographs are Creative Commons images from Wikimedia Commons illustrating vehicle
*types*, not the business's own fleet. Each is credited where it appears, and the
complete list is on the terms page. One data defect was found and fixed during
handover: the `vehicle-taxi` credit had raw wikitext in its author field
(`This photograph is created by Sbb1413. All photographs created by him are
released under the {{CC-BY 4.0}} license…`); the author name is now extracted
correctly, and `scripts/fetch-images.mjs` was fixed so it will not recur.

## 8. Points to confirm before going live

- [ ] The real domain, set as `VITE_SITE_URL`
- [ ] The WhatsApp number `+91 93242 22911` is correct and receives messages
- [ ] Whether voice calling is enabled on that number (the site offers a call button)
- [ ] Cancellation, refund and waiting-charge rules for `/booking-policy`
- [ ] Approval of the commercial terms on `/terms`
- [ ] Whether to replace the illustrative photographs with the business's own
- [ ] Whether self-drive rental is offered, and on what terms

## 9. Source code and hosting

Source: <https://github.com/asifboss-lab/alitoursandtravels> (branch `main`).

The production build is made with the client domain so that canonical URLs and the
sitemap are correct:

```bash
VITE_SITE_URL=https://alitoursandtravels.in npm run build
```

`npm run build` also runs `scripts/make-seo-files.mjs`, which rewrites
`public/robots.txt` and `public/sitemap.xml`. Those two files are therefore
generated, not hand-written, and a build without `VITE_SITE_URL` will strip the
`Sitemap:` line again. Always rebuild with the variable set before deploying, and
do not run `scripts/dev-preview.sh` afterwards — it rebuilds without the variable
and would overwrite the deployable `dist/`.

### Hosting notes for `asifboss.0hi.me`

- Transfer over **explicit FTPS** using the hostname **`ftpupload.net`**. The
  hostname `ftp.0hi.me` points at the same server (185.27.134.11) but presents a
  certificate issued for `ftpupload.net`, so certificate validation fails against
  `ftp.0hi.me`. Do not disable certificate checking to work around this.
- Upload the **contents** of `dist/`, not the `dist/` directory itself.
- The host runs OpenResty behind a JavaScript challenge, and the existing account
  serves a "FranzLab" default page rather than an Apache `public_html` tree. The
  Netlify/Vercel files in `dist/` (`_redirects`, `vercel.json`, `_headers`) are
  inert here; the client-side routes need the hosting provider's own SPA fallback,
  which must be confirmed from the control panel before relying on it.
- Verify the document root in the control panel. Do not assume it is `htdocs`.
