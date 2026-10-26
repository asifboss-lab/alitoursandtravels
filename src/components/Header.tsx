import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { WhatsAppButton, CallButton } from './Buttons';
import { CloseIcon, MenuIcon } from './Icons';
import { business } from '../content/business';

export const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/booking', label: 'Booking enquiry' },
  { to: '/about', label: 'About us' },
  { to: '/faq', label: 'FAQs' },
  { to: '/contact', label: 'Contact' },
];

const headerBookingMessage = `Hello ${business.name}, I would like to enquire about a car booking.`;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 12);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className={scrolled ? 'site-header site-header--scrolled' : 'site-header'}>
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label={`${business.name} - home`}>
          <Logo />
        </Link>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="nav__link"
              // aria-current is set by NavLink automatically via the callback.
              style={undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <CallButton compact className="header__call" label="Call" />
          <WhatsAppButton
            compact
            label="Book on WhatsApp"
            message={headerBookingMessage}
            className="header__whatsapp"
          />
          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label="Open navigation menu"
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="mobile-nav"
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="mobile-nav__bar">
            <Logo size={34} />
            <button
              type="button"
              className="nav-toggle"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <CloseIcon size={22} />
            </button>
          </div>

          <ul className="mobile-nav__list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="mobile-nav__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mobile-nav__contact">
            <WhatsAppButton
              block
              message={headerBookingMessage}
              label="Book on WhatsApp"
            />
            <CallButton block label={`Call ${business.phoneDisplay}`} />
          </div>
        </div>
      )}
    </header>
  );
}
