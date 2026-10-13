# DiscountHotels.pk

Karachi star-hotel booking site. React 19 + Vite + Tailwind CSS 4 front end that talks to your own backend (which in turn talks to QloApps). Guests search by dates, compare hotels, pick a room, and send a booking request. They pay by bank transfer after the hotel confirms.

## Quick start

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env      # then edit the values (see Configuration)
npm run dev               # http://localhost:3000
```

The site needs the backend API running (default `http://localhost:3001`). Without it the hotel list will not load.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build into `dist/`, then pre-renders SEO pages (needs the API running) |
| `npm run seo` | Re-generates SEO pages, `sitemap.xml` and `robots.txt` without rebuilding |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run lint` | Type-check (`tsc --noEmit`) |

## Configuration

Set these in `.env`:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL, e.g. `http://localhost:3001` |
| `VITE_SITE_URL` | Your live domain, e.g. `https://discounthotels.pk` (used for canonical links and sitemap) |
| `PRERENDER_API_URL` | Optional. API used only during SEO pre-rendering, if different from `VITE_API_BASE_URL` |

Other values to set in code:

- `src/data/contact.ts`: WhatsApp number, phone, email, opening hours, and the **bank account** (`BANK`: bank name, account title, IBAN, optional account number). Editing `BANK` updates the booking page and the invoice. Leave `account` empty to hide the "Account no." row.

## Customer flow

```
Home / Hotels search bar
        │
        ▼
  Hotels page  ──(hotel card, hotel name or "See rooms")──►  Hotel detail page
  (filters: hotel class, budget)                              (/hotel/<id>-<name>)
                                                                     │
                                                          choose room + count, click Reserve
                                                                     ▼
                                                              Booking page (/booking)
                                                      guest details → bank transfer details
                                                                     │
                                                          "Request booking and get invoice"
                                                                     ▼
                                                  Awaiting confirmation + pro forma invoice
                                                  (bank details, reference, WhatsApp, print)
```

- Every "view hotel" action opens the hotel detail page. There are no booking pop-ups.
- Reserve is the only entry to the booking page. Opening or refreshing `/booking` without a chosen room sends the guest back to the hotels list.
- Submitting the booking form calls `POST /api/bookings` once per room. The hotel confirms first, then the guest pays by bank transfer and sends the receipt on WhatsApp.

## Pages and components

| Screen | Component |
|---|---|
| Home | `HomePage` |
| Hotels (results) | `SearchResultsPage` with `HotelCard` |
| Hotel detail | `HotelDetailPage` |
| Booking and awaiting confirmation | `BookingPage` |
| About, FAQ, Contact | `AboutPage`, `FaqPage`, `ContactPage` |
| Account dashboard, sign-in | `CustomerDashboardPage`, `AuthModal` |
| Shared search bar (hotels and detail pages) | `DcSearchBar` |
| Photo and star helpers | `DcBits` |

`src/App.tsx` owns the shared state: search criteria (dates, guests), the hotel list with live availability (`useHotels`), the selected hotel, and the selected room for booking. Routes are defined in `src/seo/routes.ts`.

## Styling

Two styles live side by side:

- The site shell (navbar, footer, account, About, FAQ, Contact) uses Tailwind utility classes.
- The home, hotels, hotel detail and booking pages use the dchotels reference design. Its CSS is in `src/dchotels.css`, scoped under a `.dc` wrapper class so it does not affect the rest of the site. Fonts (Libre Caslon Text, Public Sans) are loaded in `index.html`.

To change how those four pages look, edit `src/dchotels.css`.

## Data and backend

All hotel data comes from the backend through `src/services/qloApi.ts`:

| Endpoint | Used for |
|---|---|
| `GET /api/hotels` | Hotel list (name, address, stars, check-in/out times, description) |
| `POST /api/availability` | Rooms and prices for the chosen dates and guests |
| `POST /api/bookings` | Create a booking request (one room per call) |
| `/api/auth/*`, `GET /api/my/bookings` | Sign-in and the account dashboard |

Prices are a single all-in amount per room per night (taxes included). The site does not show a separate tax line, crossed-out hotel rate or savings percentage, because the API does not return them.

Known gaps in the live data (see `src/services/hotelMapper.ts`):

- No hotel or room photos. Hotels without photos show a navy panel with the hotel name.
- No guest ratings or reviews, so none are shown.
- Company, bed preference, arrival flight and special requests entered on the booking form appear on the invoice and in the WhatsApp message only. They are not sent to QloApps.

## SEO

`npm run build` pre-renders home, `/hotels`, `/about`, `/faq`, `/contact` and one page per hotel, and writes `sitemap.xml` and `robots.txt`. `/account` and `/booking` are excluded (noindex). Run `npm run seo` after changing hotels in QloApps. Details in [SEO.md](SEO.md).

## Deployment

1. Set `VITE_API_BASE_URL` and `VITE_SITE_URL` in `.env`.
2. Make sure the API is running, then `npm run build`.
3. Upload the contents of `dist/` (including the hidden `.htaccess`) to your Apache web root.
4. Add the site to Google Search Console and submit `/sitemap.xml`.

## Project layout

```
src/
  App.tsx                  app state and screen switching
  components/              pages and UI (see table above)
  dchotels.css             dchotels-style CSS for hotels, detail and booking pages
  data/                    contact + bank details, about/faq text, area list
  hooks/                   useHotels (hotel list + availability), useSeo
  services/                qloApi, hotelMapper, authService, stay (date helpers), currency
  seo/                     routes and per-page SEO data
  types/                   Hotel, RoomType, SearchCriteria, user types
scripts/prerender.ts       SEO pre-rendering
```
