# Owner guide — Ali Tours and Travels website

This guide is for the business owner or whoever maintains the website. It explains
how to change the phone number, the address, the services, the photographs and the
policies. No coding experience is needed for most of it.

Every change follows the same three steps:

1. Edit the file.
2. Run `npm run build`.
3. Upload the new `dist/` folder to your host.

---

## 1. Change the WhatsApp or phone number

Everything about the number lives in one file: **`src/content/business.ts`**.

```ts
whatsappDigits: '919324222911',   // digits only, country code first, no + or spaces
phoneDisplay: '+91 93242 22911',  // how the number is shown to visitors
```

Change both, then rebuild. `whatsappDigits` builds every WhatsApp link on the site,
and `phoneDisplay` is the text visitors read.

Rules for `whatsappDigits`:

- Digits only. No `+`, spaces, or dashes.
- Start with the country code. For India that is `91`.
- Drop the leading `0` from the local number.

So `+91 93242 22911` becomes `919324222911`.

The tap-to-call button and all `wa.me` links are generated from this value, so you
only have to change it in one place.

## 2. Change the address or service areas

Still in **`src/content/business.ts`**:

```ts
address: {
  street: 'Tanwar Nagar',
  locality: 'Mumbra',
  city: 'Thane',
  region: 'Maharashtra',
  postalCode: '400612',
  country: 'India',
  full: 'Tanwar Nagar, Mumbra, Thane, Maharashtra – 400612, India',
},
serviceAreas: {
  primary: ['Mumbra', 'Thane'],
  additional: ['Mumbai', 'Navi Mumbai'],
},
```

`full` is the version used in prose, the footer and search-engine data, so keep it
consistent with the fields above it.

### Adding a real map pin

The contact page links to a Google Maps **search** for the address rather than
dropping a pin, because the exact coordinates were never confirmed. If you confirm
the coordinates, replace `mapSearchUrl` with a link to the exact location.

## 3. Change the services

**`src/content/services.ts`** holds the four services: local car hire, outstation
taxi, airport transfers, and car rental with a chauffeur. Each entry has a title,
a description, bullet points, and which form fields it needs.

To reword a service, edit its text. To add a service, copy an existing entry, give
it a new unique `slug`, and set `imageKey` to one of the photographs listed in
section 4.

The `slug` becomes the web address, for example `/services#outstation-taxi`. Keep
it short and lower case, and do not change an existing slug after the site has been
published, or old links will break.

## 4. Change the photographs

Photographs live in `public/images/`, four widths each (480, 800, 1280, 1920), all
WebP. The available set is listed in `src/content/imageCredits.json`.

To swap a photograph:

1. Put your new image in `public/images/` as `your-name-480.webp`,
   `your-name-800.webp`, `your-name-1280.webp` and `your-name-1920.webp`.
2. Add an entry to `src/content/imageCredits.json` with the key `your-name`.
3. Point the relevant `imageKey` in `src/content/services.ts` at `your-name`.
4. Update `src/content/imageCredits.ts` to match, or run
   `npm run assets:images` to regenerate it.

**Important — licences.** The current photographs are Creative Commons images from
Wikimedia Commons. Their licences require the photographer and licence to be shown
wherever the image appears, so every image is credited automatically. If you add
your own photographs, you may remove the credit for those images, but keep the
credits for any Creative Commons image you keep.

The site states that photographs illustrate vehicle *types* and are not photographs
of the business's own fleet. If you replace them with photographs of your own
vehicles, tell your developer so that wording can be updated.

### Adding your own photographs

Any reasonably sharp photograph works. Landscape orientation suits the layout best.
Around 1600–2000 pixels wide is plenty; larger files only slow the site down.

## 5. Change the frequently asked questions

**`src/content/faqs.ts`** holds the questions and answers. Keep the answers factual.
Do not promise fixed prices, guaranteed availability, or flight monitoring unless
the business genuinely provides them.

## 6. Review the policies before they go live

Three legal pages exist and **two need the owner's decision**:

| Page | Status |
| --- | --- |
| `/privacy` | Complete. Explains what the enquiry form collects and how WhatsApp is used. |
| `/terms` | Partly complete. The commercial terms are marked as awaiting approval. |
| `/booking-policy` | **Placeholder.** Cancellation, refund and waiting-charge rules must be decided by the business. |

These pages carry a visible "awaiting business approval" notice. Do not remove that
notice until the terms have actually been agreed. Nothing on the site should state
binding commercial terms that the business has not agreed.

The pages to edit are `src/pages/TermsPage.tsx` and
`src/pages/BookingPolicyPage.tsx`.

## 7. What the site must not claim

The website was built without inventing anything. Please keep it that way. Do not
add:

- Prices or fares — these are quoted per journey on WhatsApp
- Star ratings, review counts, or customer testimonials
- Claims about fleet size, years of experience, awards or licences
- Opening hours or GPS coordinates unless confirmed
- Any wording that suggests an enquiry is a confirmed booking

Every enquiry says, in the WhatsApp message itself, that availability, the vehicle
and the fare are confirmed by the business.

## 8. Publishing a change

```bash
npm run build
```

Then upload the contents of the `dist/` folder to your host. If your host is
connected to a Git repository, committing and pushing the change usually triggers
the build automatically.

### One-time setup: the real domain

When the domain is chosen, the build needs to know it so that canonical URLs and the
sitemap are correct:

```bash
VITE_SITE_URL=https://your-domain.example npm run build
```

Set this as an environment variable in your hosting dashboard so every build picks
it up. Until it is set, the site emits no canonical URLs and no sitemap — which is
correct behaviour, not a fault.

## 9. If something breaks

| Symptom | Likely cause |
| --- | --- |
| WhatsApp opens but the message is empty | `whatsappDigits` is missing digits or has a `+` or spaces |
| WhatsApp opens the wrong chat | `whatsappDigits` has the wrong country code |
| The number shows oddly on the page | `phoneDisplay` needs updating too |
| A service page shows a broken image | The image files are missing for that `imageKey` |
| The site looks unstyled after upload | Only part of `dist/` was uploaded — upload the whole folder |
| The form refuses to submit | A required field is empty; the error appears under that field |

For anything else, contact your developer with the file name and what you changed.
