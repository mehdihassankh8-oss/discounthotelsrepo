import React from 'react';
import { Hotel, SearchCriteria } from '../types/hotel';
import { SupportedCurrency, formatPrice } from '../services/currency';
import { hotelPath } from '../seo/routes';
import { DcSearchBar } from './DcSearchBar';
import { HotelPhoto, Stars } from './DcBits';
import heroImg from '../assets/images/hero_karachi_luxury_hotel_1790359666743.jpg';
import cityLightsImg from '../assets/images/karachi_faisal_skyline_1790361002741.jpg';
import businessImg from '../assets/images/hotel_business_suite_faisal_1790359692518.jpg';
import beachImg from '../assets/images/karachi_clifton_waterfront_1790360986771.jpg';

interface HomePageProps {
  criteria: SearchCriteria;
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  currency: SupportedCurrency;
  onSearch: (patch: Partial<SearchCriteria>, hotelId?: string) => void;
  onOpenHotel: (hotel: Hotel) => void;
  onNavigate: (tab: string) => void;
}

/** Home page in the dchotels layout (hero + search, proof strip, hotels, city, trips, steps, FAQ prompt). */
export const HomePage: React.FC<HomePageProps> = ({ criteria, hotels, loading, error, currency, onSearch, onOpenHotel, onNavigate }) => {
  const featured = [...hotels].sort((x, y) => {
    if ((x.startingPricePKR > 0) !== (y.startingPricePKR > 0)) return x.startingPricePKR > 0 ? -1 : 1;
    if (!!x.isFeatured !== !!y.isFeatured) return x.isFeatured ? -1 : 1;
    return x.name.localeCompare(y.name);
  });
  const go = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(tab);
  };

  return (
    <div className="dc">
      <section className="hero" style={{ padding: 0 }}>
        <div className="hero-media"><img src={heroImg} alt="" fetchPriority="high" /></div>
        <div className="wrap hero-inner">
          <span className="eyebrow" style={{ color: 'var(--sand-300)' }}>Karachi · Star hotels only</span>
          <h1>The same rooms, <em>for less</em> than the front desk charges.</h1>
          <p className="lede">Star hotels across Karachi, for business trips, getaways and everything in between.</p>
          <DcSearchBar hotels={hotels} criteria={criteria} onSubmit={onSearch} />
          <div className="search-note">
            <span>No card needed</span>
            <span>Pay by bank transfer once we confirm</span>
            <span>Real people on WhatsApp, 9am to 11pm</span>
          </div>
        </div>
      </section>

      <div className="proof">
        <div className="wrap">
          <div><strong>Star Hotels</strong><span>all in Karachi</span></div>
          <div><strong>King bed</strong><span>free upgrade, subject to availability</span></div>
          <div><strong>Cancellation</strong><span>follows each hotel's own policy</span></div>
          <div><strong>Bank transfer</strong><span>no card needed to book</span></div>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">Where you can stay</span><h2>Karachi's best addresses</h2></div>
          </div>
          {error && featured.length === 0 ? (
            <div className="panel" role="status"><p className="muted" style={{ margin: 0 }}>We could not load the hotels just now. Please refresh, or message us on WhatsApp and we will find you a room.</p></div>
          ) : featured.length === 0 ? (
            <p className="muted" role="status">Loading hotels…</p>
          ) : (
            <div className="hotel-grid">
              {featured.map((h) => (
                <a
                  key={h.id}
                  className="hcard"
                  href={hotelPath(h)}
                  onClick={(e) => { e.preventDefault(); onOpenHotel(h); }}
                  aria-label={`View rooms at ${h.name}`}
                >
                  <HotelPhoto src={h.heroImage || h.photos[0]} label={h.name} />
                  <div className="body">
                    <Stars n={h.starCategory} />
                    <h3>{h.name}</h3>
                    <div className="loc">{h.address || 'Karachi'}</div>
                    <ul className="perks">
                      <li>Free king-bed upgrade, subject to availability</li>
                      <li>Pay by bank transfer, no card needed</li>
                    </ul>
                    <div className="price-row">
                      {h.startingPricePKR > 0 ? (
                        <div>
                          <div className="from">From</div>
                          <span className="price">{formatPrice(h.startingPricePKR, currency)}</span>{' '}
                          <span className="per">/ night, taxes included</span>
                        </div>
                      ) : (
                        <div className="small muted">{loading ? 'Checking rates…' : 'No rooms for these dates'}</div>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          <p style={{ marginTop: '2rem' }}>
            <a className="btn btn-ghost" href="/hotels" onClick={go('hotels')}>See all hotels and dates</a>
          </p>
        </div>
      </section>

      <section className="band-sand">
        <div className="wrap split">
          <div>
            <span className="eyebrow">Why book with us</span>
            <h2>Same hotel. Same room. A smaller bill.</h2>
            <p>We negotiate our prices with every hotel we work with, and the saving goes straight to you.</p>
            <p>Pick your dates, choose a room, and pay by bank transfer once the hotel confirms. No card, no surprises.</p>
            <a className="btn btn-primary" href="/hotels" onClick={go('hotels')}>Find your hotel</a>
          </div>
          <div className="city" style={{ gridTemplateColumns: '1fr' }}>
            <figure style={{ minHeight: 280 }}>
              <HotelPhoto src={businessImg} label="Karachi hotel room" />
            </figure>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">The city</span><h2>Karachi, whichever way you're here</h2></div>
            <p>A port city of twenty million that doesn't switch off. Pick a hotel near what you came for.</p>
          </div>
          <div className="city">
            <figure>
              <HotelPhoto src={cityLightsImg} label="City of Lights" />
              <figcaption><h3>City of Lights</h3><p>Mazar-e-Quaid after dark, Port Grand, late dinners on Burns Road. Stay central and everything is close.</p></figcaption>
            </figure>
            <figure>
              <HotelPhoto src={businessImg} label="Business hub" />
              <figcaption><h3>Business hub</h3><p>I.I. Chundrigar Road, the port and the banks. Business hotels are minutes away.</p></figcaption>
            </figure>
            <figure>
              <HotelPhoto src={beachImg} label="Beach city" />
              <figcaption><h3>Beach city</h3><p>Sea View at sunset and seafood at Do Darya. Pick a hotel near the water.</p></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="band-navy">
        <div className="wrap">
          <span className="eyebrow">However you travel</span>
          <h2 style={{ maxWidth: '22ch', marginBottom: '2rem' }}>We book for the boardroom, the honeymoon and everything between.</h2>
          <div className="trips">
            <div><span className="tag">For work</span><h3>Business trips</h3><p>Executive floors and lounge access. Add your company name when you book.</p></div>
            <div><span className="tag">For two</span><h3>Getaways</h3><p>Ask for the king bed and a high floor and we'll ask the hotel for you.</p></div>
            <div><span className="tag">For one</span><h3>Solo travel</h3><p>Single-occupancy rates are cheaper still. Airport pick-up means no haggling at arrivals at 3am.</p></div>
            <div><span className="tag">For everyone</span><h3>Families and groups</h3><p>Weddings, visits from abroad, team offsites. Ten rooms or more? Message us for a block rate.</p></div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <span className="eyebrow">How booking works</span>
          <h2 style={{ marginBottom: '2.2rem' }}>Four steps, no card</h2>
          <ol className="steps">
            <li><h3>Search your dates</h3><p>Pick dates and guests to see every hotel with rooms for your stay.</p></li>
            <li><h3>Choose a room</h3><p>Choose from 3, 4 and 5 star hotels, at a cheaper rate.</p></li>
            <li><h3>We confirm with the hotel</h3><p>Send your request and we confirm it with the hotel, then update you on WhatsApp and email.</p></li>
            <li><h3>Pay by bank transfer</h3><p>Send the receipt on WhatsApp. Your confirmation number follows straight after.</p></li>
          </ol>
        </div>
      </section>

      <section className="band-sand" style={{ padding: '64px 0' }}>
        <div className="wrap split">
          <div>
            <h2>Questions before you book?</h2>
            <p className="muted" style={{ margin: 0 }}>Most answers are in the FAQ. For anything else, a real person replies on WhatsApp.</p>
          </div>
          <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <a className="btn btn-ghost" href="/faq" onClick={go('faq')}>Read the FAQ</a>
            <a className="btn btn-primary" href="/contact" onClick={go('contact')}>Contact us</a>
          </div>
        </div>
      </section>
    </div>
  );
};
