interface SectionHeadProps {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  center?: boolean;
  /** Rendered as an h1 on pages where it is the top-level heading. */
  as?: 'h1' | 'h2';
}

/**
 * Consistent section heading: an eyebrow label, the heading itself, and an
 * optional supporting sentence. The heading id is what section landmarks point
 * at with aria-labelledby.
 */
export function SectionHead({
  eyebrow,
  title,
  description,
  id,
  center = false,
  as: Heading = 'h2',
}: SectionHeadProps) {
  const classes = center ? 'section-head section-head--center' : 'section-head';

  return (
    <div className={classes}>
      <span className="eyebrow">{eyebrow}</span>
      <Heading id={id} style={{ marginTop: '0.75rem' }}>
        {title}
      </Heading>
      {description && <p>{description}</p>}
    </div>
  );
}
