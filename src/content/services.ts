/**
 * Service catalogue.
 *
 * Everything a visitor can request is framed as an *enquiry*. The site never
 * states a fare, never promises availability, and never claims the business owns
 * a particular vehicle - the `note` on each service says so explicitly, and the
 * forms only collect what is needed for the business to quote.
 */

export type ServiceId =
  | 'local-car-hire'
  | 'outstation-taxi'
  | 'airport-transfer'
  | 'car-rental-chauffeur';

export interface ServiceField {
  /** Form field keys this service makes relevant. */
  fields: string[];
  /** Shown under the form when the service is selected. */
  note?: string;
}

export interface Service {
  id: ServiceId;
  name: string;
  shortName: string;
  slug: string;
  /** One-line summary used on cards. */
  summary: string;
  /** Fuller description used on the services page. */
  description: string;
  /** What the customer can tell us, in plain language. */
  details: string[];
  imageKey: string;
  /** Short label for the WhatsApp enquiry. */
  enquiryLabel: string;
}

export const services: Service[] = [
  {
    id: 'local-car-hire',
    name: 'Local Car Hire',
    shortName: 'Local hire',
    slug: 'local-car-hire',
    summary: 'Cars for journeys around Mumbra, Thane and nearby areas.',
    description:
      'Local car hire for personal, family, shopping, business and other day-to-day journeys in and around Mumbra and Thane. Tell us where you are going and roughly how long you need the vehicle, and we will confirm what can be arranged.',
    details: [
      'Journeys within Mumbra, Thane and nearby localities',
      'Personal, family, shopping and business travel',
      'Tell us your preferred vehicle and how long you need it',
      'Multiple stops can be included in your enquiry',
    ],
    imageKey: 'vehicle-sedan',
    enquiryLabel: 'Local car hire',
  },
  {
    id: 'outstation-taxi',
    name: 'Outstation Taxi',
    shortName: 'Outstation',
    slug: 'outstation-taxi',
    summary: 'One-way and round-trip journeys to other cities.',
    description:
      'Outstation travel from Mumbra and nearby pickup points. Enquire about a one-way drop or a round trip, and share your destination, dates, passengers and luggage so the business can confirm the vehicle and fare for that journey.',
    details: [
      'One-way and round-trip enquiries',
      'Pickup from Mumbra and nearby locations',
      'Share destination, travel date, passenger count and luggage',
      'Return date and time can be included for round trips',
    ],
    imageKey: 'expressway',
    enquiryLabel: 'Outstation taxi',
  },
  {
    id: 'airport-transfer',
    name: 'Airport Transfers',
    shortName: 'Airport',
    slug: 'airport-transfers',
    summary: 'Pickup and drop enquiries for Mumbai-area airports.',
    description:
      'Pickup and drop enquiries for Mumbai-area airports. Share your flight details, pickup time, passenger count and luggage so the driver can be briefed for the journey.',
    details: [
      'Pickup and drop enquiries for Mumbai-area airports',
      'Flight number, terminal and pickup time',
      'Passenger count and luggage requirements',
      'Early-morning and late-night timings can be requested',
    ],
    imageKey: 'airport-terminal',
    enquiryLabel: 'Airport transfer',
  },
  {
    id: 'car-rental-chauffeur',
    name: 'Car Rental & Chauffeur Services',
    shortName: 'Rental',
    slug: 'car-rental-chauffeur',
    summary: 'Enquire about a vehicle, with or without a driver.',
    description:
      'Enquire about a vehicle for the duration you need, with a driver or without. Self-drive availability depends on the vehicle and must be confirmed by the business before anything is booked.',
    details: [
      'Tell us your preferred vehicle category and duration',
      'Share your pickup location and travel dates',
      'Let us know whether you need a driver',
      'Self-drive availability must be confirmed by the business',
    ],
    imageKey: 'vehicle-suv',
    enquiryLabel: 'Car rental / chauffeur',
  },
];

export const serviceById = Object.fromEntries(services.map((s) => [s.id, s])) as Record<
  ServiceId,
  Service
>;
