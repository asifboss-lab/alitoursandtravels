import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageHero } from '../components/PageHero';

import { ResponsiveImage } from '../components/ResponsiveImage';
import { PhotoCredit } from '../components/PhotoCredit';
import { WhatsAppButton } from '../components/Buttons';
import { ArrowRightIcon, CheckIcon, InfoIcon } from '../components/Icons';
import { business, whatsappLink } from '../content/business';
import { services } from '../content/services';
import { breadcrumbSchema, serviceListSchema } from '../lib/structuredData';

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Our services', path: '/services' },
];

export function ServicesPage() {
  return (
    <>
      <Seo
        title="Car Hire & Taxi Services in Mumbra, Thane"
        description="Local car hire, outstation taxi, airport transfers and car rental with or without a driver. Enquire from Mumbra and Thane on WhatsApp."
        path="/services"
        structuredData={[serviceListSchema(), breadcrumbSchema(trail)]}
      />

      <PageHero
        eyebrow="Our services"
        title="Car hire, rentals and outstation travel"
        intro={`${business.name} arranges local journeys, outstation trips, airport transfers and vehicle rentals from ${business.address.locality} and ${business.address.city}. Each service starts with an enquiry so the vehicle and fare can be confirmed for your journey.`}
        trail={trail}
      >
        <div className="btn-row" style={{ marginTop: '1.75rem' }}>
          <WhatsAppButton
            message={`Hello ${business.name}, I would like to enquire about your services.`}
            label="Book Your Ride on WhatsApp"
            variant="primary"
          />
          <Link className="btn btn--ghost" to="/booking">
            Use the booking form
          </Link>
        </div>
      </PageHero>

      <section className="section section--tight">
        <div className="container">
          <div className="notice-box">
            <InfoIcon size={18} />
            <p>
              <strong>No fares are listed on this website.</strong> Fares, availability,
              inclusions, tolls, parking, driver allowance, waiting charges and cancellation
              conditions are confirmed by {business.name} for each individual journey. Send your
              details and the business will quote you before you travel.
            </p>
          </div>
        </div>
      </section>

      {services.map((service, index) => (
        <section
          className={index % 2 === 1 ? 'section section--raised' : 'section'}
          id={service.slug}
          key={service.id}
          aria-labelledby={`${service.slug}-heading`}
        >
          <div className="container">
            <div className="split">
              {/* Alternate the media side so the page does not read as a list. */}
              <div style={index % 2 === 1 ? { order: 0 } : undefined}>
                <span className="eyebrow">Service {index + 1} of {services.length}</span>
                <h2 id={`${service.slug}-heading`} style={{ marginTop: '0.75rem' }}>
                  {service.name}
                </h2>
                <p className="lead" style={{ marginTop: '1rem' }}>
                  {service.description}
                </p>

                <ul className="card__list" style={{ marginTop: '1.5rem', fontSize: 'var(--step-0)' }}>
                  {service.details.map((detail) => (
                    <li key={detail}>
                      <CheckIcon size={16} />
                      {detail}
                    </li>
                  ))}
                </ul>

                <div className="btn-row" style={{ marginTop: '1.75rem' }}>
                  <a
                    className="btn btn--whatsapp"
                    href={whatsappLink(
                      `Hello ${business.name}, I would like to enquire about ${service.name}. My journey details are: `,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Enquire about ${service.name} on WhatsApp (opens in a new tab)`}
                  >
                    Enquire on WhatsApp
                  </a>
                  <Link className="btn btn--ghost" to="/booking">
                    Booking form
                    <ArrowRightIcon size={17} />
                  </Link>
                </div>
              </div>

              <figure className="figure" style={index % 2 === 1 ? { order: 1 } : undefined}>
                <ResponsiveImage
                  name={service.imageKey}
                  sizes="(min-width: 62rem) 46vw, 92vw"
                />
                <figcaption>
                  Illustrative photograph of this vehicle or journey type. It is not a
                  photograph of a specific vehicle offered by {business.name}.{' '}
                  <PhotoCredit name={service.imageKey} />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
      ))}

      <section className="section" aria-labelledby="service-cta-heading">
        <div className="container">
          <div className="cta-band">
            <div className="cta-band__inner">
              <h2 id="service-cta-heading">Not sure which service you need?</h2>
              <p>
                Describe your journey on WhatsApp - where you are starting from, where you are
                going, and when. The business will advise on the right vehicle and give you a
                fare for that journey.
              </p>
              <div className="btn-row">
                <WhatsAppButton
                  message={`Hello ${business.name}, I am not sure which service I need. My journey details are: `}
                  label="Describe my journey"
                  variant="primary"
                />
                <Link className="btn btn--ghost" to="/faq">
                  Read the FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
