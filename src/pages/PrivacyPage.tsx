import { LegalPage } from './LegalPage';
import { business } from '../content/business';

export function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      seoTitle="Privacy Policy"
      description={`How ${business.name} handles the information you enter in the booking enquiry form, and how WhatsApp is used to receive and answer enquiries.`}
      path="/privacy"
      intro={`This policy explains what happens to the information you enter when you use this website to enquire about a car. It is written in plain language so it is easy to check.`}
    >
      <h2>Who this policy is about</h2>
      <p>
        This website is operated for {business.name}, a car hire and travel service at{' '}
        {business.address.full}. It explains how information submitted through this website is
        handled.
      </p>

      <h2>What this website collects</h2>
      <p>
        This website has one form: the booking enquiry form. When you fill it in, you may provide:
      </p>
      <ul>
        <li>Your name</li>
        <li>Your WhatsApp or mobile number</li>
        <li>The service you are enquiring about</li>
        <li>Pickup location and destination</li>
        <li>Journey date, pickup time and return date where relevant</li>
        <li>Number of passengers</li>
        <li>Your preferred vehicle category and driver requirement</li>
        <li>Flight number for airport transfers, if you provide one</li>
        <li>Any additional requirements you choose to describe</li>
      </ul>
      <p>
        Please do not include sensitive personal information in the additional requirements field.
        If you need to discuss something confidential, contact the business directly rather than
        putting it in the form.
      </p>

      <h2>What this website does not collect</h2>
      <ul>
        <li>
          <strong>No payment information.</strong> This website does not ask for and does not
          process card numbers, bank details or UPI identifiers. No payments are taken on this
          website.
        </li>
        <li>
          <strong>No identity documents.</strong> Do not upload or send copies of identity
          documents through the form.
        </li>
        <li>
          <strong>No customer accounts.</strong> There is no login, registration or password.
        </li>
        <li>
          <strong>No tracking or advertising cookies.</strong> This website does not set
          advertising or analytics cookies.
        </li>
      </ul>

      <h2>Where your information goes</h2>
      <p>
        When you submit the form, your details are <strong>not</strong> saved on this website or
        sent to a database. Instead, the website formats your details into a text message and
        opens WhatsApp with that message ready to send to {business.phoneDisplay}.
      </p>
      <p>
        This means your enquiry travels through WhatsApp, which is operated by Meta. Once the
        message is sent, your information is handled under WhatsApp's own privacy terms and by{' '}
        {business.name} in order to answer your enquiry. You can see the message before you send
        it, and you choose whether to send it.
      </p>
      <p>
        Nothing you type into the form is placed into a public URL, sent to an advertising
        network, or shared with any third party other than WhatsApp as described above.
      </p>

      <h2>How your information is used</h2>
      <p>
        The information you send is used for one purpose: to understand your journey and reply
        with the availability, vehicle and fare for it. That may include contacting you on the
        number you provided to confirm or clarify details.
      </p>

      <h2>How long it is kept</h2>
      <p>
        This website keeps nothing, so there is no retention period on the website itself. How
        long {business.name} keeps WhatsApp conversations is decided by the business and is
        currently being confirmed. If you would like your conversation deleted, ask the business
        directly on WhatsApp.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You can use the website without filling in the form and message directly instead.</li>
        <li>You can close WhatsApp without sending the message at any point.</li>
        <li>
          You can ask the business to correct or delete the details you have sent by messaging
          them on {business.phoneDisplay}.
        </li>
        <li>
          Only fields marked as required are needed to process an enquiry. Optional fields can be
          left blank.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        This website is intended for adults arranging travel. It is not directed at children and
        does not knowingly collect information from them.
      </p>

      <h2>Map and font services</h2>
      <p>
        The contact page can display a map, which is provided by Google Maps. If the map loads,
        Google may receive your IP address and set its own cookies, governed by Google's privacy
        policy. Fonts used by this website are served from this website itself rather than from a
        third-party font service.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If this policy changes, the updated version will appear on this page with a new date at
        the bottom.
      </p>

      <h2>Contact</h2>
      <p>
        For any question about this policy, or about information you have sent, message{' '}
        {business.name} on WhatsApp at {business.phoneDisplay} or write to{' '}
        {business.address.full}.
      </p>
    </LegalPage>
  );
}
