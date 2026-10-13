// About us content (supplied by the client). Single source for the page, SEO and pre-rendered text.
export interface AboutSection {
  id: string;
  title: string;
  paragraphs: string[];
  /** Highlighted line shown under the paragraphs. */
  pull?: string;
}

export const ABOUT_INTRO = 'Built on over a decade of hotel industry experience.';

export const ABOUT_SECTIONS: AboutSection[] = [
  {
    id: 'story',
    title: 'Our Story: Built on Over a Decade of Hotel Industry Experience',
    paragraphs: [
      'With over 10 years of experience in the hotel industry, we have developed a deep understanding of hotel operations, pricing, hospitality, and what truly makes a stay worthwhile. Drawing on this experience and our established industry relationships, we founded Discount Hotels with a clear vision: to make premium hotel stays more accessible while offering guests greater value for their money.',
      'We understand that choosing a hotel is about more than finding a room at the lowest price. It is about the overall experience, the quality of service, and what you receive for what you pay.',
    ],
  },
  {
    id: 'value',
    title: 'Beyond the Lowest Price: The Value Matters',
    paragraphs: [
      'Online booking platforms make comparing hotel prices convenient, and some may advertise lower room rates. However, the lowest advertised price does not always represent the best overall value. Certain benefits, services, or added comforts may not be included in the original booking and can increase the total cost of your stay.',
      'At Discount Hotels, we take a more value-driven approach. Through our relationships with participating hotels, we offer specially negotiated rates and packages that may include additional benefits beyond the room itself. Our aim is to help you look beyond the initial price and choose an offer that delivers more for your money.',
    ],
    pull: "Because a better deal isn't just about paying less, it's about getting more value for what you pay.",
  },
  {
    id: 'hospitality',
    title: 'Premium Hospitality, Made More Accessible',
    paragraphs: [
      "We work with leading star-rated hotels across Karachi to make quality accommodation more affordable for a wide range of guests. Whether you're travelling for business, welcoming visiting family, planning a personal getaway, or arranging accommodation for employees and project teams, we help you explore suitable options at competitive rates.",
      'We cater to individuals, families, and corporate clients, combining our industry expertise with a straightforward booking experience to help you make informed decisions with confidence.',
    ],
  },
  {
    id: 'promise',
    title: 'Our Promise: Smarter Prices, Better Stays',
    paragraphs: [
      'At Discount Hotels, our goal is to bridge the gap between competitive pricing and a rewarding hotel experience. We believe that premium hospitality should offer more than a room at a good rate, it should deliver comfort, convenience, and genuine value.',
    ],
    pull: 'The same quality of hospitality. A smarter way to book. More value for your money.',
  },
];
