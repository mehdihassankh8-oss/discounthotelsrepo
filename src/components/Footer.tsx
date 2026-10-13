import React from 'react';
import { Hotel } from '../types/hotel';
import { CONTACT, waLink } from '../data/contact';
import { hotelPath } from '../seo/routes';

interface FooterProps {
  hotels: Hotel[];
  onNavigate: (tab: string) => void;
  onOpenHotel: (hotel: Hotel) => void;
}

const linkClass = 'text-slate-300 hover:text-white transition-colors';
const headingClass = 'text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400 mb-4';

export const Footer: React.FC<FooterProps> = ({ hotels, onNavigate, onOpenHotel }) => {
  const go = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(tab);
  };

  return (
    <footer className="bg-[#060e1d] text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 text-sm">
          <div>
            <a href="/" onClick={go('home')} className="text-xl font-bold tracking-tight text-white">
              DiscountHotels<span className="text-amber-400">.pk</span>
            </a>
            <p className="mt-4 max-w-xs leading-relaxed text-slate-300">
              Karachi's star hotels for less than the front desk rate, for work, leisure or solo travel.
            </p>
            <span className="inline-block mt-5 px-3 py-1.5 text-xs border border-slate-700 rounded text-slate-300">
              Payment by bank transfer
            </span>
          </div>

          <nav aria-label="Hotels">
            <h4 className={headingClass}>Hotels</h4>
            <ul className="space-y-2.5">
              {hotels.slice(0, 7).map((h) => (
                <li key={h.id}>
                  <a
                    href={hotelPath(h)}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenHotel(h);
                    }}
                    className={linkClass}
                  >
                    {h.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="/hotels" onClick={go('hotels')} className={linkClass}>
                  All hotels
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h4 className={headingClass}>Company</h4>
            <ul className="space-y-2.5">
              <li><a href="/about" onClick={go('about')} className={linkClass}>About us</a></li>
              <li><a href="/faq" onClick={go('faq')} className={linkClass}>FAQ</a></li>
              <li><a href="/contact" onClick={go('contact')} className={linkClass}>Contact</a></li>
            </ul>
          </nav>

          <div>
            <h4 className={headingClass}>Talk to us</h4>
            <ul className="space-y-2.5">
              <li>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp {CONTACT.phoneLocal}
                </a>
              </li>
              <li>
                <a href={`tel:+${CONTACT.whatsapp}`} className={linkClass}>Call {CONTACT.phoneLocal}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className={linkClass}>{CONTACT.email}</a>
              </li>
              <li className="text-slate-300">{CONTACT.hours}</li>
            </ul>
          </div>
        </div>

        <p className="mt-12 pt-6 border-t border-slate-800 text-xs">
          © 2026 Discount Hotels · discounthotels.pk
        </p>
      </div>
    </footer>
  );
};
