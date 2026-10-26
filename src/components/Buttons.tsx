import { business, whatsappLink } from '../content/business';
import { WhatsAppIcon, PhoneIcon } from './Icons';

type Variant = 'primary' | 'whatsapp' | 'ghost';

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  variant?: Variant;
  className?: string;
  block?: boolean;
  /** Renders a smaller, header-appropriate button. */
  compact?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn btn--primary',
  whatsapp: 'btn btn--whatsapp',
  ghost: 'btn btn--ghost',
};

/**
 * The site's main conversion control. Links straight to wa.me with the message
 * pre-filled, so no JavaScript or backend is involved in starting an enquiry.
 */
export function WhatsAppButton({
  message,
  label = 'Book on WhatsApp',
  variant = 'whatsapp',
  className,
  block = false,
  compact = false,
}: WhatsAppButtonProps) {
  const classes = [variantClass[variant], block ? 'btn--block' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <a
      className={classes}
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      style={compact ? { minHeight: '2.6rem', padding: '0.55rem 1.1rem' } : undefined}
      // Screen readers announce the destination, which matters because the
      // visible label does not mention that WhatsApp opens in a new tab.
      aria-label={`${label} (opens WhatsApp in a new tab)`}
    >
      <WhatsAppIcon size={compact ? 16 : 19} />
      {label}
    </a>
  );
}

interface CallButtonProps {
  className?: string;
  compact?: boolean;
  label?: string;
  block?: boolean;
}

/**
 * Tap-to-call. Whether a call connects depends on the number itself, so the
 * label says "Call" rather than promising that voice calling is available.
 */
export function CallButton({
  className,
  compact = false,
  label = 'Call',
  block = false,
}: CallButtonProps) {
  return (
    <a
      className={['btn btn--ghost', block ? 'btn--block' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      href={`tel:+${business.whatsappDigits}`}
      style={compact ? { minHeight: '2.6rem', padding: '0.55rem 1.1rem' } : undefined}
      aria-label={`Call ${business.name} on ${business.phoneDisplay}`}
    >
      <PhoneIcon size={compact ? 16 : 19} />
      {label}
    </a>
  );
}

/** Persistent WhatsApp shortcut shown on every page. */
export function WhatsAppFab() {
  return (
    <a
      className="fab"
      href={whatsappLink(
        `Hello ${business.name}, I would like to enquire about a car booking.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${business.name} on WhatsApp (opens in a new tab)`}
    >
      <WhatsAppIcon size={22} />
      <span className="fab__label">WhatsApp</span>
    </a>
  );
}
