import React, { useMemo, useState } from 'react';
import { Hotel, SearchCriteria } from '../types/hotel';
import { SupportedCurrency } from '../services/currency';
import { guestsLine, nightsBetween, plural, shortDate } from '../services/stay';
import { DcSearchBar } from './DcSearchBar';
import { HotelCard } from './HotelCard';

interface SearchResultsPageProps {
  criteria: SearchCriteria;
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  currency: SupportedCurrency;
  onSearch: (patch: Partial<SearchCriteria>, hotelId?: string) => void;
  onViewHotelDetails: (hotel: Hotel) => void;
  onWhatsAppInquiry: (hotelName: string) => void;
  onBackToHome?: () => void;
}

type Sort = 'rec' | 'price' | 'stars';

// Same budget bands as the dchotels hotels page (price per room per night, tax included).
const BUDGETS = [
  { value: '0-30000', label: 'Under PKR 30,000', min: 0, max: 30000 },
  { value: '30000-45000', label: 'PKR 30,000 to 45,000', min: 30000, max: 45000 },
  { value: '45000-999999', label: 'PKR 45,000 and up', min: 45000, max: 999999 },
];

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  criteria,
  hotels,
  loading,
  error,
  currency,
  onSearch,
  onViewHotelDetails,
  onWhatsAppInquiry,
}) => {
  const [stars, setStars] = useState<number[]>([]);
  const [budgets, setBudgets] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('rec');
  const [pickedHotel, setPickedHotel] = useState('');

  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const toggle = <T,>(list: T[], v: T, set: (l: T[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const rows = useMemo(() => {
    const list = hotels.filter((h) => {
      if (stars.length && !stars.includes(h.starCategory)) return false;
      if (budgets.length) {
        const ok = BUDGETS.filter((b) => budgets.includes(b.value)).some(
          (b) => h.startingPricePKR > 0 && h.startingPricePKR >= b.min && h.startingPricePKR < b.max,
        );
        if (!ok) return false;
      }
      return true;
    });
    const priced = (h: Hotel) => (h.startingPricePKR > 0 ? 0 : 1); // hotels without rooms for the dates go last
    return list.sort((a, b) => {
      if (priced(a) !== priced(b)) return priced(a) - priced(b);
      if (sort === 'price') return a.startingPricePKR - b.startingPricePKR;
      if (sort === 'stars') return b.starCategory - a.starCategory || a.startingPricePKR - b.startingPricePKR;
      return (
        Number(!!b.isFeatured) - Number(!!a.isFeatured) ||
        b.starCategory - a.starCategory ||
        a.startingPricePKR - b.startingPricePKR
      );
    });
  }, [hotels, stars, budgets, sort]);

  const submit = (patch: Partial<SearchCriteria>, hotelId?: string) => {
    setPickedHotel(hotelId || '');
    onSearch(patch, hotelId);
  };

  return (
    <div className="dc">
      <div className="search-strip">
        <div className="wrap">
          <DcSearchBar hotels={hotels} criteria={criteria} hotelId={pickedHotel} label="Update" onSubmit={submit} />
        </div>
      </div>

      <main className="wrap results">
        <aside className="filters" aria-label="Filters">
          <h3>Filter by</h3>
          <fieldset>
            <legend>Hotel class</legend>
            {[5, 4, 3].map((s) => (
              <label key={s}>
                <input type="checkbox" checked={stars.includes(s)} onChange={() => toggle(stars, s, setStars)} /> {s} stars
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Your budget per night</legend>
            {BUDGETS.map((b) => (
              <label key={b.value}>
                <input type="checkbox" checked={budgets.includes(b.value)} onChange={() => toggle(budgets, b.value, setBudgets)} /> {b.label}
              </label>
            ))}
          </fieldset>
        </aside>

        <div>
          <div className="results-head">
            <div>
              <h1>{plural(rows.length, 'hotel')} in Karachi</h1>
              <div className="small muted">
                {shortDate(criteria.checkIn)} – {shortDate(criteria.checkOut)} · {plural(nights, 'night')} · {guestsLine(criteria.adultsCount, criteria.childrenCount)} · {plural(criteria.roomsCount, 'room')}
              </div>
            </div>
            <label className="small">
              Sort{' '}
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="rec">Our top picks</option>
                <option value="price">Lowest price first</option>
                <option value="stars">Stars (highest first)</option>
              </select>
            </label>
          </div>

          {error && hotels.length === 0 ? (
            <div className="panel" role="alert">
              <h2>We could not load the hotels just now</h2>
              <p className="muted">Please refresh, or message us on WhatsApp and we will find you a room.</p>
              <button type="button" className="btn btn-primary" onClick={() => onWhatsAppInquiry('a room in Karachi')}>Message us on WhatsApp</button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="panel" role="status"><p className="muted" style={{ margin: 0 }}>Loading hotels…</p></div>
          ) : rows.length === 0 ? (
            <div className="panel">
              <h2>No hotels match those filters</h2>
              <p className="muted">Clear a filter or message us on WhatsApp and we'll find you a room.</p>
              <button type="button" className="btn btn-primary" onClick={() => { setStars([]); setBudgets([]); }}>Clear filters</button>
            </div>
          ) : (
            <div id="list">
              {rows.map((h, i) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  currency={currency}
                  nightsCount={nights}
                  roomsCount={criteria.roomsCount}
                  loadingRates={loading}
                  flag={i === 0 && sort === 'rec' && h.startingPricePKR > 0 ? 'Best value for your dates' : undefined}
                  onViewDetails={onViewHotelDetails}
                />
              ))}
            </div>
          )}
          <p className="small muted">
            Prices are per room per night for your dates, taxes included. Pay by bank transfer once the hotel confirms your room.
          </p>
        </div>
      </main>
    </div>
  );
};
