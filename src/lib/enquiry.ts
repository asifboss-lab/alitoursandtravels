/**
 * Booking enquiry model: field definitions, validation and the WhatsApp message
 * builder.
 *
 * There is deliberately no fare calculation and no availability check here.
 * The site cannot know either, so instead it collects a complete, well-formed
 * journey description and hands it to the business, who quote per journey.
 */
import type { ServiceId } from '../content/services';

export type TripType = 'one-way' | 'round-trip';
export type DriverRequirement = 'with-driver' | 'self-drive' | 'not-sure';
export type AirportDirection = 'pickup-from-airport' | 'drop-to-airport';

export interface EnquiryValues {
  name: string;
  mobile: string;
  serviceType: ServiceId | '';
  pickupLocation: string;
  destination: string;
  journeyDate: string;
  pickupTime: string;
  passengers: string;
  tripType: TripType | '';
  returnDate: string;
  vehicleCategory: string;
  driverRequirement: DriverRequirement | '';
  duration: string;
  flightNumber: string;
  airportDirection: AirportDirection | '';
  additionalRequirements: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>;

export const emptyEnquiry: EnquiryValues = {
  name: '',
  mobile: '',
  serviceType: '',
  pickupLocation: '',
  destination: '',
  journeyDate: '',
  pickupTime: '',
  passengers: '',
  tripType: '',
  returnDate: '',
  vehicleCategory: '',
  driverRequirement: '',
  duration: '',
  flightNumber: '',
  airportDirection: '',
  additionalRequirements: '',
};

/**
 * Vehicle *categories* rather than named models: the business has not supplied a
 * fleet list, so the form must not imply one exists.
 */
export const vehicleCategories = [
  'No preference',
  'Hatchback',
  'Sedan',
  'SUV',
  'MPV / 7-seater',
  'Larger vehicle for a group',
] as const;

export const MAX_ADDITIONAL_LENGTH = 600;

/* -------------------------------------------------------------------------- */
/* Which fields each service actually needs                                    */
/* -------------------------------------------------------------------------- */

export interface FieldVisibility {
  destination: boolean;
  tripType: boolean;
  returnDate: boolean;
  driverRequirement: boolean;
  duration: boolean;
  flight: boolean;
}

/** Fields shown for every service. */
export const baseFields: FieldVisibility = {
  destination: true,
  tripType: false,
  returnDate: false,
  driverRequirement: false,
  duration: false,
  flight: false,
};

/**
 * Tailors the form to the chosen service - an airport transfer asks for flight
 * details, an outstation round trip asks for a return date, and so on.
 */
export function visibilityFor(
  service: ServiceId | '',
  tripType: TripType | '',
): FieldVisibility {
  switch (service) {
    case 'airport-transfer':
      return { ...baseFields, destination: false, flight: true };
    case 'outstation-taxi':
      return {
        ...baseFields,
        tripType: true,
        returnDate: tripType === 'round-trip',
      };
    case 'car-rental-chauffeur':
      return { ...baseFields, destination: false, duration: true, driverRequirement: true };
    case 'local-car-hire':
      return { ...baseFields, duration: true };
    default:
      return baseFields;
  }
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Accepts the shapes people actually type: 10 digits, with or without +91, with
 * spaces, dashes or brackets. Indian mobile numbers start 6-9.
 */
export function normaliseMobile(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function isValidIndianMobile(input: string): boolean {
  return /^[6-9]\d{9}$/.test(normaliseMobile(input));
}

/** Today in the visitor's local timezone, as YYYY-MM-DD for date inputs. */
export function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const visible = visibilityFor(values.serviceType, values.tripType);
  const today = todayIso();

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Please tell us your name so we know who to reply to.';
  } else if (name.length < 2) {
    errors.name = 'Please enter your full name.';
  } else if (name.length > 80) {
    errors.name = 'Please keep your name under 80 characters.';
  }

  if (!values.mobile.trim()) {
    errors.mobile = 'A WhatsApp or mobile number is needed to confirm your booking.';
  } else if (!isValidIndianMobile(values.mobile)) {
    errors.mobile =
      'Please enter a valid 10-digit Indian mobile number, for example 98765 43210.';
  }

  if (!values.serviceType) {
    errors.serviceType = 'Please choose the type of service you need.';
  }

  if (!values.pickupLocation.trim()) {
    errors.pickupLocation = 'Please tell us where you would like to be picked up from.';
  } else if (values.pickupLocation.trim().length > 160) {
    errors.pickupLocation = 'Please keep the pickup location under 160 characters.';
  }

  if (visible.destination) {
    if (!values.destination.trim()) {
      errors.destination = 'Please tell us where you are travelling to.';
    } else if (values.destination.trim().length > 160) {
      errors.destination = 'Please keep the destination under 160 characters.';
    }
  }

  if (!values.journeyDate) {
    errors.journeyDate = 'Please choose the date you would like to travel.';
  } else if (values.journeyDate < today) {
    errors.journeyDate = 'Please choose today or a future date.';
  }

  if (!values.pickupTime) {
    errors.pickupTime = 'Please tell us the time you would like to be picked up.';
  }

  if (!values.passengers.trim()) {
    errors.passengers = 'Please tell us how many passengers will be travelling.';
  } else {
    const count = Number(values.passengers);
    if (!Number.isInteger(count) || count < 1) {
      errors.passengers = 'Please enter a whole number of at least 1.';
    } else if (count > 30) {
      errors.passengers =
        'For groups larger than 30, please message on WhatsApp so we can advise you.';
    }
  }

  if (visible.tripType && !values.tripType) {
    errors.tripType = 'Please tell us whether this is a one-way or round trip.';
  }

  if (visible.returnDate) {
    if (!values.returnDate) {
      errors.returnDate = 'Please choose your return date for a round trip.';
    } else if (values.returnDate < today) {
      errors.returnDate = 'The return date cannot be in the past.';
    } else if (values.journeyDate && values.returnDate < values.journeyDate) {
      errors.returnDate = 'The return date cannot be earlier than the journey date.';
    }
  }

  if (values.additionalRequirements.length > MAX_ADDITIONAL_LENGTH) {
    errors.additionalRequirements = `Please keep this under ${MAX_ADDITIONAL_LENGTH} characters.`;
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Summary and WhatsApp message                                                */
/* -------------------------------------------------------------------------- */

export interface SummaryRow {
  label: string;
  value: string;
}

const tripTypeLabels: Record<TripType, string> = {
  'one-way': 'One-way',
  'round-trip': 'Round trip',
};

const driverLabels: Record<DriverRequirement, string> = {
  'with-driver': 'Yes, with a driver',
  'self-drive': 'No, self-drive preferred (to be confirmed)',
  'not-sure': 'Not sure yet',
};

const airportDirectionLabels: Record<AirportDirection, string> = {
  'pickup-from-airport': 'Pickup from the airport',
  'drop-to-airport': 'Drop to the airport',
};

/** Formats YYYY-MM-DD as a readable date without pulling in a date library. */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = months[Number(m) - 1] ?? m;
  return `${Number(d)} ${monthName} ${y}`;
}

/** Formats HH:MM as a 12-hour time. */
export function formatTime(value: string): string {
  if (!value) return '';
  const [h, m] = value.split(':');
  if (h === undefined || m === undefined) return value;
  const hours = Number(h);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${m} ${suffix}`;
}

/**
 * The rows shown in the on-page summary. Only fields the visitor actually filled
 * in are included, so the summary never shows empty labels.
 */
export function buildSummaryRows(
  values: EnquiryValues,
  serviceName: string,
): SummaryRow[] {
  const rows: SummaryRow[] = [
    { label: 'Name', value: values.name.trim() },
    { label: 'WhatsApp / mobile', value: normaliseMobile(values.mobile) },
    { label: 'Service', value: serviceName },
  ];

  if (values.airportDirection) {
    rows.push({ label: 'Airport journey', value: airportDirectionLabels[values.airportDirection] });
  }
  rows.push({ label: 'Pickup location', value: values.pickupLocation.trim() });

  if (values.destination.trim()) {
    rows.push({ label: 'Destination', value: values.destination.trim() });
  }
  rows.push({ label: 'Journey date', value: formatDate(values.journeyDate) });
  rows.push({ label: 'Pickup time', value: formatTime(values.pickupTime) });

  if (values.tripType) {
    rows.push({ label: 'Trip type', value: tripTypeLabels[values.tripType] });
  }
  if (values.returnDate) {
    rows.push({ label: 'Return date', value: formatDate(values.returnDate) });
  }
  if (values.duration.trim()) {
    rows.push({ label: 'Duration needed', value: values.duration.trim() });
  }
  rows.push({ label: 'Passengers', value: values.passengers.trim() });

  if (values.vehicleCategory) {
    rows.push({ label: 'Vehicle preference', value: values.vehicleCategory });
  }
  if (values.driverRequirement) {
    rows.push({ label: 'Driver needed', value: driverLabels[values.driverRequirement] });
  }
  if (values.flightNumber.trim()) {
    rows.push({ label: 'Flight number', value: values.flightNumber.trim() });
  }
  if (values.additionalRequirements.trim()) {
    rows.push({ label: 'Additional requirements', value: values.additionalRequirements.trim() });
  }

  return rows.filter((row) => row.value !== '');
}

/**
 * Builds the message handed to WhatsApp.
 *
 * Kept plain-text and line-based so it renders correctly in WhatsApp on Android,
 * iOS and the web client. The visitor sees exactly this text before it is sent.
 */
export function buildWhatsAppMessage(
  values: EnquiryValues,
  serviceName: string,
  businessName: string,
): string {
  const lines: string[] = [
    `Hello ${businessName}, I would like to enquire about a booking.`,
    '',
    '*Journey enquiry*',
  ];

  for (const row of buildSummaryRows(values, serviceName)) {
    lines.push(`${row.label}: ${row.value}`);
  }

  lines.push(
    '',
    'Please confirm availability, the vehicle and the fare for this journey. Thank you.',
  );

  return lines.join('\n');
}

/** Plain-text version of the summary, used by the "copy" fallback. */
export function buildPlainSummary(
  values: EnquiryValues,
  serviceName: string,
  businessName: string,
): string {
  const rows = buildSummaryRows(values, serviceName)
    .map((row) => `${row.label}: ${row.value}`)
    .join('\n');

  return [
    `${businessName} - booking enquiry`,
    '',
    rows,
    '',
    'This enquiry is not a confirmed booking. Availability, the vehicle and the fare must be confirmed by the business.',
  ].join('\n');
}
