import { Seo } from '../components/Seo';
import { PageHero } from '../components/PageHero';
import { FaqAccordion } from '../components/FaqAccordion';
import { WhatsAppButton } from '../components/Buttons';
import { InfoIcon } from '../components/Icons';
import { business } from '../content/business';
import { faqs } from '../content/faqs';
import { breadcrumbSchema, faqSchema } from '../lib/structuredData';

const trail = [
  { name: 'Home', path: '/' },
  { name: 'FAQs', path: '/faq' },
];

export function FaqPage() {
  return (
    <>
      <Seo
        title="FAQs | Booking a Car from Mumbra, Thane"
        description="Answers about booking a car from Mumbra, outstation taxi services, one-way trips, airport pickup and drop, fares, self-drive rental and confirming a booking."
        path="/faq"
        structuredData={[faqSchema(faqs), breadcrumbSchema(trail)]}
      />

      <PageHero
        eyebrow="Frequently asked questions"
        title="Questions about booking a car"
        intro="Everything customers usually ask before sending an enquiry, including how fares are decided and what still needs confirming."
        trail={trail}
      />

      <section className="section">
        <div className="container">
          <div className="split split--wide-left" style={{ alignItems: 'start' }}>
            <div>
              <FaqAccordion items={faqs} headingLevel="h2" />
            </div>

            <aside>
              <div className="notice-box">
                <InfoIcon size={18} />
                <p>
                  <strong>Fares are always quoted per journey.</strong> Prices, availability,
                  inclusions, tolls, parking, driver allowance, waiting charges and cancellation
                  conditions are confirmed by {business.name} for the journey you are planning.
                  Nothing on this website is a quotation.
                </p>
              </div>

              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3>Still have a question?</h3>
                <p>
                  Ask on WhatsApp. Include your pickup point, destination and travel date and the
                  business will answer with the details for your specific journey.
                </p>
                <div className="card__foot">
                  <WhatsAppButton
                    message={`Hello ${business.name}, I have a question about booking a car. `}
                    label="Ask on WhatsApp"
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
