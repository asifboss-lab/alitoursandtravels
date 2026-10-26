import { useMemo, useRef, useState } from 'react';
import { business, whatsappLink } from '../content/business';
import { services, serviceById, type ServiceId } from '../content/services';
import {
  MAX_ADDITIONAL_LENGTH,
  buildPlainSummary,
  buildSummaryRows,
  buildWhatsAppMessage,
  emptyEnquiry,
  todayIso,
  validateEnquiry,
  vehicleCategories,
  visibilityFor,
  type EnquiryErrors,
  type EnquiryValues,
  type SummaryRow,
} from '../lib/enquiry';
import { AlertIcon, CheckCircleIcon, CopyIcon, InfoIcon, WhatsAppIcon } from './Icons';

interface BookingFormProps {
  /** Pre-selects a service, e.g. when arriving from a service page. */
  initialService?: ServiceId;
  /** Hides the service picker when the service is already known. */
  lockService?: boolean;
}

type SubmitState = 'idle' | 'ready';

const fieldOrder: (keyof EnquiryValues)[] = [
  'name',
  'mobile',
  'serviceType',
  'airportDirection',
  'pickupLocation',
  'destination',
  'journeyDate',
  'pickupTime',
  'tripType',
  'returnDate',
  'duration',
  'passengers',
  'vehicleCategory',
  'driverRequirement',
  'flightNumber',
  'additionalRequirements',
];

