/**
 * Frequently asked questions.
 *
 * Answers deliberately describe *how to enquire* and what still needs
 * confirming, rather than quoting prices or promising availability. Several
 * answers link straight into a pre-filled WhatsApp message.
 */

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    id: 'how-to-book',
    question: 'How can I book a car from Mumbra?',
    answer:
      'Send your journey details on WhatsApp using the booking button on this site, or fill in the booking enquiry form and it will open WhatsApp with your details already written out. You can also call the number if you prefer to speak to someone. Your enquiry is not a confirmed booking until the business replies and confirms the vehicle and fare.',
  },
  {
    id: 'outstation',
    question: 'Do you provide outstation taxi services?',
    answer:
      'Yes. Outstation journeys are arranged on enquiry from Mumbra and nearby pickup points, both one-way and round trip. Share your destination, travel date, number of passengers and luggage, and the business will confirm what can be arranged and the fare for that journey.',
  },
  {
    id: 'one-way',
    question: 'Can I request a one-way trip?',
    answer:
      'Yes, you can enquire about a one-way drop. Mention that you only need a one-way journey when you send your details, because the fare and vehicle for a one-way trip are quoted differently from a round trip.',
  },
  {
    id: 'airport',
    question: 'Do you provide airport pickup and drop-off?',
    answer:
      'Pickup and drop enquiries for Mumbai-area airports are accepted. Please include your flight number, terminal, pickup time, passenger count and luggage so the driver can be briefed properly. Flight monitoring is not offered, so do share any change in your flight timing.',
  },
  {
    id: 'fares',
    question: 'How are fares calculated?',
    answer:
      'Fares are quoted by the business for each individual journey and depend on the distance, the vehicle you choose, the travel dates and the trip type. Tolls, parking, driver allowance and waiting charges may be extra. Send your full journey details and the business will give you a quotation before you travel.',
  },
  {
    id: 'specific-vehicle',
    question: 'Can I request a specific vehicle?',
    answer:
      'You can tell us the vehicle category or the specific model you would prefer, and the business will confirm whether it is available for your dates. Please note that the vehicles shown on this website are illustrative photographs, not a confirmed list of the vehicles available.',
  },
  {
    id: 'self-drive',
    question: 'Is self-drive rental available?',
    answer:
      'Self-drive availability depends on the vehicle and must be confirmed by the business. Mention that you do not need a driver when you enquire, and the business will tell you whether self-drive can be arranged for your dates and what documents are required.',
  },
  {
    id: 'confirm',
    question: 'How do I confirm my booking?',
    answer:
      'Once you send your enquiry, the business will reply on WhatsApp to confirm availability, the vehicle and the fare. A booking is only confirmed after that reply. Submitting the form on this website does not by itself confirm a booking or reserve a vehicle.',
  },
  {
    id: 'cancellation',
    question: 'What are the cancellation conditions?',
    answer:
      'Cancellation and refund conditions are being finalised and will be published here once the business has approved them. Until then, please confirm the applicable conditions with the business on WhatsApp before you travel. See the Booking and Cancellation Policy page for details.',
  },
];
