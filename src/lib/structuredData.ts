/**
 * JSON-LD structured data.
 *
 * Only fields the business has actually supplied are emitted. Notably absent:
 * aggregateRating, review, geo coordinates, openingHoursSpecification, priceRange
 * and any offer/price data - inventing those would be misleading to search
 * engines and to customers.
 */
import { business, WHATSAPP_URL } from '../content/business';
import { services } from '../content/services';
import { absoluteUrl } from './siteUrl';

export const ORGANISATION_ID = `${business.name.replace(/\s+/g, '-').toLowerCase()}-organisation`;

/**
 * The primary entity. `TaxiService` is the closest schema.org type for a
 * car-hire and taxi business; it is a subtype of LocalBusiness, so local-search
 * consumers still pick it up.
 */
export function taxiServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    '@id': ORGANISATION_ID,
    name: business.name,
    description: `${business.category} based in ${business.address.locality}, ${business.address.city}. Bookings are arranged on WhatsApp.`,
    url: absoluteUrl('/'),
    telephone: `+${business.whatsappDigits}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.locality,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: 'IN',
    },
    areaServed: [
      ...business.serviceAreas.primary,
      ...business.serviceAreas.additional,
    ].map((name) => ({ '@type': 'City', name })),
    availableLanguage: business.languages.map((name) => ({ '@type': 'Language', name })),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: `+${business.whatsappDigits}`,
        contactType: 'Reservations',
        availableLanguage: business.languages,
      },
    ],
    sameAs: [WHATSAPP_URL],
    knowsAbout: services.map((service) => service.name),
  };
}

/** Breadcrumb trail for an interior page. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** The FAQ page, built from the same source as the rendered accordion. */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** The service catalogue, without prices because none have been supplied. */
export function serviceListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Services offered by ${business.name}`,
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.summary,
        serviceType: service.name,
        provider: { '@id': ORGANISATION_ID },
        areaServed: [...business.serviceAreas.primary, ...business.serviceAreas.additional].map(
          (name) => ({ '@type': 'City', name }),
        ),
      },
    })),
  };
}
