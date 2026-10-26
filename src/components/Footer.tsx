import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { WhatsAppButton } from './Buttons';
import { business } from '../content/business';
import { services } from '../content/services';

const quickLinks = [
  { to: '/services', label: 'Our services' },
  { to: '/booking', label: 'Booking enquiry' },
  { to: '/about', label: 'About us' },
  { to: '/faq', label: 'Frequently asked questions' },
  { to: '/contact', label: 'Contact us' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy policy' },
  { to: '/terms', label: 'Terms of service' },
  { to: '/booking-policy', label: 'Booking & cancellation policy' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo size={38} />
            <p>
              {business.category}, based in {business.address.street}, {business.address.locality}.
              Enquiries are handled directly on WhatsApp.
            </p>
            <div style={{ marginTop: '1.25rem' }}>
              <WhatsAppButton
                message={`Hello ${business.name}, I would like to enquire about a car booking.`}
                label="Book on WhatsApp"
              />
            </div>
          </div>

          <div className="footer__col">
            <h2>Services</h2>
            <ul className="footer__links">
              {services.map((service) => (
                <li key={service.id}>
                  <Link to={`/services#${service.slug}`}>{service.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2>Quick links</h2>
            <ul className="footer__links">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>

            <h2 style={{ marginTop: '1.75rem' }}>Contact</h2>
            <ul className="footer__links">
              <li>
                <a
                  href={`https://wa.me/${business.whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`tel:+${business.whatsappDigits}`}>Call {business.phoneDisplay}</a>
              </li>
              <li>
                <address style={{ fontStyle: 'normal', color: 'var(--text-soft)' }}>
                  {business.address.full}
                </address>
              </li>
            </ul>
          </div>
        </div>

        <p className="footer__disclaimer">
          Vehicle photographs on this website are illustrative and show vehicle types, not a
          confirmed list of the vehicles available. Fares, availability, inclusions, tolls,
          parking, driver allowance, waiting charges and cancellation conditions are confirmed
          by {business.name} for each individual journey.
        </p>

        <div className="footer__bottom">
          <p>
            © {year} {business.name}. {business.address.full}
          </p>
          <ul className="footer__legal">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
