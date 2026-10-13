import React, { useEffect, useMemo, useState } from 'react';
import { Hotel, RoomType, SearchCriteria } from '../types/hotel';
import { SupportedCurrency, formatPrice } from '../services/currency';
import { guestsLine, niceDate, nightsBetween, plural } from '../services/stay';
import { plain } from '../seo/seoData';
import { DcSearchBar } from './DcSearchBar';
import { HotelPhoto, Stars } from './DcBits';

interface HotelDetailPageProps {
  hotel: Hotel;
  /** Hotels for the "Where in Karachi" list in the search bar. */
  hotels: Hotel[];
  currency: SupportedCurrency;
  criteria: SearchCriteria;
  loadingRates: boolean;
  /** Re-check rates for new dates or guests without leaving this page. */
  onChangeStay: (patch: Partial<SearchCriteria>, hotelId?: string) => void;
  /** Reserve button: goes to the booking page. */
  onReserve: (hotel: Hotel, room: RoomType, qty: number) => void;
  onWhatsAppInquiry: (hotelName: string) => void;
  onBackToSearch: () => void;
  onBackToHome: () => void;
}

const PERSON = (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
    <circle cx="7" cy="4" r="3.2" />
    <path d="M0.5 16c0-3.9 2.9-6.5 6.5-6.5s6.5 2.6 6.5 6.5z" />
  </svg>
);

