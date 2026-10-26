/**
 * Tests for the booking enquiry logic in src/lib/enquiry.ts.
 *
 * Run with: npm test
 *
 * The real module is compiled with esbuild and imported, so these assertions run
 * against the same code the website ships rather than a copy of it. Node's
 * built-in test runner is used, which keeps the project dependency-free.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const outDir = await mkdtemp(path.join(tmpdir(), 'ali-tours-enquiry-'));
const outFile = path.join(outDir, 'enquiry.mjs');

await build({
  entryPoints: ['src/lib/enquiry.ts'],
  outfile: outFile,
  bundle: true,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent',
});

const eq = await import(outFile);

process.on('exit', () => {
  rm(outDir, { recursive: true, force: true }).catch(() => {});
});

/** A complete, valid one-way outstation enquiry used as the baseline. */
const validOneWay = {
  ...eq.emptyEnquiry,
  name: 'Imran Shaikh',
  mobile: '9876543210',
  serviceType: 'outstation-taxi',
  pickupLocation: 'Mumbra',
  destination: 'Pune',
  journeyDate: '2099-01-10',
  pickupTime: '06:30',
  passengers: '4',
  tripType: 'one-way',
};

/* ------------------------------------------------------------------ mobile -- */

test('accepts the mobile formats people actually type', () => {
  for (const input of [
    '9876543210',
    '98765 43210',
    '+91 98765 43210',
    '+919876543210',
    '919876543210',
    '09876543210',
    '98765-43210',
    '(98765) 43210',
  ]) {
    assert.equal(eq.isValidIndianMobile(input), true, `should accept ${input}`);
  }
});

test('rejects malformed mobile numbers', () => {
  for (const input of ['5876543210', '987654321', '98765432101', 'abcdefghij', '', '12345']) {
    assert.equal(eq.isValidIndianMobile(input), false, `should reject ${input}`);
  }
});

test('normalises a number down to ten digits', () => {
  assert.equal(eq.normaliseMobile('+91 98765 43210'), '9876543210');
  assert.equal(eq.normaliseMobile('098765 43210'), '9876543210');
});

/* -------------------------------------------------------------- validation -- */

test('a complete one-way enquiry passes validation', () => {
  assert.deepEqual(eq.validateEnquiry(validOneWay), {});
});

test('a round trip requires a return date', () => {
  const roundTrip = { ...validOneWay, tripType: 'round-trip' };
  assert.ok(eq.validateEnquiry(roundTrip).returnDate);
  assert.equal(eq.validateEnquiry({ ...roundTrip, returnDate: '2099-01-12' }).returnDate, undefined);
});

test('a return date cannot precede the journey date', () => {
  const errors = eq.validateEnquiry({
    ...validOneWay,
    tripType: 'round-trip',
    returnDate: '2099-01-05',
  });
  assert.ok(errors.returnDate);
});

test('a journey date in the past is rejected', () => {
  assert.ok(eq.validateEnquiry({ ...validOneWay, journeyDate: '2000-01-01' }).journeyDate);
});

test('passenger counts outside 1-30 are rejected', () => {
  assert.ok(eq.validateEnquiry({ ...validOneWay, passengers: '0' }).passengers);
  assert.ok(eq.validateEnquiry({ ...validOneWay, passengers: '31' }).passengers);
  assert.ok(eq.validateEnquiry({ ...validOneWay, passengers: '2.5' }).passengers);
  assert.equal(eq.validateEnquiry({ ...validOneWay, passengers: '30' }).passengers, undefined);
});

test('whitespace-only required text is rejected', () => {
  assert.ok(eq.validateEnquiry({ ...validOneWay, name: '   ' }).name);
  assert.ok(eq.validateEnquiry({ ...validOneWay, destination: '   ' }).destination);
  assert.ok(eq.validateEnquiry({ ...validOneWay, pickupLocation: '' }).pickupLocation);
});

test('over-long free text is rejected', () => {
  const errors = eq.validateEnquiry({
    ...validOneWay,
    additionalRequirements: 'x'.repeat(eq.MAX_ADDITIONAL_LENGTH + 1),
  });
  assert.ok(errors.additionalRequirements);
});

test('every required field reports an error when the form is empty', () => {
  const errors = eq.validateEnquiry(eq.emptyEnquiry);
  for (const field of [
    'name',
    'mobile',
    'serviceType',
    'pickupLocation',
    'destination',
    'journeyDate',
    'pickupTime',
    'passengers',
  ]) {
    assert.ok(errors[field], `expected an error for ${field}`);
  }
});

/* --------------------------------------------------------------- tailoring -- */

test('the form asks for the right fields per service', () => {
  const airport = eq.visibilityFor('airport-transfer', '');
  assert.equal(airport.destination, false, 'airport transfer should not ask for a destination');
  assert.equal(airport.flight, true, 'airport transfer should ask for flight details');

  const outstation = eq.visibilityFor('outstation-taxi', '');
  assert.equal(outstation.tripType, true);
  assert.equal(eq.visibilityFor('outstation-taxi', 'round-trip').returnDate, true);
  assert.equal(eq.visibilityFor('outstation-taxi', 'one-way').returnDate, false);

  const rental = eq.visibilityFor('car-rental-chauffeur', '');
  assert.equal(rental.duration, true);
  assert.equal(rental.driverRequirement, true);

  assert.equal(eq.visibilityFor('local-car-hire', '').duration, true);
});

/* ----------------------------------------------------------- WhatsApp text -- */

