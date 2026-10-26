import { Seo } from '../components/Seo';
import { PageHero } from '../components/PageHero';
import { WhatsAppButton, CallButton } from '../components/Buttons';
import { MapPinIcon, WhatsAppIcon, PhoneIcon, ClockIcon, LanguageIcon } from '../components/Icons';
import { business, WHATSAPP_URL } from '../content/business';
import { breadcrumbSchema, taxiServiceSchema } from '../lib/structuredData';

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Contact us', path: '/contact' },
];

/**
 * No verified GPS coordinates exist for the office, so instead of dropping a pin
 * at a guessed location the page embeds a Google Maps *search* for the address
 * and offers a direct link out. See the owner guide for replacing this with a
 * confirmed map embed once the exact location is known.
 */
const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  'Tanwar Nagar, Mumbra, Thane, Maharashtra 400612',
)}&output=embed`;

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contact Us | Mumbra, Thane"
        description={`Contact ${business.name} in Tanwar Nagar, Mumbra, Thane on WhatsApp or by phone at ${business.phoneDisplay} for car hire and taxi enquiries.`}
        path="/contact"
        structuredData={[taxiServiceSchema(), breadcrumbSchema(trail)]}
      />

      <PageHero
        eyebrow="Contact us"
        title="Get in touch"
        intro="WhatsApp is the fastest way to reach us. Send your journey details and the business will reply with the vehicle and the fare."
        trail={trail}
      >
        <div className="btn-row" style={{ marginTop: '1.75rem' }}>
          <WhatsAppButton
            message={`Hello ${business.name}, I would like to enquire about a car booking.`}
            label="Message on WhatsApp"
            variant="primary"
          />
          <CallButton label={`Call ${business.phoneDisplay}`} />
        </div>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="split split--wide-left">
            <div>
              <h2>Business details</h2>
              <dl className="contact-list" style={{ marginTop: '1.5rem' }}>
                <div className="contact-item">
                  <span className="contact-item__icon">
                    <MapPinIcon size={20} />
                  </span>
                  <div>
                    <dt>Office address</dt>
                    <dd>
                      <address style={{ fontStyle: 'normal' }}>
                        {business.name}
                        <br />
                        {business.address.street}
                        <br />
                        {business.address.locality}, {business.address.city}
                        <br />
                        {business.address.region} – {business.address.postalCode}
                        <br />
                        {business.address.country}
                      </address>
                    </dd>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item__icon">
                    <WhatsAppIcon size={20} />
                  </span>
                  <div>
                    <dt>WhatsApp</dt>
                    <dd>
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Message ${business.name} on WhatsApp at ${business.phoneDisplay} (opens in a new tab)`}
                      >
                        {business.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item__icon">
                    <PhoneIcon size={20} />
                  </span>
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a
                        href={`tel:+${business.whatsappDigits}`}
                        aria-label={`Call ${business.name} on ${business.phoneDisplay}`}
                      >
                        {business.phoneDisplay}
                      </a>
                      <p className="muted" style={{ fontSize: 'var(--step--1)', marginTop: '0.3rem' }}>
                        Voice calling depends on the number, so WhatsApp is the most reliable way
                        to reach us.
                      </p>
                    </dd>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item__icon">
                    <ClockIcon size={20} />
                  </span>
                  <div>
                    <dt>Service areas</dt>
                    <dd>
                      {business.serviceAreas.primary.join(', ')} as standard. Journeys from{' '}
                      {business.serviceAreas.additional.join(' and ')} and to other destinations
                      are arranged depending on your requirements.
                    </dd>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-item__icon">
                    <LanguageIcon size={20} />
                  </span>
                  <div>
                    <dt>Languages</dt>
                    <dd>{business.languages.join(' · ')}</dd>
                  </div>
                </div>
              </dl>

              <p className="muted" style={{ marginTop: '1.75rem', fontSize: 'var(--step--1)' }}>
                Office opening hours have not been published here. Send a message on WhatsApp and
                the business will respond when available.
              </p>
            </div>

            <div>
              <h2>Find us on the map</h2>
              <p className="muted" style={{ marginTop: '0.6rem', marginBottom: '1.25rem' }}>
                The map below searches for the address in {business.address.street},{' '}
                {business.address.locality}. A precise pin has not been published because the exact
                office location has not been confirmed, so please use the address above.
              </p>

              <div className="map-frame">
                <iframe
                  title={`Map search for ${business.address.street}, ${business.address.locality}, ${business.address.city}`}
                  src={mapEmbedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="btn-row" style={{ marginTop: '1.25rem' }}>
                <a
                  className="btn btn--ghost"
                  href={business.mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPinIcon size={18} />
                  Open in Google Maps
                </a>
              </div>

              <div className="card" style={{ marginTop: '1.75rem' }}>
                <h3>Before you send an enquiry</h3>
                <p>
                  It helps to include your pickup location, destination, travel date and time, the
                  number of passengers and how much luggage you have. With those details the
                  business can confirm the right vehicle and give you a fare.
                </p>
                <div className="card__foot">
                  <WhatsAppButton
                    message={`Hello ${business.name}, here are my journey details: `}
                    label="Send journey details"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
