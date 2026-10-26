import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { PhotoCredit } from '../components/PhotoCredit';
import { WhatsAppButton } from '../components/Buttons';
import { BookingForm } from '../components/BookingForm';
import { FaqAccordion } from '../components/FaqAccordion';
import { SectionHead } from '../components/SectionHead';
import {
  ArrowRightIcon,
  CarIcon,
  CheckIcon,
  ClockIcon,
  LanguageIcon,
  LuggageIcon,
  MapPinIcon,
  PlaneIcon,
  RouteIcon,
  ShieldIcon,
  WhatsAppIcon,
} from '../components/Icons';
import { business, whatsappLink } from '../content/business';
import { services } from '../content/services';
import { faqs } from '../content/faqs';
import { journeyCategories, processSteps, values } from '../content/site';
import { taxiServiceSchema } from '../lib/structuredData';

const serviceIcons: Record<string, React.ReactNode> = {
  'local-car-hire': <CarIcon size={22} />,
  'outstation-taxi': <RouteIcon size={22} />,
  'airport-transfer': <PlaneIcon size={22} />,
  'car-rental-chauffeur': <ClockIcon size={22} />,
};

const valueIcons: Record<string, React.ReactNode> = {
  'whatsapp-first': <WhatsAppIcon size={22} />,
  local: <MapPinIcon size={22} />,
  'details-first': <LuggageIcon size={22} />,
  'no-obligation': <ShieldIcon size={22} />,
  'fare-upfront': <CheckIcon size={22} />,
  language: <LanguageIcon size={22} />,
};

const heroMessage = `Hello ${business.name}, I would like to enquire about a car booking. Please let me know the availability and fare.`;