const roundTripValues = {
  ...validOneWay,
  tripType: 'round-trip',
  returnDate: '2099-01-12',
  vehicleCategory: 'SUV',
  driverRequirement: 'with-driver',
  additionalRequirements: '2 large suitcases',
};

test('the WhatsApp message contains every submitted detail', () => {
  const message = eq.buildWhatsAppMessage(
    roundTripValues,
    'Outstation Taxi',
    'Ali Tours and Travels',
  );

  assert.match(message, /^Hello Ali Tours and Travels, I would like to enquire about a booking\./);
  assert.ok(message.includes('*Journey enquiry*'));
  assert.ok(message.includes('Name: Imran Shaikh'));
  assert.ok(message.includes('WhatsApp / mobile: 9876543210'));
  assert.ok(message.includes('Service: Outstation Taxi'));
  assert.ok(message.includes('Pickup location: Mumbra'));
  assert.ok(message.includes('Destination: Pune'));
  assert.ok(message.includes('Journey date: 10 January 2099'));
  assert.ok(message.includes('Pickup time: 6:30 AM'));
  assert.ok(message.includes('Trip type: Round trip'));
  assert.ok(message.includes('Return date: 12 January 2099'));
  assert.ok(message.includes('Passengers: 4'));
  assert.ok(message.includes('Vehicle preference: SUV'));
  assert.ok(message.includes('Driver needed: Yes, with a driver'));
  assert.ok(message.includes('Additional requirements: 2 large suitcases'));
  assert.ok(message.includes('Please confirm availability, the vehicle and the fare'));
});

test('empty optional fields are left out rather than sent blank', () => {
  const message = eq.buildWhatsAppMessage(validOneWay, 'Outstation Taxi', 'Ali Tours and Travels');
  assert.ok(!message.includes('Flight number'));
  assert.ok(!message.includes('Duration needed'));
  assert.ok(!message.includes('Additional requirements'));
  assert.ok(!message.includes('Return date'));
});

test('an airport transfer carries the flight details instead of a destination', () => {
  const message = eq.buildWhatsAppMessage(
    {
      ...eq.emptyEnquiry,
      name: 'Ayesha Khan',
      mobile: '9876543210',
      serviceType: 'airport-transfer',
      pickupLocation: 'Tanwar Nagar, Mumbra',
      journeyDate: '2099-02-01',
      pickupTime: '04:00',
      passengers: '2',
      airportDirection: 'drop-to-airport',
      flightNumber: '6E 2043, Terminal 2',
    },
    'Airport Transfers',
    'Ali Tours and Travels',
  );

  assert.ok(message.includes('Airport journey: Drop to the airport'));
  assert.ok(message.includes('Flight number: 6E 2043, Terminal 2'));
  assert.ok(!message.includes('Destination:'));
});

test('the message never invents a price, a booking reference or a confirmation', () => {
  const message = eq.buildWhatsAppMessage(
    roundTripValues,
    'Outstation Taxi',
    'Ali Tours and Travels',
  );
  assert.doesNotMatch(message, /\u20b9/);
  assert.doesNotMatch(message, /\b(rs|inr)\.?\s*\d/i);
  assert.doesNotMatch(message, /booking\s*(id|ref|number)/i);
});

/* ------------------------------------------------------------ URL encoding -- */

test('the generated link targets the official WhatsApp number', () => {
  const message = eq.buildWhatsAppMessage(
    roundTripValues,
    'Outstation Taxi',
    'Ali Tours and Travels',
  );
  const link = new URL(`https://wa.me/919324222911?text=${encodeURIComponent(message)}`);

  assert.equal(link.host, 'wa.me');
  assert.equal(link.pathname, '/919324222911');
});

test('the message survives URL encoding byte for byte', () => {
  const message = eq.buildWhatsAppMessage(
    { ...roundTripValues, additionalRequirements: 'Extra stop & 50% toll share? yes/no #1' },
    'Outstation Taxi',
    'Ali Tours and Travels',
  );
  const link = `https://wa.me/919324222911?text=${encodeURIComponent(message)}`;

  assert.ok(!link.includes('\n'), 'newlines must be encoded, not left raw');
  assert.ok(link.includes('%0A'), 'newlines should be percent-encoded');
  // A literal % in the text must be escaped as %25 so it cannot be misread as
  // the start of another escape sequence.
  assert.ok(link.includes('50%25'), 'a literal percent sign must be escaped');
  // searchParams.get() decodes once, which must return the original message.
  assert.equal(new URL(link).searchParams.get('text'), message);
});

/* ------------------------------------------------------------ copy fallback -- */

test('the copyable summary states that the enquiry is not a booking', () => {
  const plain = eq.buildPlainSummary(validOneWay, 'Outstation Taxi', 'Ali Tours and Travels');
  assert.ok(plain.startsWith('Ali Tours and Travels - booking enquiry'));
  assert.ok(plain.includes('not a confirmed booking'));
  assert.ok(plain.includes('Name: Imran Shaikh'));
});

/* ------------------------------------------------------------ date helpers -- */

test('dates and times are formatted for reading', () => {
  assert.equal(eq.formatDate('2099-01-10'), '10 January 2099');
  assert.equal(eq.formatTime('06:30'), '6:30 AM');
  assert.equal(eq.formatTime('00:05'), '12:05 AM');
  assert.equal(eq.formatTime('12:00'), '12:00 PM');
  assert.equal(eq.formatTime('18:45'), '6:45 PM');
  assert.equal(eq.formatDate(''), '');
});
