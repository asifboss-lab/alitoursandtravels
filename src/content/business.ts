/**
 * Single source of truth for every business fact shown on the site.
 *
 * The owner only has to edit this file to change the phone number, address,
 * service areas or wording. Nothing here is invented: prices, ratings, reviews,
 * opening hours, founding dates, fleet counts and coordinates are deliberately
 * absent because they have not been confirmed by the business.
 */

export const business = {
  name: 'Ali Tours and Travels',
  shortName: 'Ali Tours',
  category: 'Car Hire, Car Rental, Local Travel and Outstation Taxi Services',
  tagline: 'Your Journey. Our Responsibility.',

  /** Digits only, in international format, for building wa.me links. */
  whatsappDigits: '919324222911',
  /** How the number is displayed to visitors. */
  phoneDisplay: '+91 93242 22911',

  address: {
    street: 'Tanwar Nagar',
    locality: 'Mumbra',
    city: 'Thane',
    region: 'Maharashtra',
    postalCode: '400612',
    country: 'India',
    /** Comma-joined form used in prose, footers and structured data. */
    full: 'Tanwar Nagar, Mumbra, Thane, Maharashtra – 400612, India',
  },

  serviceAreas: {
    primary: ['Mumbra', 'Thane'],
    additional: ['Mumbai', 'Navi Mumbai'],
  },

  /**
   * No verified GPS coordinates are available for the office, so the site links
   * to a map *search* for the address rather than dropping a pin at a guessed
   * location. See the owner guide for how to replace this once confirmed.
   */
  mapSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=Tanwar%20Nagar%2C%20Mumbra%2C%20Thane%2C%20Maharashtra%20400612',

  languages: ['English', 'Hindi', 'Marathi'],
} as const;

/** Canonical WhatsApp click-to-chat URL. */
export const WHATSAPP_URL = `https://wa.me/${business.whatsappDigits}`;

/** Tap-to-call link. Voice calling depends on the number, not the website. */
export const TEL_URL = `tel:+${business.whatsappDigits}`;

/**
 * Builds a wa.me link with a pre-filled, URL-encoded message.
 * The text stays in the URL fragment-free query string and is never sent to
 * analytics - the visitor's browser hands it straight to WhatsApp.
 */
export function whatsappLink(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export const defaultWhatsappMessage = `Hello ${business.name}, I would like to enquire about a car booking.`;
