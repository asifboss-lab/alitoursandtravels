import type { Faq } from '../content/faqs';

interface FaqAccordionProps {
  items: Faq[];
  /** Heading level for the questions, so the outline stays correct per page. */
  headingLevel?: 'h2' | 'h3';
}

/**
 * Uses the native <details>/<summary> disclosure element. It is keyboard
 * accessible and works with screen readers without any JavaScript, and it
 * degrades gracefully if scripts fail to load.
 */
export function FaqAccordion({ items, headingLevel = 'h3' }: FaqAccordionProps) {
  const Heading = headingLevel;

  return (
    <div className="faq">
      {items.map((item) => (
        <details className="faq__item" key={item.id}>
          <summary>
            <Heading style={{ margin: 0, font: 'inherit' }}>{item.question}</Heading>
          </summary>
          <div className="faq__answer">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
