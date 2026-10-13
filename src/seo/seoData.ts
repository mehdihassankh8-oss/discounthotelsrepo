import type { Hotel } from '../types/hotel';
import { SITE_URL, hotelPath } from './routes';
import { FAQ_GROUPS } from '../data/faq';

export const BRAND = 'DiscountHotels.pk';
export const PHONE_E164 = '+923220957136';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface SeoConfig {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
  jsonLd?: Record<string, unknown>[];
}

// QloApps descriptions are HTML. Search snippets and JSON-LD need plain text.
export const plain = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const trim = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`);

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${SITE_URL}${it.path}`,
  })),
});

const hotelList = (hotels: Hotel[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Hotels in Karachi',
  itemListElement: hotels.map((h, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: h.name,
    url: `${SITE_URL}${hotelPath(h)}`,
  })),
});

export function buildSeo(tab: string, hotel: Hotel | null, area: string, hotels: Hotel[] = []): SeoConfig {
  const home = { name: 'Home', path: '/' };
  const lists = hotels.length ? [hotelList(hotels)] : [];

  switch (tab) {
    case 'hotels': {
      const place = area && area !== 'All Areas' ? `${area}, Karachi` : 'Karachi';
      return {
        title: `Hotels in ${place} – 3, 4 & 5 Star Negotiated Rates | ${BRAND}`,
        description: `Browse verified star hotels in ${place} with live availability and transparent nightly rates. Request your room on ${BRAND} and pay by bank transfer once the hotel confirms.`,
        path: '/hotels',
        jsonLd: [breadcrumbs([home, { name: 'Karachi Hotels', path: '/hotels' }]), ...lists],
      };
    }
    case 'hotel-detail': {
      if (!hotel) break;
      const path = hotelPath(hotel);
      const ld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: hotel.name,
        url: `${SITE_URL}${path}`,
        description: plain(hotel.description || '') ? trim(plain(hotel.description), 300) : undefined,
        image: hotel.heroImage && hotel.heroImage.startsWith('http') ? hotel.heroImage : undefined,
        telephone: PHONE_E164,
        address: {
          '@type': 'PostalAddress',
          streetAddress: hotel.address || undefined,
          addressLocality: 'Karachi',
          addressCountry: 'PK',
        },
        starRating: { '@type': 'Rating', ratingValue: hotel.starCategory },
        priceRange: hotel.startingPricePKR > 0 ? `From PKR ${Math.round(hotel.startingPricePKR).toLocaleString('en-US')} per night` : undefined,
      };
      // Only emit review data when real reviews exist. Never publish invented ratings.
      if (hotel.reviewCount > 0 && hotel.guestRating > 0) {
        ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: hotel.guestRating, reviewCount: hotel.reviewCount };
      }
      return {
        title: `${hotel.name}${hotel.area && hotel.area !== ('All Areas' as string) ? ` – ${hotel.area}` : ''}, Karachi | Book Direct | ${BRAND}`,
        description: trim(
          plain(hotel.description || '') || `Book ${hotel.name} in Karachi. Check live room availability and transparent nightly rates on ${BRAND}.`,
          158,
        ),
        path,
        image: hotel.heroImage && hotel.heroImage.startsWith('http') ? hotel.heroImage : undefined,
        jsonLd: [ld, breadcrumbs([home, { name: 'Karachi Hotels', path: '/hotels' }, { name: hotel.name, path }])],
      };
    }
    case 'about':
      return {
        title: `About Us – 10+ Years of Hotel Industry Experience | ${BRAND}`,
        description: `${BRAND} works with leading star-rated hotels across Karachi to offer specially negotiated rates and packages that deliver more value for your money.`,
        path: '/about',
        jsonLd: [
          { '@context': 'https://schema.org', '@type': 'AboutPage', name: `About ${BRAND}`, url: `${SITE_URL}/about` },
          breadcrumbs([home, { name: 'About Us', path: '/about' }]),
        ],
      };
    case 'faq':
      return {
        title: `FAQ – Booking, Bank Transfer Payment & Cancellation | ${BRAND}`,
        description: `Answers about booking Karachi star hotels with ${BRAND}: how it works, paying by bank transfer after confirmation, what is included and cancellations.`,
        path: '/faq',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((it) => ({
              '@type': 'Question',
              name: it.q,
              acceptedAnswer: { '@type': 'Answer', text: it.a },
            })),
          },
          breadcrumbs([home, { name: 'FAQ', path: '/faq' }]),
        ],
      };
    case 'contact':
      return {
        title: `Contact ${BRAND} – WhatsApp & Phone +92 322 0957136`,
        description: `Talk to the ${BRAND} reservations desk on WhatsApp or phone (+92 322 0957136) for hotel availability, group bookings and corporate stays in Karachi.`,
        path: '/contact',
        jsonLd: [
          { '@context': 'https://schema.org', '@type': 'ContactPage', name: `Contact ${BRAND}`, url: `${SITE_URL}/contact` },
          breadcrumbs([home, { name: 'Contact', path: '/contact' }]),
        ],
      };
    case 'booking':
      return { title: `Complete your booking | ${BRAND}`, description: 'Enter your details and request your room. Pay by bank transfer once the hotel confirms.', path: '/booking', noindex: true };
    case 'account':
      return { title: `My Account | ${BRAND}`, description: 'Manage your bookings and profile.', path: '/account', noindex: true };
  }
  return {
    title: `${BRAND} | Karachi Star Hotels at Negotiated Rates`,
    description: 'Book 3, 4 and 5 star hotels in Karachi at specially negotiated rates, with breakfast, airport transfers and more included. Request your room online and pay by bank transfer after the hotel confirms.',
    path: '/',
    jsonLd: lists,
  };
}
