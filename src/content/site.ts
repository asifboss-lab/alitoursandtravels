/**
 * Content for the homepage sections that are not services or FAQs.
 *
 * Every claim here is one the business can actually stand behind. There are no
 * ratings, no review counts, no "years of experience" and no "thousands of happy
 * customers" - those have not been provided and are not invented.
 */

export interface JourneyCategory {
  id: string;
  name: string;
  description: string;
  /** Used to pre-fill the WhatsApp message for this category. */
  whatsappMessage: string;
}

/**
 * Popular journeys people ask about. These are enquiry starting points, not
 * fixed-price packages or confirmed routes, and the UI labels them as such.
 */
export const journeyCategories: JourneyCategory[] = [
  {
    id: 'mumbai-airport',
    name: 'Mumbai Airport transfers',
    description: 'Pickup and drop enquiries for domestic and international terminals.',
    whatsappMessage:
      'Hello Ali Tours and Travels, I would like to enquire about an airport transfer. My flight details are: ',
  },
  {
    id: 'thane-mumbai-city',
    name: 'Thane & Mumbai city travel',
    description: 'Local journeys, meetings, appointments and city errands.',
    whatsappMessage:
      'Hello Ali Tours and Travels, I would like to enquire about a local journey in Thane or Mumbai. My pickup and drop details are: ',
  },
  {
    id: 'pune',
    name: 'Mumbai to Pune',
    description: 'One-way and round-trip enquiries on a frequently travelled route.',
    whatsappMessage:
      'Hello Ali Tours and Travels, I would like to enquire about a journey to Pune. My travel date, pickup point and passenger count are: ',
  },
  {
    id: 'lonavala',
    name: 'Lonavala & hill getaways',
    description: 'Weekend and short-trip enquiries for nearby hill destinations.',
    whatsappMessage:
      'Hello Ali Tours and Travels, I would like to enquire about a trip to Lonavala or a nearby hill destination. My dates and passenger count are: ',
  },
  {
    id: 'navi-mumbai',
    name: 'Navi Mumbai & Panvel',
    description: 'Pickup and drop enquiries across Navi Mumbai and Panvel.',
    whatsappMessage:
      'Hello Ali Tours and Travels, I would like to enquire about a journey to Navi Mumbai or Panvel. My pickup point and travel date are: ',
  },
  {
    id: 'pilgrimage',
    name: 'Shirdi, Nashik & pilgrimage routes',
    description: 'Multi-day and family pilgrimage travel enquiries.',
    whatsappMessage:
      'Hello Ali Tours and Travels, I would like to enquire about a pilgrimage journey. My destination, dates and passenger count are: ',
  },
];

export interface Value {
  id: string;
  title: string;
  body: string;
}

/** Reasons to enquire. All are process statements the business controls. */
export const values: Value[] = [
  {
    id: 'whatsapp-first',
    title: 'Booking that starts on WhatsApp',
    body: 'Send your journey details and get a reply from the business directly. No account, no sign-up and no payment details on this website.',
  },
  {
    id: 'local',
    title: 'Based in Mumbra, working in Thane',
    body: 'The office is in Tanwar Nagar, Mumbra, so pickups in and around Mumbra and Thane are straightforward to arrange.',
  },
  {
    id: 'details-first',
    title: 'Journey details agreed before you travel',
    body: 'You share the destination, date, timing, passengers and luggage up front, so the vehicle and fare can be confirmed for that specific journey.',
  },
  {
    id: 'no-obligation',
    title: 'An enquiry costs nothing',
    body: 'Submitting the form or sending a WhatsApp message simply starts a conversation. Nothing is reserved or charged until you and the business agree.',
  },
  {
    id: 'fare-upfront',
    title: 'Fare quoted before you commit',
    body: 'Fares are quoted per journey. Ask for a quotation and the business will confirm the amount, along with what is included, before you travel.',
  },
  {
    id: 'language',
    title: 'English, Hindi and Marathi',
    body: 'You are welcome to enquire in English, Hindi or Marathi, whichever you are most comfortable with.',
  },
];

export interface ProcessStep {
  step: number;
  title: string;
  body: string;
}

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: 'Share your journey',
    body: 'Fill in the booking enquiry form, or message on WhatsApp with your pickup point, destination, date and time, passengers and luggage.',
  },
  {
    step: 2,
    title: 'The business reviews it',
    body: 'Your details are checked against what can be arranged for your dates. If anything is unclear, you will be asked before anything is confirmed.',
  },
  {
    step: 3,
    title: 'You receive the vehicle and fare',
    body: 'The business replies on WhatsApp with the vehicle offered, the fare, and what is included such as tolls, parking and driver allowance.',
  },
  {
    step: 4,
    title: 'Confirm and travel',
    body: 'Once you agree to the vehicle and fare, the journey is confirmed and the pickup details are finalised.',
  },
];