export const HotelDetailPage: React.FC<HotelDetailPageProps> = ({
  hotel,
  hotels,
  currency,
  criteria,
  loadingRates,
  onChangeStay,
  onReserve,
  onWhatsAppInquiry,
  onBackToSearch,
  onBackToHome,
}) => {
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const wantRooms = Math.max(1, criteria.roomsCount);
  const rooms = hotel.rooms;
  const fmt = (n: number) => formatPrice(n, currency);

  const cheapestId = useMemo(
    () => rooms.reduce<RoomType | null>((a, r) => (!a || r.publicRatePKR < a.publicRatePKR ? r : a), null)?.id,
    [rooms],
  );

  // One room type can be picked at a time, as on dchotels. Preselect the cheapest with the searched room count.
  const [pick, setPick] = useState<{ id: string; qty: number } | null>(null);
  useEffect(() => {
    const r = rooms.find((x) => x.id === cheapestId);
    setPick(r && r.availableRooms > 0 ? { id: r.id, qty: Math.min(5, wantRooms, r.availableRooms) } : null);
  }, [cheapestId, wantRooms, rooms]);

  const photos = [hotel.heroImage, ...hotel.photos].filter((p, i, a) => p && a.indexOf(p) === i).slice(0, 3);
  const blurb = plain(hotel.description || '');
  const includes = [
    ...hotel.facilities,
    'Free king-bed upgrade on request, subject to availability',
    'Pay by bank transfer, no card needed',
    'WhatsApp support before and during your stay',
  ];
  const pickedRoom = pick ? rooms.find((r) => r.id === pick.id) : undefined;
  const cancelHours = Math.max(0, ...rooms.map((r) => r.freeCancellationUntilHours));
  const hasRate = hotel.startingPricePKR > 0;

  return (
    <div className="dc">
      <main className="wrap">
        <div className="hotel-top">
          <div>
            <div className="crumbs" style={{ color: 'var(--muted)' }}>
              <a href="/" onClick={(e) => { e.preventDefault(); onBackToHome(); }} style={{ color: 'var(--muted)' }}>Home</a>
              {' / '}
              <a href="/hotels" onClick={(e) => { e.preventDefault(); onBackToSearch(); }} style={{ color: 'var(--muted)' }}>Karachi hotels</a>
              {' / '}
              <span>{hotel.name}</span>
            </div>
            <div>
              <Stars n={hotel.starCategory} /> <span className="small muted">{hotel.starCategory}-star hotel</span>
            </div>
            <h1>{hotel.name}</h1>
            <div className="muted">{hotel.address || 'Karachi'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {hasRate && (
              <div>
                <div className="from">Our price, from</div>
                <span className="price">{fmt(hotel.startingPricePKR)}</span>
                <div className="per">per night, taxes included</div>
              </div>
            )}
            <a className="btn btn-brass" href="#rooms" style={{ marginTop: '.6rem' }}>See rooms</a>
          </div>
        </div>

        <div className="gallery" style={photos.length < 2 ? { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' } : undefined}>
          {photos.length === 0 ? (
            <HotelPhoto label={hotel.name} />
          ) : (
            photos.map((src, i) => (
              <HotelPhoto key={src} src={src} label={i === 0 ? hotel.name : i === 1 ? 'Guest room' : 'Hotel'} />
            ))
          )}
        </div>

        <div className="hotel-cols">
          <div>
            {blurb && <p style={{ fontSize: '1.08rem' }}>{blurb}</p>}
            <h2 style={{ fontSize: '1.4rem', marginTop: '1.6rem' }}>What's included at this hotel</h2>
            <ul className="incl-grid">
              {includes.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <aside>
            <div className="aside-card dh-bonus">
              <h3>Booking with Discount Hotels</h3>
              <ul>
                <li>Free king-bed upgrade, subject to availability</li>
                <li>Pay by bank transfer, no card</li>
                <li>WhatsApp support before and during your stay</li>
              </ul>
            </div>
            <div className="aside-card">
              <h3>House rules</h3>
              <dl>
                <dt>Check-in</dt>
                <dd>{hotel.policies.checkInTime ? `From ${hotel.policies.checkInTime}` : 'On request'}</dd>
                <dt>Check-out</dt>
                <dd>{hotel.policies.checkOutTime ? `By ${hotel.policies.checkOutTime}` : 'On request'}</dd>
                {cancelHours > 0 && (<><dt>Free cancellation</dt><dd>Up to {cancelHours} hrs before</dd></>)}
                <dt>Payment</dt>
                <dd>Bank transfer</dd>
                <dt>Tax</dt>
                <dd>Included in the price</dd>
              </dl>
            </div>
          </aside>
        </div>

        <section id="rooms" style={{ padding: '48px 0 32px', scrollMarginTop: 80 }}>
          <h2>Choose your room</h2>
          <div id="hotel-search" style={{ marginBottom: 18 }}>
            <DcSearchBar hotels={hotels} hotelId={hotel.id} criteria={criteria} label="Check rates" onSubmit={onChangeStay} />
          </div>
          <div className="stay-bar">
            <span>
              Prices for <strong>{niceDate(criteria.checkIn)}</strong> to <strong>{niceDate(criteria.checkOut)}</strong> · {plural(nights, 'night')} · {guestsLine(criteria.adultsCount, criteria.childrenCount)}
            </span>
            <a href="#hotel-search" className="btn-link">Change dates</a>
          </div>

          {rooms.length === 0 ? (
            <div className="panel">
              <h2>{loadingRates ? 'Checking rates…' : 'No rooms for these dates'}</h2>
              {!loadingRates && (
                <>
                  <p className="muted">Try other dates above, or message us on WhatsApp and we'll find you a room.</p>
                  <button type="button" className="btn btn-primary" onClick={() => onWhatsAppInquiry(hotel.name)}>Message us on WhatsApp</button>
                </>
              )}
            </div>
          ) : (
            <table className="matrix" id="matrix">
              <thead>
                <tr>
                  <th>Room type</th>
                  <th>Sleeps</th>
                  <th>Price for {plural(nights, 'night')}</th>
                  <th>What you get</th>
                  <th>Rooms</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rooms.map((r, idx) => {
                  const maxQty = Math.min(5, r.availableRooms);
                  const rowQty = Math.max(1, Math.min(wantRooms, maxQty || 1));
                  const sub = r.publicRatePKR * nights * rowQty;
                  const isBest = r.id === cheapestId;
                  const sleeps = Math.max(1, Math.min(4, r.maxOccupancy || 2));
                  return (
                    <tr key={r.id} className={isBest ? 'best' : ''} data-room={r.id}>
                      <td>
                        {r.photos[0] && <HotelPhoto src={r.photos[0]} label={r.name} className="room-thumb" />}
                        {isBest && rooms.length > 1 && <span className="flag brass">Lowest price</span>}
                        <span className="room-name">{r.name}</span>
                        <div className="room-meta">{r.bedType ? `${r.bedType} · ` : ''}Non-smoking</div>
                      </td>
                      <td>
                        <span className="sleeps" title={`Sleeps ${sleeps}`}>{Array.from({ length: sleeps }, (_, i) => <React.Fragment key={i}>{PERSON}</React.Fragment>)}</span>
                      </td>
                      <td className="price-cell">
                        <span className="from">Our price</span>
                        <span className="price">{fmt(sub)}</span>
                        <span className="tax">taxes included · {plural(nights, 'night')}, {plural(rowQty, 'room')}</span>
                        <span className="small muted">{fmt(r.publicRatePKR)} per room per night</span>
                      </td>
                      <td>
                        <ul className="choices">
                          <li className="key">Free king-bed upgrade, subject to availability*</li>
                          <li className="key">Pay by bank transfer after we confirm</li>
                          {r.breakfastIncluded && <li className="key">Breakfast included</li>}
                          {r.freeCancellationUntilHours > 0 && <li className="key">Free cancellation up to {r.freeCancellationUntilHours} hours before</li>}
                          {r.keyFeatures.map((x) => <li key={x}>{x}</li>)}
                          {r.availableRooms > 0 && r.availableRooms <= 3 && <li>Only {r.availableRooms} left at this price</li>}
                        </ul>
                      </td>
                      <td>
                        <label className="sr-only" htmlFor={`q-${r.id}`}>Rooms</label>
                        <select
                          id={`q-${r.id}`}
                          disabled={maxQty === 0}
                          value={pick?.id === r.id ? pick.qty : 0}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            setPick(qty > 0 ? { id: r.id, qty } : null);
                          }}
                        >
                          {Array.from({ length: maxQty + 1 }, (_, i) => (
                            <option key={i} value={i}>
                              {i}{i ? `  (${fmt(r.publicRatePKR * nights * i)})` : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      {idx === 0 && (
                        <td className="reserve-col" rowSpan={rooms.length}>
                          <div className="reserve-box" id="reserve">
                            {pickedRoom && pick ? (
                              <>
                                <div className="sum">
                                  {pick.qty} × {pickedRoom.name}
                                  <strong>{fmt(pickedRoom.publicRatePKR * nights * pick.qty)}</strong>
                                  taxes included
                                </div>
                                <button type="button" className="btn btn-brass btn-block" onClick={() => onReserve(hotel, pickedRoom, pick.qty)}>
                                  Reserve
                                </button>
                                <ul>
                                  <li>Pay by bank transfer after we confirm</li>
                                  <li>No card needed</li>
                                  {pickedRoom.freeCancellationUntilHours > 0 && <li>Free cancellation up to {pickedRoom.freeCancellationUntilHours} hrs before</li>}
                                </ul>
                              </>
                            ) : (
                              <>
                                <p className="small muted" style={{ margin: '0 0 .7rem' }}>Choose a room to see your total.</p>
                                <button type="button" className="btn btn-primary btn-block" disabled style={{ opacity: 0.5 }}>Reserve</button>
                                <ul>
                                  <li>Takes 2 minutes</li>
                                  <li>Pay by bank transfer after we confirm</li>
                                  <li>No card needed</li>
                                </ul>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="small muted" style={{ marginTop: '1rem' }}>
            *King-bed upgrade is requested from the hotel at booking and confirmed subject to availability. Prices are final room prices with taxes included.
          </p>
        </section>
      </main>
    </div>
  );
};
