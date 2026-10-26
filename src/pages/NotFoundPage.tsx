import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { WhatsAppButton } from '../components/Buttons';
import { business } from '../content/business';

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you were looking for could not be found. Use the links below to find car hire and taxi information for Mumbra and Thane."
        path="/404"
        noindex
      />

      <section className="section" style={{ minHeight: '60svh', display: 'grid', placeItems: 'center' }}>
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            Error 404
          </span>
          <h1 style={{ marginTop: '0.9rem' }}>This page could not be found</h1>
          <p className="lead" style={{ marginTop: '1rem' }}>
            The link may be out of date, or the address may have been typed slightly differently.
            You can still enquire about a car from {business.address.locality}.
          </p>

          <div className="btn-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <WhatsAppButton
              message={`Hello ${business.name}, I would like to enquire about a car booking.`}
              label="Book on WhatsApp"
              variant="primary"
            />
            <Link className="btn btn--ghost" to="/">
              Back to the homepage
            </Link>
          </div>

          <ul
            className="badge-row"
            style={{ justifyContent: 'center', marginTop: '2.5rem' }}
          >
            <li>
              <Link className="link-inline" to="/services">
                Our services
              </Link>
            </li>
            <li>
              <Link className="link-inline" to="/booking">
                Booking enquiry
              </Link>
            </li>
            <li>
              <Link className="link-inline" to="/contact">
                Contact us
              </Link>
            </li>
            <li>
              <Link className="link-inline" to="/faq">
                FAQs
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
