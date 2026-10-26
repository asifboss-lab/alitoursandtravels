import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageHero } from '../components/PageHero';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { WhatsAppButton } from '../components/Buttons';
import { CheckIcon, MapPinIcon, WhatsAppIcon } from '../components/Icons';
import { business } from '../content/business';
import { PhotoCredit } from '../components/PhotoCredit';
import { breadcrumbSchema } from '../lib/structuredData';

const trail = [
  { name: 'Home', path: '/' },
  { name: 'About us', path: '/about' },
];

export function AboutPage() {
  return (
    <>
      <Seo
        title="About Us | Car Hire Service in Tanwar Nagar, Mumbra"
        description={`${business.name} is a car hire and travel service in Tanwar Nagar, Mumbra, Thane, arranging local journeys, outstation trips and airport transfers.`}
        path="/about"
        structuredData={breadcrumbSchema(trail)}
      />

      <PageHero
        eyebrow="About us"
        title="A local car hire service in Mumbra"
        intro={`${business.name} arranges cars and drivers for local journeys, outstation trips and airport transfers. The office is in ${business.address.street}, ${business.address.locality}, in ${business.address.city}.`}
        trail={trail}
      />

      <section className="section">
        <div className="container">
          <div className="split">
            <div className="prose">
              <h2>What we do</h2>
              <p>
                We help people travel from {business.address.locality} and {business.address.city}
                — whether that is a short local journey, a full day of errands, a drop to the
                airport, or an outstation trip to another city. Enquiries come in on WhatsApp, and
                each journey is discussed individually so the right vehicle can be arranged.
              </p>
              <p>
                Because every journey is different, we do not publish fixed prices. The distance,
                the vehicle, the travel dates and whether you need a driver all affect the fare. We
                would rather quote accurately for your journey than advertise a number that does
                not apply to it.
              </p>

              <h2>How we work</h2>
              <p>
                Everything starts with a conversation. Tell us where you are starting from, where
                you are going, the date and time, how many people are travelling and how much
                luggage there is. From there the business confirms what can be arranged and what
                it will cost.
              </p>
              <p>
                If you would like a driver or you are considering self-drive, let us know. Driver
                requirements are easy to arrange; self-drive availability depends on the vehicle
                and is always confirmed by the business before anything is agreed.
              </p>

              <h2>Where we operate</h2>
              <p>
                Pickups are arranged in {business.serviceAreas.primary.join(' and ')} as standard.
                Journeys from {business.serviceAreas.additional.join(' and ')} and to other
                destinations are arranged depending on your requirements — send your details and
                the business will confirm.
              </p>

              <h2>Languages</h2>
              <p>
                You are welcome to enquire in English, Hindi or Marathi. Write to us in whichever
                language you are most comfortable with.
              </p>
            </div>

            <div>
              <figure className="figure">
                <ResponsiveImage name="vehicle-innova" sizes="(min-width: 62vw) 46vw, 92vw" />
                <figcaption>
                  Illustrative photograph of a vehicle type, not a photograph of a
                  specific vehicle offered by {business.name}.{' '}
                  <PhotoCredit name="vehicle-innova" />
                </figcaption>
              </figure>

              <div className="card" style={{ marginTop: '1.5rem' }}>
                <span className="card__icon">
                  <MapPinIcon size={22} />
                </span>
                <h3>Visit or contact us</h3>
                <address style={{ fontStyle: 'normal', color: 'var(--text-soft)' }}>
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
                <div className="card__foot">
                  <WhatsAppButton
                    message={`Hello ${business.name}, I would like to enquire about a car booking.`}
                    label="WhatsApp us"
                  />
                </div>
              </div>

              <div className="notice-box" style={{ marginTop: '1.5rem' }}>
                <CheckIcon size={18} />
                <p>
                  <strong>Please note:</strong> the vehicle photographs on this website are
                  illustrative and show vehicle types. They are not a confirmed list of the
                  vehicles available, and no fleet list is published because availability changes
                  from day to day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--raised">
        <div className="container">
          <div className="cta-band">
            <div className="cta-band__inner">
              <h2>Tell us about your journey</h2>
              <p>
                Send your pickup point, destination and travel date on WhatsApp. The business will
                reply with the vehicle and the fare.
              </p>
              <div className="btn-row">
                <WhatsAppButton
                  message={`Hello ${business.name}, I would like to enquire about a car booking.`}
                  label="Book Your Ride on WhatsApp"
                  variant="primary"
                />
                <Link className="btn btn--ghost" to="/booking">
                  <WhatsAppIcon size={17} />
                  Use the enquiry form
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
