import { LegalPage } from './LegalPage';
import { business } from '../content/business';

export function BookingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Booking & Cancellation Policy"
      seoTitle="Booking & Cancellation Policy"
      description={`How bookings with ${business.name} are confirmed, and the status of the cancellation and refund conditions that apply to a confirmed journey.`}
      path="/booking-policy"
      intro="How an enquiry becomes a confirmed booking, and what to check before you travel."
      pendingApproval="The cancellation charges, refund conditions and notice periods for cancelling a confirmed journey have not been provided by the business yet. Rather than publish placeholder terms that could be mistaken for real ones, those conditions are left out until the business approves them. Please confirm the applicable conditions with the business on WhatsApp before you travel."
    >
      <h2>How a booking is made</h2>
      <ol>
        <li>
          <strong>You send an enquiry.</strong> Either through the booking form on this website,
          which opens WhatsApp with your journey details, or by messaging the business directly.
        </li>
        <li>
          <strong>The business reviews your journey.</strong> Your pickup point, destination,
          dates, passenger count and luggage are checked against what can be arranged.
        </li>
        <li>
          <strong>You receive the vehicle and the fare.</strong> The business replies on WhatsApp
          with the vehicle offered, the fare and what that fare includes.
        </li>
        <li>
          <strong>You confirm.</strong> The journey is confirmed only when you and the business
          have both agreed the vehicle and the fare. Until then, no vehicle is reserved.
        </li>
      </ol>

      <h2>What is not a confirmation</h2>
      <ul>
        <li>Submitting the enquiry form on this website</li>
        <li>Receiving an automated response, if any</li>
        <li>A conversation that has not yet agreed a vehicle and a fare</li>
      </ul>
      <p>
        This website does not issue booking references or confirmation numbers. If you have not
        received a reply from the business agreeing the vehicle and the fare, your journey is not
        confirmed.
      </p>

      <h2>Changes to a confirmed journey</h2>
      <p>
        If your plans change after a journey has been confirmed, message the business on WhatsApp
        as early as you can with the new details. Whether a change can be accommodated, and
        whether it affects the fare, depends on the vehicle and the timing. The business will tell
        you what is possible.
      </p>

      <h2>Cancellation and refunds</h2>
      <p>
        Cancellation charges, refund conditions and the notice period required to cancel a
        confirmed journey have not yet been approved by the business. They are therefore not
        stated on this page.
      </p>
      <p>
        <strong>
          Until this section is completed, please confirm the cancellation conditions with the
          business on WhatsApp before you travel.
        </strong>{' '}
        This is a placeholder section that will be replaced once the business supplies and approves
        its terms.
      </p>

      <h2>Charges that may apply</h2>
      <p>
        The fare quoted for a journey may not include every cost. The following may be charged in
        addition, depending on the journey:
      </p>
      <ul>
        <li>Toll charges</li>
        <li>Parking charges</li>
        <li>Driver allowance for outstation trips</li>
        <li>Waiting charges beyond any agreed free waiting period</li>
        <li>State permits or entry taxes where applicable</li>
      </ul>
      <p>
        Please confirm with the business, before you travel, which of these apply to your journey
        and whether they are already included in the quoted fare.
      </p>

      <h2>Airport transfers</h2>
      <p>
        For airport pickups and drops, please share your flight number, terminal and the time you
        would like to be picked up. Flight monitoring is not offered, so please tell the business
        if your flight timing changes.
      </p>

      <h2>Vehicles</h2>
      <p>
        The vehicle photographs on this website are illustrative and show vehicle types. The
        vehicle arranged for your journey is confirmed by the business, and any specific model you
        request is subject to availability for your dates.
      </p>

      <h2>Contact</h2>
      <p>
        To confirm, change or discuss any of the above, message {business.name} on WhatsApp at{' '}
        {business.phoneDisplay}.
      </p>
    </LegalPage>
  );
}
