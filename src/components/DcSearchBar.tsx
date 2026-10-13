import React, { useEffect, useRef, useState } from 'react';
import { Hotel, SearchCriteria } from '../types/hotel';
import { addDaysIso, toIso, plural } from '../services/stay';

interface DcSearchBarProps {
  hotels: Hotel[];
  criteria: Pick<SearchCriteria, 'checkIn' | 'checkOut' | 'adultsCount' | 'childrenCount' | 'roomsCount'>;
  /** Hotel pre-selected in the "Where in Karachi" list. */
  hotelId?: string;
  /** Submit button text. */
  label?: string;
  onSubmit: (patch: Partial<SearchCriteria>, hotelId?: string) => void;
}

const Stepper: React.FC<{
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, sub, value, min, max, onChange }) => (
  <div className="stepper">
    <div>
      <strong>{label}</strong>
      {sub && <div className="small muted">{sub}</div>}
    </div>
    <div className="ctl">
      <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <output>{value}</output>
      <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  </div>
);

/**
 * The dchotels search bar: Where in Karachi / Check-in / Check-out / Guests / button.
 * Renders inside a `.dc` wrapper so the reference styles apply.
 */
export const DcSearchBar: React.FC<DcSearchBarProps> = ({ hotels, criteria, hotelId = '', label = 'Find hotels', onSubmit }) => {
  const today = toIso(new Date());
  const [hotel, setHotel] = useState(hotelId);
  const [checkIn, setCheckIn] = useState(criteria.checkIn);
  const [checkOut, setCheckOut] = useState(criteria.checkOut);
  const [adults, setAdults] = useState(criteria.adultsCount);
  const [children, setChildren] = useState(criteria.childrenCount);
  const [rooms, setRooms] = useState(criteria.roomsCount);
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  // Follow the shared search when it changes elsewhere (e.g. a different page updated it).
  useEffect(() => {
    setCheckIn(criteria.checkIn);
    setCheckOut(criteria.checkOut);
    setAdults(criteria.adultsCount);
    setChildren(criteria.childrenCount);
    setRooms(criteria.roomsCount);
  }, [criteria.checkIn, criteria.checkOut, criteria.adultsCount, criteria.childrenCount, criteria.roomsCount]);
  useEffect(() => setHotel(hotelId), [hotelId]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (fieldRef.current && !fieldRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const onCheckIn = (v: string) => {
    setCheckIn(v);
    if (v && (!checkOut || checkOut <= v)) setCheckOut(addDaysIso(v, 1));
  };
  const onAdults = (v: number) => {
    setAdults(v);
    if (rooms > v) setRooms(v);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || checkOut <= checkIn) return;
    onSubmit(
      { checkIn, checkOut, adultsCount: adults, childrenCount: children, roomsCount: rooms },
      hotel || undefined,
    );
  };

  return (
    <form className="search" onSubmit={submit} autoComplete="off">
      <div className="field dest">
        <label htmlFor="dc-s-h">Where in Karachi</label>
        <select id="dc-s-h" value={hotel} onChange={(e) => setHotel(e.target.value)}>
          <option value="">All star hotels</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="dc-s-in">Check-in</label>
        <input type="date" id="dc-s-in" value={checkIn} min={today} required onChange={(e) => onCheckIn(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="dc-s-out">Check-out</label>
        <input type="date" id="dc-s-out" value={checkOut} min={checkIn ? addDaysIso(checkIn, 1) : today} required onChange={(e) => setCheckOut(e.target.value)} />
      </div>
      <div className="field" ref={fieldRef}>
        <label>Guests</label>
        <button type="button" className="guests-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {plural(adults, 'adult')} · {plural(children, 'child', 'children')} · {plural(rooms, 'room')}
        </button>
        <div className={`guests-pop${open ? ' open' : ''}`}>
          <Stepper label="Adults" sub="Age 13+" value={adults} min={1} max={20} onChange={onAdults} />
          <Stepper label="Children" sub="Age 0 to 12" value={children} min={0} max={10} onChange={setChildren} />
          <Stepper label="Rooms" value={rooms} min={1} max={Math.min(10, adults)} onChange={setRooms} />
          <button type="button" className="btn btn-primary btn-block" style={{ marginTop: '.6rem' }} onClick={() => setOpen(false)}>Done</button>
        </div>
      </div>
      <button className="btn btn-brass" type="submit">{label}</button>
    </form>
  );
};
