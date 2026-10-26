import { useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageHero } from '../components/PageHero';
import { BookingForm } from '../components/BookingForm';
import { WhatsAppButton } from '../components/Buttons';
import { CheckIcon, ShieldIcon } from '../components/Icons';
import { business } from '../content/business';
import { services, type ServiceId } from '../content/services';
import { breadcrumbSchema } from '../lib/structuredData';

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Booking enquiry', path: '/booking' },
];

const validServiceIds = new Set<string>(services.map((s) => s.id));

export function BookingPage() {
  // Lets service pages and ads deep-link straight into a pre-selected service,
  // e.g. /booking?service=airport-transfer
  const [params] = useSearchParams();
  const requested = params.get('service') ?? '';
  const initialService = validServiceIds.has(requested) ? (requested as ServiceId) : undefined;

  return (
    <>
      <Seo
        title="Booking Enquiry | Car Hire from Mumbra, Thane"
        description="Send a car hire or outstation taxi enquiry from Mumbra and Thane. Fill in your journey details and the enquiry opens in WhatsApp, ready to send."
        path="/booking"
        structuredData={breadcrumbSchema(trail)}
      />

      <PageHero
        eyebrow="Booking enquiry"
        title="Send your journey details"
        intro="Fill in the form and your details are turned into a WhatsApp message you can send to the business in one tap. Nothing is booked or charged until you and the business agree on the vehicle and the fare."
        trail={trail}
      />

      <section className="section">
        <div className="container">
          <div className="split split--wide-left">
            <div>
              <h2>What happens when you send this</h2>
              <ul className="card__list" style={{ marginTop: '1.25rem', fontSize: 'var(--step-0)' }}>
                <li>
                  <CheckIcon size={16} />
                  Your details are formatted into a clear message and opened in WhatsApp.
                </li>
                <li>
                  <CheckIcon size={16} />
                  {business.name} replies on WhatsApp with the vehicle and the fare.
                </li>
                <li>
                  <CheckIcon size={16} />
                  The booking is confirmed only once you agree to those terms.
                </li>
                <li>
                  <CheckIcon size={16} />
                  The site stores nothing. Your details are not saved on this website.
                </li>
              </ul>

              <div className="notice-box" style={{ marginTop: '1.75rem' }}>
                <ShieldIcon size={18} />
                <p>
                  <strong>No payment is taken here.</strong> This website does not collect card
                  details, and it does not issue booking references. Please confirm all charges
                  directly with the business.
                </p>
              </div>

              <h3 style={{ marginTop: '2.25rem' }}>Prefer to message directly?</h3>
              <p className="muted" style={{ marginTop: '0.6rem' }}>
                You can start a WhatsApp conversation without filling in anything first.
              </p>
              <div style={{ marginTop: '1.15rem' }}>
                <WhatsAppButton
                  message={`Hello ${business.name}, I would like to enquire about a car booking.`}
                  label="Chat on WhatsApp"
                />
              </div>

              <h3 style={{ marginTop: '2.25rem' }}>Fields marked with * are required</h3>
              <p className="muted" style={{ marginTop: '0.6rem' }}>
                Everything else is optional, but the more you tell us, the more accurately the
                business can quote for your journey.
              </p>
            </div>

            <div>
              <BookingForm initialService={initialService} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
