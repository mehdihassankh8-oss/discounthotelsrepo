// FAQ content: single source for the FAQ page, its SEO structured data and the pre-rendered text.
export interface FaqItem {
  q: string;
  a: string;
}
export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
  /** Used instead of items when a section is a single policy statement. */
  note?: string;
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'booking',
    title: 'Booking',
    items: [
      {
        q: 'How is Discount Hotels cheaper than booking with the hotel?',
        a: "We negotiate our prices with each hotel and pass the saving on to you. It's the same hotel, the same room and the same service.",
      },
      { q: 'Which hotels can I book?', a: 'Prominent star hotels in Karachi only.' },
      {
        q: 'How do I make a booking?',
        a: "Search your dates, choose a room and fill in your details. We send your request to the hotel and confirm it with you on WhatsApp and email. Once the hotel confirms, you pay by bank transfer and we send your hotel confirmation number.",
      },
      {
        q: 'Do I need an account to book?',
        a: 'No, you can book as a guest. Signing in saves your details for next time and lets you see your bookings.',
      },
      {
        q: 'Can I book on WhatsApp instead?',
        a: "Yes. Send your dates, number of guests and the hotel you'd like to +92 322 0957136 and we'll do the rest.",
      },
    ],
  },
  {
    id: 'prices',
    title: 'Prices & payment',
    items: [
      {
        q: 'What does the price include?',
        a: 'It depends on the hotel and room. Many of our rates include buffet breakfast, airport pick-up and drop-off, a welcome drink, fruit on arrival, water and Wi-Fi. Each hotel page lists exactly what is included.',
      },
      {
        q: 'Is tax included in the price?',
        a: 'Room prices are shown before the 15% government tax, which appears as a separate line on the hotel page and at checkout. There is no booking fee and nothing else is added.',
      },
      {
        q: 'How do I pay?',
        a: 'By bank transfer, after the hotel confirms your room. We share the account details on WhatsApp once your booking is confirmed. Send a photo of the receipt on WhatsApp and we will send your confirmation.',
      },
      {
        q: 'Can I pay by card or at the hotel?',
        a: 'Not at the moment. Bank transfer keeps our rates low.',
      },
      {
        q: 'How long do I have to pay?',
        a: 'Your room is held for 1 hour after we confirm availability.',
      },
      {
        q: 'Can I book for my company?',
        a: 'Yes. Mention your company name in the special requests when you book, or message us on WhatsApp, and we will arrange it.',
      },
    ],
  },
  {
    id: 'stay',
    title: 'At the hotel',
    items: [
      {
        q: 'Is the king-bed upgrade guaranteed?',
        a: "We request it from the hotel with every booking and it's free. It's confirmed by the hotel subject to availability on the day.",
      },
      {
        q: 'How do airport transfers work?',
        a: "Send your flight number on WhatsApp at least 4 hours before landing. The hotel's driver meets you at arrivals.",
      },
      {
        q: 'What time is check-in and check-out?',
        a: 'Timings are subject to the hotel. Check-in is usually from 2pm and check-out by 12 noon.',
      },
      {
        q: 'Will the hotel know I booked through you?',
        a: "Your reservation is in your name at the front desk, like any other guest. You'll pay nothing at check-in except personal extras.",
      },
      { q: 'What should I bring to check-in?', a: 'Your CNIC or passport.' },
    ],
  },
  {
    id: 'changes',
    title: 'Changes & cancellation',
    items: [],
    note: "We follow each hotel's own change and cancellation policy.",
  },
];
