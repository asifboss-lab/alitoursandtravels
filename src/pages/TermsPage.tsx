import { LegalPage } from './LegalPage';
import { PhotoCreditsList } from '../components/PhotoCredit';
import { business } from '../content/business';

export function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      seoTitle="Terms of Service"
      description={`The terms that apply when you use the ${business.name} website to enquire about car hire, car rental, airport transfers and outstation taxi services.`}
      path="/terms"
      intro="These terms cover the use of this website and how enquiries work. Terms for the travel service itself are agreed with the business before your journey."
      pendingApproval="The commercial terms for travel - including refund conditions, liability and the charges that apply to a cancelled journey - are being finalised and must be approved by the business before they are published. Until this page says otherwise, please confirm those conditions with the business on WhatsApp before you travel."
    >
      <h2>About this website</h2>
      <p>
        This website is operated for {business.name} ({business.address.full}). It exists to let
        you send a car hire or travel enquiry and to give you the contact details of the business.
      </p>

      <h2>This website is an enquiry service, not a booking system</h2>
      <p>
        Sending the booking enquiry form, or messaging on WhatsApp, starts a conversation. It does
        not create a booking, does not reserve a vehicle, and does not guarantee that a vehicle is
        available for your dates.
      </p>
      <p>
        A journey is only confirmed once {business.name} has replied and both you and the business
        have agreed the vehicle and the fare. This website does not issue booking references,
        confirmation numbers or tickets, and nothing on this website should be read as a
        confirmation of any journey.
      </p>

      <h2>Fares and charges</h2>
      <p>
        No fares are published on this website. Fares are quoted by {business.name} for each
        individual journey and depend on the distance, the vehicle, the travel dates and the type
        of trip. Tolls, parking, driver allowance, waiting charges, state permits and any
        applicable taxes may be charged in addition to the quoted fare.
      </p>
      <p>
        Please confirm with the business, before you travel, exactly what the quoted fare includes
        and whether any of the charges above apply to your journey.
      </p>

      <h2>Vehicle photographs on this website</h2>
      <p>
        Vehicle photographs on this website are illustrative. They show vehicle types or
        categories rather than a confirmed list of the vehicles available, and they are not
        photographs of the business's own fleet. Availability of any particular vehicle or model
        is always confirmed by the business for your specific dates.
      </p>

      <h2>Self-drive rentals</h2>
      <p>
        Self-drive availability depends on the vehicle and must be confirmed by the business.
        Where self-drive is arranged, the business may require documents or a deposit, and the
        applicable requirements will be explained to you before you agree.
      </p>

      <h2>Information you provide</h2>
      <p>
        You agree to provide accurate information about your journey, including the correct number
        of passengers and the amount of luggage. This matters because the vehicle arranged for you
        has to be suitable for your group and baggage. Please do not use the form to send
        sensitive personal information.
      </p>

      <h2>Acceptable use</h2>
      <p>When using this website, you agree not to:</p>
      <ul>
        <li>Submit false, misleading or automated enquiries</li>
        <li>Attempt to disrupt, overload or gain unauthorised access to the website</li>
        <li>Use the enquiry form to send unlawful, abusive or spam content</li>
        <li>Copy the website's content or branding for use elsewhere</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The design, text and original logo of this website belong to {business.name}. Photographs
        used on this website are licensed as credited below, and remain the property of their
        respective photographers.
      </p>
      <h3>Photograph credits</h3>
      <p>
        Each photograph on this website is used under the licence shown. The list below names the
        photographer, the licence and the source of every photograph used.
      </p>
      <PhotoCreditsList />

      <h2>Availability of this website</h2>
      <p>
        This website is provided as it is. It may be unavailable from time to time, and WhatsApp
        itself is a third-party service whose availability we do not control. If the form or
        WhatsApp is not working for you, please call the business on {business.phoneDisplay}.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, and any dispute would be subject to the
        jurisdiction of the courts in Maharashtra.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Message {business.name} on WhatsApp at{' '}
        {business.phoneDisplay} or write to {business.address.full}.
      </p>
    </LegalPage>
  );
}
