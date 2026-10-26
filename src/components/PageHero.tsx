import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  intro: string;
  trail: { name: string; path: string }[];
  children?: ReactNode;
}

/** Standard header block for interior pages. */
export function PageHero({ eyebrow, title, intro, trail, children }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero__inner">
          <Breadcrumbs trail={trail} />
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
