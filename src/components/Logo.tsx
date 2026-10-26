/**
 * Original mark for Ali Tours and Travels.
 *
 * The emblem is a road receding to a vanishing point inside a ring: two route
 * lines converge toward a horizon with a dashed centre line. It is drawn here as
 * inline SVG (rather than an image file) so it stays crisp at any size, can be
 * recoloured with `currentColor`, and costs no extra network request. It is an
 * original drawing, not derived from any existing travel company's branding.
 */

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** Decorative when the adjacent wordmark already names the business. */
  title?: string;
}

export function LogoMark({ size = 40, className, title }: LogoMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id="att-mark-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2dca0" />
          <stop offset="55%" stopColor="#e6c878" />
          <stop offset="100%" stopColor="#b48a30" />
        </linearGradient>
        <linearGradient id="att-mark-road" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <circle cx="24" cy="24" r="22.25" fill="none" stroke="url(#att-mark-gold)" strokeWidth="1.5" />

      {/* Horizon the road runs toward. */}
      <path
        d="M11.5 17.5c7.4 2.1 17.6 2.1 25 0"
        fill="none"
        stroke="url(#att-mark-gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Road edges in perspective. */}
      <path
        d="M13.5 39.5C15.4 30.6 19 22.6 23.2 15.6"
        fill="none"
        stroke="url(#att-mark-road)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M34.5 39.5C32.6 30.6 29 22.6 24.8 15.6"
        fill="none"
        stroke="url(#att-mark-road)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Dashed centre line, tapering with distance. */}
      <path
        d="M24 39.5V15.6"
        fill="none"
        stroke="url(#att-mark-gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="3.2 3.4"
      />

      {/* Vanishing point. */}
      <circle cx="24" cy="14.4" r="2.5" fill="url(#att-mark-gold)" />
    </svg>
  );
}

export interface LogoProps {
  size?: number;
  className?: string;
}

/** Mark plus wordmark, used in the header and footer. */
export function Logo({ size = 40, className }: LogoProps) {
  return (
    <span className={className ? `brand ${className}` : 'brand'}>
      <LogoMark size={size} className="brand__mark" />
      <span className="brand__text">
        <span className="brand__name">Ali Tours &amp; Travels</span>
        <span className="brand__sub">Mumbra · Thane</span>
      </span>
    </span>
  );
}
