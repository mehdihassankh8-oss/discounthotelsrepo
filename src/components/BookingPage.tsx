import React, { useState } from 'react';
import { Hotel, RoomType, SearchCriteria } from '../types/hotel';
import { CustomerBooking } from '../types/user';
import { SupportedCurrency, formatPrice } from '../services/currency';
import { guestsLine, niceDate, nightsBetween, plural } from '../services/stay';
import { AuthService } from '../services/authService';
import { createBooking, newIdempotencyKey } from '../services/qloApi';
import { BANK, CONTACT, waLink } from '../data/contact';
import { HotelPhoto, Stars } from './DcBits';

interface BookingPageProps {
  hotel: Hotel;
  room: RoomType;
  qty: number;
  criteria: SearchCriteria;
  currency: SupportedCurrency;
  /** "← Change room": back to the hotel page's room list. */
  onChangeRoom: () => void;
  onBackToHotels: () => void;
  onViewBooking: () => void;
  onOpenFaq: () => void;
}

interface Guest {
  name: string;
  company: string;
  phone: string;
  email: string;
  bed: string;
  flight: string;
  req: string;
}

interface Submitted {
  ref: string;
  total: number;
  issued: string;
  guest: Guest;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  hotel,
  room,
  qty,
  criteria,
  currency,
  onChangeRoom,
  onBackToHotels,
  onViewBooking,
  onOpenFaq,
}) => {
  const user = AuthService.getStoredUser();
  const [guest, setGuest] = useState<Guest>({
    name: user?.fullName || '',
    company: '',
    phone: user?.mobile || '',
    email: user?.email || '',
    bed: 'King',
    flight: '',
    req: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Submitted | null>(null);

  const fmt = (n: number) => formatPrice(n, currency);
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const sub = room.publicRatePKR * nights * qty;
  const set = (k: keyof Guest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setGuest((g) => ({ ...g, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    const parts = guest.name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || firstName;
    if (!firstName || !guest.email.trim() || !guest.phone.trim()) {
      setError('Please enter your name, mobile number and email.');
      return;
    }

    setBusy(true);
    const created: { bookingId: number | null; totalPrice: number | null }[] = [];
    try {
      // The backend books one room per call and re-checks live availability and price each time.
      for (let i = 0; i < qty; i++) {
        created.push(
          await createBooking({
            hotelId: Number(hotel.id),
            roomTypeId: Number(room.id),
            dateFrom: criteria.checkIn,
            dateTo: criteria.checkOut,
            adults: criteria.adultsCount,
            children: criteria.childrenCount,
            guest: { firstName, lastName, email: guest.email.trim(), phone: guest.phone.trim() },
            idempotencyKey: newIdempotencyKey(),
            hotelName: hotel.name,
          }),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not complete the booking.';
      setError(
        created.length > 0
          ? `${created.length} of ${qty} rooms were booked (ref ${created.map((c) => c.bookingId).join(', ')}), but the rest failed: ${msg} Please contact us on WhatsApp before trying again.`
          : msg,
      );
      setBusy(false);
      return;
    }

    const ids = created.map((c) => c.bookingId).filter((x) => x !== null);
    const real = created.reduce((s, c) => s + (c.totalPrice ?? 0), 0);
    const ref = ids.length ? `DH-${ids.join('-')}` : `DH-KHI-${Math.floor(10000 + Math.random() * 90000)}`;
    const total = real > 0 ? Math.round(real) : sub;

    if (!user?.serverAuth) {
      const local: CustomerBooking = {
        id: ref,
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelImage: hotel.heroImage,
        area: hotel.area,
        starCategory: hotel.starCategory,
        roomName: room.name,
        checkIn: criteria.checkIn,
        checkOut: criteria.checkOut,
        nights,
        guests: criteria.adultsCount + criteria.childrenCount,
        roomsCount: qty,
        totalPricePKR: total,
        status: 'pending',
        pmsReservationCode: ids.length ? `QLO-${ids.join('-')}` : 'PENDING',
        pmsRatePlanCode: 'B2B-DIRECT',
        taxAmountPKR: 0,
        canCancelFree: true,
        freeCancellationDeadline: 'Up to 24h prior to 14:00 arrival',
      };
      AuthService.saveBookings([local, ...AuthService.getBookings()]);
    }

    setDone({ ref, total, issued: new Date().toISOString().slice(0, 10), guest });
    setBusy(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stayLine = `${plural(nights, 'night')} / ${guestsLine(criteria.adultsCount, criteria.childrenCount)}`.toUpperCase();

  // =====================================================================
  // AWAITING CONFIRMATION + pro forma invoice with bank details
  // =====================================================================
  if (done) {
    const g = done.guest;
    const waReceipt = waLink(`Hi, I've made the bank transfer for booking ${done.ref}. Sharing the receipt here.`);
    const waRequest = waLink(
      [
        'Salam DiscountHotels.pk! I have just requested a booking and I am awaiting confirmation:',
        `• Booking Ref: ${done.ref}`,
        `• Hotel: ${hotel.name}`,
        `• Room: ${room.name} (${plural(qty, 'room')})`,
        `• Dates: ${criteria.checkIn} to ${criteria.checkOut} (${plural(nights, 'night')})`,
        `• Guest: ${g.name} (${g.phone})`,
        `• Bed: ${g.bed}`,
        g.flight ? `• Flight: ${g.flight}` : '',
        g.req ? `• Requests: ${g.req}` : '',
        `• Total: ${fmt(done.total)}`,
      ].filter(Boolean).join('\n'),
    );
    return (
      <div className="dc">
        <main className="wrap">
          <div className="inv-ok no-print" role="status">
            <strong>Booking request received. Awaiting confirmation.</strong> We're confirming your room with the hotel now and will message you on WhatsApp, usually within the hour. Your pro forma invoice is below; keep the invoice number for your bank transfer.
          </div>
          <div className="inv-tools no-print">
            <a href="/hotels" className="small" onClick={(e) => { e.preventDefault(); onBackToHotels(); }}>← Back to hotels</a>
            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
              <a className="btn btn-ghost" href={waRequest} target="_blank" rel="noopener noreferrer">Speed it up on WhatsApp</a>
              <a className="btn btn-ghost" href={waReceipt} target="_blank" rel="noopener noreferrer">Send transfer receipt on WhatsApp</a>
              {user && <button type="button" className="btn btn-ghost" onClick={onViewBooking}>View my bookings</button>}
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>Print or save as PDF</button>
            </div>
          </div>

          <article className="sheet">
            <header className="sh-head">
              <div>
                <div className="brand" style={{ color: '#fff', fontFamily: 'var(--serif)' }}>Discount<b style={{ fontWeight: 400, color: 'var(--brass-500)' }}>Hotels</b><small style={{ fontSize: '.72rem', marginLeft: '.15rem' }}>.pk</small></div>
                <div className="tag">HOTEL BOOKINGS &nbsp;|&nbsp; KARACHI</div>
              </div>
              <div className="meta">www.discounthotels.pk<br />{CONTACT.email}<br />WhatsApp {CONTACT.phoneLocal}</div>
            </header>
            <div className="sh-body">
              <div className="sh-title"><h1>PRO FORMA INVOICE</h1><span className="stay">{stayLine}</span></div>
              <p className="sh-sub">Hotel confirmation pending. Payment by bank transfer.</p>
              <dl className="kv">
                <div><dt>Guest / company</dt><dd>{g.name}{g.company && <><br />{g.company}</>}</dd></div>
                <div><dt>Invoice no.</dt><dd>{done.ref}</dd></div>
                <div><dt>Contact</dt><dd>{g.phone}<br />{g.email}</dd></div>
                <div><dt>Issue date</dt><dd>{niceDate(done.issued)}</dd></div>
                <div><dt>Check-in</dt><dd>{niceDate(criteria.checkIn)}{hotel.policies.checkInTime ? `, from ${hotel.policies.checkInTime}` : ''}</dd></div>
                <div><dt>Check-out</dt><dd>{niceDate(criteria.checkOut)}{hotel.policies.checkOutTime ? `, by ${hotel.policies.checkOutTime}` : ''}</dd></div>
              </dl>
              <div className="hotel-h">{hotel.name}, Karachi</div>
              <div className="hotel-sub">{room.name} | {plural(qty, 'room')} | {plural(criteria.adultsCount, 'adult')} | {g.bed} bed requested</div>

              <table className="t acc">
                <thead><tr><th>Accommodation package</th><th>Nightly rate</th><th>Nights</th><th>Rooms</th><th>Amount (PKR)</th></tr></thead>
                <tbody>
                  <tr>
                    <td>{room.name}<br /><span className="sub">DH package rate · taxes included</span></td>
                    <td>{Math.round(room.publicRatePKR).toLocaleString('en-PK')}</td>
                    <td>{nights}</td>
                    <td>{qty}</td>
                    <td>{Math.round(sub).toLocaleString('en-PK')}</td>
                  </tr>
                </tbody>
              </table>
              <div className="grand" style={{ marginTop: 14 }}><span>TOTAL PAYABLE</span><strong>{fmt(done.total)}</strong></div>

              <div className="two">
                <div>
                  <h2 className="sec">PAY BY BANK TRANSFER</h2>
                  <table className="bank2">
                    <tbody>
                      <tr><td>Bank</td><td>{BANK.bank}</td></tr>
                      <tr><td>Account title</td><td>{BANK.title}</td></tr>
                      {BANK.account && <tr><td>Account no.</td><td>{BANK.account}</td></tr>}
                      <tr><td>IBAN</td><td>{BANK.iban}</td></tr>
                      <tr><td>Reference</td><td>{done.ref}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h2 className="sec">AFTER YOU PAY</h2>
                  <p style={{ margin: 0 }}>Wait for our confirmation message, then transfer the total and send a photo of the receipt on WhatsApp to {CONTACT.phoneLocal} or email it to {CONTACT.email}. We'll reply with your hotel confirmation number.</p>
                </div>
              </div>

              <div className="notes">
                <p><strong>Booking terms:</strong> Check-in {hotel.policies.checkInTime || 'per hotel policy'}; check-out {hotel.policies.checkOutTime || 'per hotel policy'}. Cancellation follows the hotel's policy. Early arrival, late departure and personal extras are not included.</p>
                <p><strong>Pro forma only:</strong> This is not a tax invoice, payment receipt or confirmed reservation.</p>
              </div>
            </div>
            <footer className="sh-foot"><span>DiscountHotels.pk &nbsp;|&nbsp; Guest booking invoice</span><span>PKR &nbsp;|&nbsp; Page 1 of 1</span></footer>
          </article>
        </main>
      </div>
    );
  }

  // =====================================================================
  // BOOKING FORM (dchotels booking.html)
  // =====================================================================
  return (
    <div className="dc">
      <main className="wrap book-grid">
        <div>
          <p className="small">
            <a href="/hotels" onClick={(e) => { e.preventDefault(); onChangeRoom(); }}>← Change room</a>
          </p>
          <h1 style={{ fontSize: '2rem' }}>Your details</h1>
          <p className="muted">We'll send these to the hotel with your reservation. Nothing is charged now.</p>
          <form onSubmit={submit}>
            <div className="panel">
              <h2>Who's staying</h2>
              <div className="form-grid">
                <div className="f"><label htmlFor="bk-name">Full name (as on CNIC or passport)</label><input id="bk-name" required autoComplete="name" value={guest.name} onChange={set('name')} /></div>
                <div className="f"><label htmlFor="bk-company">Company <span className="muted">(optional)</span></label><input id="bk-company" autoComplete="organization" value={guest.company} onChange={set('company')} /><div className="hint">Shown on your invoice if you need it for expenses.</div></div>
                <div className="f"><label htmlFor="bk-phone">Mobile / WhatsApp</label><input id="bk-phone" type="tel" required placeholder="03xx xxx xxxx" autoComplete="tel" value={guest.phone} onChange={set('phone')} /></div>
                <div className="f"><label htmlFor="bk-email">Email</label><input id="bk-email" type="email" required autoComplete="email" value={guest.email} onChange={set('email')} /></div>
              </div>
            </div>
            <div className="panel">
              <h2>Make it yours</h2>
              <div className="form-grid">
                <div className="f"><label htmlFor="bk-bed">Bed preference</label><select id="bk-bed" value={guest.bed} onChange={set('bed')}><option>King</option><option>Twin</option></select><div className="hint">King-bed upgrade is free, subject to availability.</div></div>
                <div className="f"><label htmlFor="bk-flight">Arrival flight <span className="muted">(for airport pick-up)</span></label><input id="bk-flight" placeholder="e.g. PK 301, 21:40" value={guest.flight} onChange={set('flight')} /></div>
                <div className="f full"><label htmlFor="bk-req">Anything else?</label><textarea id="bk-req" rows={3} placeholder="High floor, early check-in, anniversary…" value={guest.req} onChange={set('req')} /></div>
              </div>
            </div>
            <div className="panel">
              <h2>Payment</h2>
              <label className="radio-card">
                <input type="radio" name="pay" defaultChecked />
                <span><strong>Bank transfer</strong><br /><span className="small muted">Once the hotel confirms, transfer the total to the account below and send the receipt on WhatsApp. Use your invoice number as the reference.</span></span>
              </label>
              <table className="bank">
                <tbody>
                  <tr><td>Bank</td><td>{BANK.bank}</td></tr>
                  <tr><td>Account title</td><td>{BANK.title}</td></tr>
                  {BANK.account && <tr><td>Account no.</td><td>{BANK.account}</td></tr>}
                  <tr><td>IBAN</td><td>{BANK.iban}</td></tr>
                  <tr><td>Amount</td><td>{fmt(sub)}</td></tr>
                </tbody>
              </table>
              <div className="notice" style={{ marginTop: '1.2rem' }}>Your room is held for 1 hour after we confirm availability. If payment hasn't arrived by then, we'll check with you before releasing it.</div>
            </div>
            <label className="small" style={{ display: 'flex', gap: '.6rem', margin: '0 0 1.2rem' }}>
              <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: 'var(--navy-800)' }} />
              <span>I agree to the hotel's cancellation policy and the <a href="/faq" onClick={(e) => { e.preventDefault(); onOpenFaq(); }}>booking terms</a>.</span>
            </label>
            {error && <div className="notice" role="alert" style={{ marginBottom: '1rem', borderLeftColor: 'var(--danger)', background: '#f8e9e6' }}>{error}</div>}
            <button className="btn btn-brass" type="submit" disabled={busy} style={{ padding: '1rem 2rem', opacity: busy ? 0.6 : 1 }}>
              {busy ? 'Sending your request…' : 'Request booking and get invoice'}
            </button>
          </form>
        </div>

        <aside className="summary">
          <HotelPhoto src={hotel.heroImage || hotel.photos[0]} label={hotel.name} />
          <div className="panel">
            <Stars n={hotel.starCategory} />
            <h3 style={{ margin: '.2rem 0' }}>{hotel.name}</h3>
            <p className="small muted">{hotel.address || 'Karachi'}</p>
            <table className="lines">
              <tbody>
                <tr><td>Check-in</td><td><strong>{niceDate(criteria.checkIn)}</strong>{hotel.policies.checkInTime && <><br /><span className="small muted">from {hotel.policies.checkInTime}</span></>}</td></tr>
                <tr><td>Check-out</td><td><strong>{niceDate(criteria.checkOut)}</strong>{hotel.policies.checkOutTime && <><br /><span className="small muted">by {hotel.policies.checkOutTime}</span></>}</td></tr>
                <tr><td>Guests</td><td>{guestsLine(criteria.adultsCount, criteria.childrenCount)}</td></tr>
                <tr className="sep"><td>{qty} × {room.name}<br /><span className="small muted">{Math.round(room.publicRatePKR).toLocaleString('en-PK')} × {plural(nights, 'night')}</span></td><td>{fmt(sub)}</td></tr>
                <tr><td>Taxes</td><td>Included</td></tr>
                <tr className="free-row"><td>King-bed upgrade, subject to availability</td><td>FREE</td></tr>
                <tr className="grand"><td>Total payable</td><td>{fmt(sub)}</td></tr>
              </tbody>
            </table>
          </div>
        </aside>
      </main>
    </div>
  );
};
