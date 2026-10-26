import type { ReactNode } from 'react';
import { Seo } from '../components/Seo';
import { PageHero } from '../components/PageHero';
import { AlertIcon, InfoIcon } from '../components/Icons';
import { business, WHATSAPP_URL } from '../content/business';
import { breadcrumbSchema } from '../lib/structuredData';

interface LegalPageProps {
  title: string;
  seoTitle: string;
  description: string;
  path: string;
  eyebrow: string;
  intro: string;
  /** Shown when the document still needs the owner's review before publishing. */
  pendingApproval?: string;
  children: ReactNode;
}

/**
 * Shared shell for policy documents.
 *
 * The `pendingApproval` notice exists because commercial terms - refunds,
 * cancellation charges, liability - must be decided by the business, not invented
 * here. Any document that needs that decision says so plainly at the top instead
 * of presenting a placeholder as a binding term.
 */
export function LegalPage({
  title,
  seoTitle,
  description,
  path,
  eyebrow,
  intro,
  pendingApproval,
  children,
}: LegalPageProps) {
  const trail = [
    { name: 'Home', path: '/' },
    { name: title, path },
  ];

  return (
    <>
      <Seo
        title={seoTitle}
        description={description}
        path={path}
        structuredData={breadcrumbSchema(trail)}
      />

      <PageHero eyebrow={eyebrow} title={title} intro={intro} trail={trail} />

      <section className="section">
        <div className="container-narrow">
          {pendingApproval && (
            <div className="notice-box" role="note" style={{ marginBottom: '2rem' }}>
              <AlertIcon size={18} />
              <p>
                <strong>Awaiting business approval.</strong> {pendingApproval}
              </p>
            </div>
          )}

          <div className="prose">{children}</div>

          <div className="notice-box" style={{ marginTop: '2.5rem' }}>
            <InfoIcon size={18} />
            <p>
              Questions about this page? Message {business.name} on WhatsApp at{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                {business.phoneDisplay}
              </a>
              .
            </p>
          </div>

          <p className="muted" style={{ marginTop: '1.5rem', fontSize: 'var(--step--1)' }}>
            Last updated: {new Date().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>
    </>
  );
}