export function HomePage() {
  return (
    <>
      <Seo
        title="Car Hire in Mumbra & Thane | Outstation Taxi"
        description="Car hire, rentals and outstation taxi from Mumbra and Thane. Local journeys, airport transfers and one-way or round-trip travel. Enquire on WhatsApp."
        path="/"
        structuredData={taxiServiceSchema()}
      />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__media">
          <ResponsiveImage
            name="hero-fortuner"
            sizes="100vw"
            priority
            alt="A white SUV photographed from the front, standing in for the vehicle class used on outstation journeys"
          />
        </div>
        <div className="hero__scrim" aria-hidden="true" />

        {/*
          The hero photograph is licensed CC BY-SA, so its attribution has to be
          visible on the page itself rather than only in a hidden footer.
        */}
        <p className="hero__credit">
          <PhotoCredit
            name="hero-fortuner"
            prefix="Illustrative photograph:"
          />
        </p>

        <div className="container hero__content">
          <span className="eyebrow">{business.address.locality}, {business.address.city}</span>
          <h1 id="hero-heading">{business.tagline}</h1>
          <p className="hero__lede">
            Car hire, rentals, local travel and outstation journeys arranged from Mumbra and
            Thane. Tell us where you need to go and when, and we will take the details to{' '}
            {business.name} on WhatsApp for you.
          </p>

          <div className="btn-row hero__actions">
            <WhatsAppButton
              message={heroMessage}
              label="Book Your Ride on WhatsApp"
              variant="primary"
            />
            <Link className="btn btn--ghost" to="/services">
              Explore Our Services
              <ArrowRightIcon size={18} />
            </Link>
          </div>

          <div className="hero__meta">
            <span className="hero__meta-item">
              <MapPinIcon size={17} />
              {business.address.street}, {business.address.locality}
            </span>
            <span className="hero__meta-item">
              <ClockIcon size={17} />
              Enquiries answered on WhatsApp
            </span>
            <span className="hero__meta-item">
              <LanguageIcon size={17} />
              English · हिन्दी · मराठी
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <section className="section" aria-labelledby="services-heading">
        <div className="container">
          <SectionHead
            eyebrow="What we arrange"
            title="Car hire and travel, tailored to your journey"
            id="services-heading"
            description="Every service starts with an enquiry. Share the details of your journey and the business will confirm the vehicle and the fare with you directly."
          />

          <div className="grid grid--4">
            {services.map((service) => (
              <article className="card" key={service.id}>
                <span className="card__icon">{serviceIcons[service.id]}</span>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <div className="card__foot">
                  <Link className="link-inline" to={`/services#${service.slug}`}>
                    Read more
                    <ArrowRightIcon size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Why enquire here */}
      <section className="section section--raised" aria-labelledby="why-heading">
        <div className="container">
          <SectionHead
            eyebrow="Why enquire with us"
            title="A straightforward way to arrange a car"
            id="why-heading"
            description={`${business.name} is a local car hire and travel service. Here is what you can expect when you send an enquiry.`}
          />

          <div className="grid grid--3">
            {values.map((value) => (
              <article className="card" key={value.id}>
                <span className="card__icon">{valueIcons[value.id]}</span>
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Journey types */}
      <section className="section" aria-labelledby="journeys-heading">
        <div className="container">
          <SectionHead
            eyebrow="Popular journeys"
            title="Journeys customers often ask about"
            id="journeys-heading"
            description="These are the kinds of trips people enquire about most. They are enquiry starting points, not fixed-price packages, and every route and fare is confirmed for your specific journey."
          />

          <ul className="badge-row" style={{ marginBottom: '1.5rem' }}>
            <li className="pill">Enquiry-based</li>
            <li className="pill pill--muted">No fixed prices listed</li>
            <li className="pill pill--muted">Fare confirmed per journey</li>
          </ul>

          <div className="grid grid--3">
            {journeyCategories.map((journey) => (
              <article className="card" key={journey.id}>
                <h3>{journey.name}</h3>
                <p>{journey.description}</p>
                <div className="card__foot">
                  <a
                    className="link-inline"
                    href={whatsappLink(journey.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Enquire about ${journey.name} on WhatsApp (opens in a new tab)`}
                  >
                    Enquire on WhatsApp
                    <ArrowRightIcon size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Booking process */}
      <section className="section section--inset" aria-labelledby="process-heading">
        <div className="container">
          <SectionHead
            eyebrow="How it works"
            title="From enquiry to confirmed journey"
            id="process-heading"
            description="Four simple steps. You always know the vehicle and the fare before you travel."
          />

          <ol className="steps">
            {processSteps.map((step) => (
              <li className="step" key={step.step}>
                <span className="step__num" aria-hidden="true">
                  {step.step}
                </span>
                <h3>
                  <span className="visually-hidden">Step {step.step}: </span>
                  {step.title}
                </h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------------- Enquiry form */}
      <section className="section" id="enquiry" aria-labelledby="enquiry-heading">
        <div className="container">
          <div className="split split--wide-left">
            <div>
              <SectionHead
                eyebrow="Booking enquiry"
                title="Tell us about your journey"
                id="enquiry-heading"
                description="Fill in what you know and we will write it into a WhatsApp message for you. The form changes to ask for the right details based on the service you choose."
              />

              <ul className="card__list" style={{ marginTop: 0, fontSize: 'var(--step-0)' }}>
                <li>
                  <CheckIcon size={16} />
                  No account, no payment details, no card information.
                </li>
                <li>
                  <CheckIcon size={16} />
                  Your details go straight to {business.name} on WhatsApp.
                </li>
                <li>
                  <CheckIcon size={16} />
                  You see the exact message before it is sent.
                </li>
                <li>
                  <CheckIcon size={16} />
                  Nothing is reserved or charged until you agree.
                </li>
              </ul>

              <div className="notice-box" style={{ marginTop: '1.75rem' }}>
                <ShieldIcon size={18} />
                <p>
                  <strong>Your enquiry is not a confirmed booking.</strong> Availability, the
                  vehicle and the fare are confirmed by the business for your specific journey.
                </p>
              </div>
            </div>

            <div>
              <BookingForm />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ FAQ */}
      <section className="section section--raised" aria-labelledby="faq-heading">
        <div className="container">
          <SectionHead
            eyebrow="Questions"
            title="Frequently asked questions"
            id="faq-heading"
            description="The questions customers ask most before booking a car from Mumbra."
          />
          <FaqAccordion items={faqs.slice(0, 6)} />
          <p style={{ marginTop: '1.5rem' }}>
            <Link className="link-inline" to="/faq">
              Read all frequently asked questions
              <ArrowRightIcon size={15} />
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ Final CTA */}
      <section className="section" aria-labelledby="cta-heading">
        <div className="container">
          <div className="cta-band">
            <div className="cta-band__inner">
              <span className="eyebrow" style={{ justifyContent: 'center' }}>
                Ready when you are
              </span>
              <h2 id="cta-heading" style={{ marginTop: '0.9rem' }}>
                {business.tagline}
              </h2>
              <p>
                Send your pickup point, destination, date and passenger count on WhatsApp. The
                business will reply with the vehicle and the fare for your journey.
              </p>
              <div className="btn-row">
                <WhatsAppButton
                  message={heroMessage}
                  label="Book Your Ride on WhatsApp"
                  variant="primary"
                />
                <Link className="btn btn--ghost" to="/booking">
                  Use the enquiry form
                </Link>
              </div>
              <p className="cta-band__contact">
                WhatsApp or call {business.phoneDisplay} · {business.address.full}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
