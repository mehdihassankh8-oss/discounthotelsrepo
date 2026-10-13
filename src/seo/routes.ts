// URL <-> screen mapping. Gives every main screen a real, shareable, crawlable URL.
export const SITE_URL: string = (
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SITE_URL ||
  (globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env?.VITE_SITE_URL ||
  'https://discounthotels.pk'
).replace(/\/$/, '');

export const TAB_PATHS: Record<string, string> = {
  home: '/',
  hotels: '/hotels',
  about: '/about',
  faq: '/faq',
  contact: '/contact',
  account: '/account',
};

// Screens that have a URL but are not public landing pages (kept out of the sitemap and prerendering).
export const PAGE_PATHS: Record<string, string> = { ...TAB_PATHS, booking: '/booking' };

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export const hotelPath = (h: { id: string; name: string }): string => `/hotel/${h.id}-${slugify(h.name)}`;

export function parsePath(pathname: string): { tab: string; hotelId?: string } {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const hotel = clean.match(/^\/hotel\/(\d+)(?:-.*)?$/);
  if (hotel) return { tab: 'hotel-detail', hotelId: hotel[1] };
  const entry = Object.entries(PAGE_PATHS).find(([, p]) => p === clean);
  return { tab: entry ? entry[0] : 'home' };
}