export function BookingForm({ initialService, lockService = false }: BookingFormProps) {
  const [values, setValues] = useState<EnquiryValues>({
    ...emptyEnquiry,
    serviceType: initialService ?? '',
  });
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [message, setMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [whatsappBlocked, setWhatsappBlocked] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const visible = useMemo(
    () => visibilityFor(values.serviceType, values.tripType),
    [values.serviceType, values.tripType],
  );

  const serviceName = values.serviceType ? serviceById[values.serviceType].name : '';

  function update<K extends keyof EnquiryValues>(key: K, value: EnquiryValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };

      // Clearing dependent fields avoids sending stale details when the visitor
      // switches service or trip type (e.g. a return date on a one-way trip).
      if (key === 'serviceType') {
        next.airportDirection = '';
        next.flightNumber = '';
        next.duration = '';
        next.driverRequirement = '';
        next.tripType = '';
        next.returnDate = '';
        if (value === 'airport-transfer') next.destination = '';
      }
      if (key === 'tripType' && value !== 'round-trip') {
        next.returnDate = '';
      }
      return next;
    });

    // Clear the error as soon as the visitor edits the field.
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (submitState === 'ready') {
      setSubmitState('idle');
      setCopyStatus('');
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateEnquiry(values);
    setErrors(found);

    const firstError = fieldOrder.find((key) => found[key]);
    if (firstError) {
      setSubmitState('idle');
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`);
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (liveRef.current) {
        liveRef.current.textContent = `${Object.keys(found).length} field${
          Object.keys(found).length === 1 ? '' : 's'
        } need attention before your enquiry can be sent.`;
      }
      return;
    }

    const text = buildWhatsAppMessage(values, serviceName, business.name);
    setMessage(text);
    setSummary(buildSummaryRows(values, serviceName));
    setSubmitState('ready');
    setCopyStatus('');
    setWhatsappBlocked(false);

    if (liveRef.current) {
      liveRef.current.textContent = 'Your enquiry summary is ready. Open WhatsApp to send it.';
    }

    // Open WhatsApp straight away - this is a user gesture, so popup blockers
    // allow it. The summary stays on screen with the link as a fallback.
    const opened = window.open(whatsappLink(text), '_blank', 'noopener,noreferrer');
    if (!opened) {
      setWhatsappBlocked(true);
    }

    requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }

  async function copySummary() {
    const text = buildPlainSummary(values, serviceName, business.name);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Older Android browsers have no async clipboard API.
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopyStatus('Enquiry copied. You can now paste it into WhatsApp or an email.');
    } catch {
      setCopyStatus(
        'Copying was blocked by your browser. Please select the text above and copy it manually.',
      );
    }
  }

  function resetForm() {
    setValues({ ...emptyEnquiry, serviceType: initialService ?? '' });
    setErrors({});
    setSummary([]);
    setMessage('');
    setSubmitState('idle');
    setCopyStatus('');
    setWhatsappBlocked(false);
    formRef.current?.querySelector<HTMLElement>('[name="name"]')?.focus();
  }

  const whatsappHref = message ? whatsappLink(message) : whatsappLink('');

  return (
    <div className="stack" style={{ ['--stack-gap' as string]: '1.5rem' }}>
      <form ref={formRef} className="form" onSubmit={handleSubmit} noValidate>
        <p ref={liveRef} className="visually-hidden" role="status" aria-live="polite" />

        <div className="form__notice">
          <InfoIcon size={18} />
          <p>
            <strong>An enquiry is not a confirmed booking.</strong> Your details are sent to{' '}
            {business.name} on WhatsApp. Availability, the vehicle and the fare are confirmed
            by the business before anything is booked.
          </p>
        </div>

        <div className="form__grid form__grid--2">
          <Field
            id="name"
            label="Your name"
            required
            error={errors.name}
            hint="Who should the business reply to?"
          >
            <input
              id="name"
              name="name"
              className="field__control"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : 'name-hint'}
              placeholder="For example, Imran Shaikh"
              maxLength={80}
            />
          </Field>

          <Field
            id="mobile"
            label="WhatsApp / mobile number"
            required
            error={errors.mobile}
            hint="10-digit Indian mobile number."
          >
            <input
              id="mobile"
              name="mobile"
              className="field__control"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={values.mobile}
              onChange={(e) => update('mobile', e.target.value)}
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={errors.mobile ? 'mobile-error' : 'mobile-hint'}
              placeholder="98765 43210"
              maxLength={16}
            />
          </Field>

          <Field
            id="serviceType"
            label="Type of service"
            required
            error={errors.serviceType}
            full={!lockService}
            className={lockService ? 'field--full' : undefined}
          >
            {lockService && initialService ? (
              <>
                <input type="hidden" name="serviceType" value={initialService} />
                <p className="field__control" style={{ display: 'grid', alignItems: 'center' }}>
                  {serviceById[initialService].name}
                </p>
              </>
            ) : (
              <select
                id="serviceType"
                name="serviceType"
                className="field__control"
                value={values.serviceType}
                onChange={(e) => update('serviceType', e.target.value as ServiceId | '')}
                aria-invalid={Boolean(errors.serviceType)}
                aria-describedby={errors.serviceType ? 'serviceType-error' : undefined}
              >
                <option value="">Please choose a service…</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            )}
          </Field>

          {values.serviceType === 'airport-transfer' && (
            <Field id="airportDirection" label="Airport journey" full group>
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    name="airportDirection"
                    value="pickup-from-airport"
                    checked={values.airportDirection === 'pickup-from-airport'}
                    onChange={() => update('airportDirection', 'pickup-from-airport')}
                  />
                  Pickup from the airport
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="airportDirection"
                    value="drop-to-airport"
                    checked={values.airportDirection === 'drop-to-airport'}
                    onChange={() => update('airportDirection', 'drop-to-airport')}
                  />
                  Drop to the airport
                </label>
              </div>
            </Field>
          )}

          <Field
            id="pickupLocation"
            label="Pickup location"
            required
            error={errors.pickupLocation}
            hint="Area, building or landmark."
          >
            <input
              id="pickupLocation"
              name="pickupLocation"
              className="field__control"
              type="text"
              autoComplete="street-address"
              value={values.pickupLocation}
              onChange={(e) => update('pickupLocation', e.target.value)}
              aria-invalid={Boolean(errors.pickupLocation)}
              aria-describedby={
                errors.pickupLocation ? 'pickupLocation-error' : 'pickupLocation-hint'
              }
              placeholder="For example, Tanwar Nagar, Mumbra"
              maxLength={160}
            />
          </Field>

          {visible.destination && (
            <Field
              id="destination"
              label="Destination"
              required
              error={errors.destination}
              hint="Where you are travelling to."
            >
              <input
                id="destination"
                name="destination"
                className="field__control"
                type="text"
                value={values.destination}
                onChange={(e) => update('destination', e.target.value)}
                aria-invalid={Boolean(errors.destination)}
                aria-describedby={errors.destination ? 'destination-error' : 'destination-hint'}
                placeholder="For example, Pune, or Mumbai Airport T2"
                maxLength={160}
              />
            </Field>
          )}

          {visible.flight && (
            <Field
              id="flightNumber"
              label="Flight number"
              error={errors.flightNumber}
              hint="Include the terminal if you know it."
            >
              <input
                id="flightNumber"
                name="flightNumber"
                className="field__control"
                type="text"
                value={values.flightNumber}
                onChange={(e) => update('flightNumber', e.target.value)}
                aria-describedby="flightNumber-hint"
                placeholder="For example, 6E 2043, Terminal 2"
                maxLength={80}
              />
            </Field>
          )}

          <Field id="journeyDate" label="Journey date" required error={errors.journeyDate}>
            <input
              id="journeyDate"
              name="journeyDate"
              className="field__control"
              type="date"
              min={todayIso()}
              value={values.journeyDate}
              onChange={(e) => update('journeyDate', e.target.value)}
              aria-invalid={Boolean(errors.journeyDate)}
              aria-describedby={errors.journeyDate ? 'journeyDate-error' : undefined}
            />
          </Field>

          <Field
            id="pickupTime"
            label="Preferred pickup time"
            required
            error={errors.pickupTime}
          >
            <input
              id="pickupTime"
              name="pickupTime"
              className="field__control"
              type="time"
              value={values.pickupTime}
              onChange={(e) => update('pickupTime', e.target.value)}
              aria-invalid={Boolean(errors.pickupTime)}
              aria-describedby={errors.pickupTime ? 'pickupTime-error' : undefined}
            />
          </Field>

          {visible.tripType && (
            <Field
              id="tripType"
              label="One-way or round trip"
              required
              error={errors.tripType}
              full
              group
            >
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    name="tripType"
                    value="one-way"
                    checked={values.tripType === 'one-way'}
                    onChange={() => update('tripType', 'one-way')}
                  />
                  One-way
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="tripType"
                    value="round-trip"
                    checked={values.tripType === 'round-trip'}
                    onChange={() => update('tripType', 'round-trip')}
                  />
                  Round trip
                </label>
              </div>
            </Field>
          )}

          {visible.returnDate && (
            <Field
              id="returnDate"
              label="Return date"
              required
              error={errors.returnDate}
              hint="Needed for a round trip."
            >
              <input
                id="returnDate"
                name="returnDate"
                className="field__control"
                type="date"
                min={values.journeyDate || todayIso()}
                value={values.returnDate}
                onChange={(e) => update('returnDate', e.target.value)}
                aria-invalid={Boolean(errors.returnDate)}
                aria-describedby={errors.returnDate ? 'returnDate-error' : 'returnDate-hint'}
              />
            </Field>
          )}

          {visible.duration && (
            <Field
              id="duration"
              label="How long do you need the vehicle?"
              error={errors.duration}
              hint="For example, 4 hours, or a full day."
            >
              <input
                id="duration"
                name="duration"
                className="field__control"
                type="text"
                value={values.duration}
                onChange={(e) => update('duration', e.target.value)}
                aria-describedby="duration-hint"
                placeholder="For example, 6 hours"
                maxLength={80}
              />
            </Field>
          )}

          <Field
            id="passengers"
            label="Number of passengers"
            required
            error={errors.passengers}
            hint="Including children."
          >
            <input
              id="passengers"
              name="passengers"
              className="field__control"
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              step={1}
              value={values.passengers}
              onChange={(e) => update('passengers', e.target.value)}
              aria-invalid={Boolean(errors.passengers)}
              aria-describedby={errors.passengers ? 'passengers-error' : 'passengers-hint'}
              placeholder="For example, 4"
            />
          </Field>

          <Field
            id="vehicleCategory"
            label="Preferred vehicle category"
            hint="The business will confirm what is available."
          >
            <select
              id="vehicleCategory"
              name="vehicleCategory"
              className="field__control"
              value={values.vehicleCategory}
              onChange={(e) => update('vehicleCategory', e.target.value)}
              aria-describedby="vehicleCategory-hint"
            >
              <option value="">No preference</option>
              {vehicleCategories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          {visible.driverRequirement && (
            <Field
              id="driverRequirement"
              label="Do you need a driver?"
              full
              group
              hint="Self-drive availability must be confirmed by the business."
            >
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    name="driverRequirement"
                    value="with-driver"
                    checked={values.driverRequirement === 'with-driver'}
                    onChange={() => update('driverRequirement', 'with-driver')}
                  />
                  Yes, with a driver
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="driverRequirement"
                    value="self-drive"
                    checked={values.driverRequirement === 'self-drive'}
                    onChange={() => update('driverRequirement', 'self-drive')}
                  />
                  Self-drive (to be confirmed)
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="driverRequirement"
                    value="not-sure"
                    checked={values.driverRequirement === 'not-sure'}
                    onChange={() => update('driverRequirement', 'not-sure')}
                  />
                  Not sure yet
                </label>
              </div>
            </Field>
          )}

          <Field
            id="additionalRequirements"
            label="Additional requirements"
            full
            error={errors.additionalRequirements}
            hint={`Optional. Luggage, extra stops, child seat, or anything else. Up to ${MAX_ADDITIONAL_LENGTH} characters.`}
          >
            <textarea
              id="additionalRequirements"
              name="additionalRequirements"
              className="field__control"
              value={values.additionalRequirements}
              onChange={(e) => update('additionalRequirements', e.target.value)}
              aria-invalid={Boolean(errors.additionalRequirements)}
              aria-describedby={
                errors.additionalRequirements
                  ? 'additionalRequirements-error'
                  : 'additionalRequirements-hint'
              }
              placeholder="For example, 3 large suitcases and 2 hand bags."
              maxLength={MAX_ADDITIONAL_LENGTH}
              rows={4}
            />
          </Field>
        </div>

        {values.serviceType && (
          <p className="form__service-note">
            {serviceById[values.serviceType].details[0]}
          </p>
        )}

        <div className="form__footer">
          <button className="btn btn--primary" type="submit">
            <WhatsAppIcon size={19} />
            Review &amp; send on WhatsApp
          </button>
          <button className="btn btn--ghost" type="button" onClick={resetForm}>
            Clear form
          </button>
        </div>
      </form>

      {submitState === 'ready' && summary.length > 0 && (
        <div className="form__summary" ref={summaryRef} tabIndex={-1}>
          <h3>Your booking enquiry</h3>
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: 'var(--step--1)' }}>
            Check the details below. Nothing has been booked yet.
          </p>

          {whatsappBlocked && (
            <div className="form__notice" style={{ marginTop: '1rem' }}>
              <AlertIcon size={18} />
              <p>
                <strong>WhatsApp did not open automatically.</strong> Your browser may have
                blocked the new tab. Use the button below to open WhatsApp, or copy the
                enquiry and send it to {business.phoneDisplay}.
              </p>
            </div>
          )}

          <dl>
            {summary.map((row) => (
              <div className="form__summary-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <h4 style={{ marginTop: '1.5rem', fontSize: 'var(--step-0)' }}>
            Message that will be sent
          </h4>
          <pre>{message}</pre>

          <div className="btn-row form__summary-actions">
            <a
              className="btn btn--whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={19} />
              Open WhatsApp
            </a>
            <button className="btn btn--ghost" type="button" onClick={copySummary}>
              <CopyIcon size={18} />
              Copy enquiry
            </button>
            <a className="btn btn--ghost" href={`tel:+${business.whatsappDigits}`}>
              Call instead
            </a>
          </div>

          <p className="copy-status" role="status" aria-live="polite">
            {copyStatus}
          </p>

          <p className="muted" style={{ marginTop: '1rem', fontSize: 'var(--step--1)' }}>
            This website does not create a booking reference and does not take payment.
            Your booking is confirmed only when {business.name} replies and agrees the
            vehicle and fare with you.
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  full?: boolean;
  className?: string;
  /**
   * Renders a fieldset/legend instead of a label/control pair. Radio groups need
   * this: a <label for> cannot point at a group of inputs, so the group is named
   * by a <legend> instead.
   */
  group?: boolean;
}

/**
 * Labelled field wrapper. Wires up the label, hint and error ids so assistive
 * technology announces the message along with the control.
 */
function Field({
  id,
  label,
  children,
  required = false,
  error,
  hint,
  full = false,
  className,
  group = false,
}: FieldProps) {
  const classes = [
    'field',
    full ? 'field--full' : '',
    error ? 'field--invalid' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelContent = (
    <>
      {label}
      {required && (
        <span className="field__required" aria-hidden="true">
          *
        </span>
      )}
      {required && <span className="visually-hidden"> (required)</span>}
    </>
  );

  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <>
      {group ? (
        <fieldset className={classes} aria-describedby={describedBy}>
          <legend className="field__label">{labelContent}</legend>
          {children}
        </fieldset>
      ) : (
        <div className={classes}>
          <label className="field__label" htmlFor={id} id={`${id}-label`}>
            {labelContent}
          </label>
          {children}
        </div>
      )}

      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <AlertIcon size={15} />
          {error}
        </p>
      )}
    </>
  );
}

/** Compact inline confirmation used on non-form pages. */
export function EnquiryConfirmedNote() {
  return (
    <p className="notice-box">
      <CheckCircleIcon size={18} />
      <span>
        <strong>Remember:</strong> sending an enquiry does not confirm a booking. The business
        will confirm availability, the vehicle and the fare with you on WhatsApp.
      </span>
    </p>
  );
}
