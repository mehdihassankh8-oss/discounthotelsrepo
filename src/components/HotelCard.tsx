import React from 'react';
import { Hotel } from '../types/hotel';
import { SupportedCurrency, formatPrice } from '../services/currency';
import { plural } from '../services/stay';
import { hotelPath } from '../seo/routes';
import { HotelPhoto, Stars } from './DcBits';

interface HotelCardProps {
  hotel: Hotel;
  currency: SupportedCurrency;
  nightsCount: number;
  roomsCount: number;
  /** Open the hotel detail page (room list and Reserve). */
  onViewDetails: (hotel: Hotel) => void;
  loadingRates?: boolean;
  flag?: string;
}

/** Results row in the dchotels layout: photo, details, price and a "See rooms" button. */
export const HotelCard: React.FC<HotelCardProps> = ({ hotel, currency, nightsCount, roomsCount, onViewDetails, loadingRates, flag }) => {
  const nights = Math.max(1, nightsCount);
  const rooms = Math.max(1, roomsCount);
  const hasRate = hotel.startingPricePKR > 0;
  const total = hotel.startingPricePKR * nights * rooms;
  const cheapest = hotel.rooms.find((r) => r.publicRatePKR === hotel.startingPricePKR) || hotel.rooms[0];
  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewDetails(hotel);
  };
  const href = hotelPath(hotel);
  const perks = [
    ...hotel.facilities.slice(0, 2),
    'Free king-bed upgrade on request, subject to availability',
    'Pay by bank transfer, no card needed',
  ].slice(0, 4);

  return (
    <article className="rcard">
      <a href={href} onClick={open} aria-label={`View rooms at ${hotel.name}`}>
        <HotelPhoto src={hotel.heroImage || hotel.photos[0]} label={hotel.name} />
      </a>
      <div className="mid">
        {flag && (<><span className="flag brass">{flag}</span><br /></>)}
        <Stars n={hotel.starCategory} />
        <h2><a href={href} onClick={open}>{hotel.name}</a></h2>
        <div className="loc">{hotel.address || 'Karachi'}</div>
        <ul className="incl">
          {perks.map((p, i) => (
            <li key={p} className={i === 0 && hotel.facilities.length === 0 ? 'hl' : undefined}>{p}</li>
          ))}
        </ul>
        {cheapest && (
          <p className="small muted" style={{ margin: '.8rem 0 0' }}>
            {cheapest.name}{cheapest.bedType ? ` · ${cheapest.bedType}` : ''}
          </p>
        )}
      </div>
      <div className="side">
        {hasRate ? (
          <>
            <div className="small muted">{plural(nights, 'night')}, {plural(rooms, 'room')}</div>
            <div><span className="price">{formatPrice(total, currency)}</span></div>
            <div className="small muted">{formatPrice(hotel.startingPricePKR, currency)} per room per night · taxes included</div>
          </>
        ) : (
          <div className="small muted">{loadingRates ? 'Checking rates…' : 'No rooms for these dates'}</div>
        )}
        <a className="btn btn-primary" href={href} onClick={open}>See rooms</a>
      </div>
    </article>
  );
};
