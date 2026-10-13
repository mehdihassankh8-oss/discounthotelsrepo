import React, { useMemo, useState } from 'react';
import { ChevronDown, MessageSquare, Search } from 'lucide-react';
import { FAQ_GROUPS } from '../data/faq';

interface FaqPageProps {
  onOpenContact: () => void;
}

const WHATSAPP_URL =
  'https://wa.me/923220957136?text=' +
  encodeURIComponent('Salam DiscountHotels.pk! I have a question about booking a hotel in Karachi.');

export const FaqPage: React.FC<FaqPageProps> = ({ onOpenContact }) => {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  // Filter questions by search text; hide groups that end up empty.
  const groups = useMemo(
    () =>
      FAQ_GROUPS.map((g) => ({
        ...g,
        items: term ? g.items.filter((it) => `${it.q} ${it.a}`.toLowerCase().includes(term)) : g.items,
        showNote: !term && !!g.note,
      })).filter((g) => g.items.length > 0 || g.showNote),
    [term],
  );

  return (
    <div className="bg-slate-50 text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      {/* HERO */}
      <section className="relative bg-[#071328] text-white pt-16 pb-16 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#1f365d_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
            <span>Home</span>
            <span>/</span>
            <span className="text-amber-400 font-semibold">FAQ</span>
          </div>
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Help</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display leading-[1.15]">
              Questions, answered.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              How booking works, paying by bank transfer and what is included.
            </p>
            <label htmlFor="faq-search" className="sr-only">Search the FAQ</label>
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search, e.g. breakfast, payment, airport"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="hidden lg:block lg:col-span-3">
          <nav aria-label="FAQ sections" className="sticky top-28 space-y-1 text-sm">
            {FAQ_GROUPS.map((g) => (
              <a
                key={g.id}
                href={`#faq-${g.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`faq-${g.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="block py-2 font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {g.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-9 space-y-8">
          {groups.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2" role="status">
              <h2 className="text-base font-bold text-slate-900">No answers match "{query}"</h2>
              <p className="text-sm text-slate-500">Try another word, or ask us on WhatsApp and a person will reply.</p>
            </div>
          )}

          {groups.map((g) => (
            <section key={g.id} id={`faq-${g.id}`} className="scroll-mt-28">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight mb-3">{g.title}</h2>
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {g.items.map((it) => (
                  <details key={it.q} className="group" open={!!term}>
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 sm:px-6 py-4 text-sm sm:text-base font-semibold text-slate-900 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      <span>{it.q}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="px-5 sm:px-6 pb-5 -mt-1 text-sm text-slate-600 leading-relaxed max-w-3xl">{it.a}</p>
                  </details>
                ))}
                {g.showNote && <p className="px-5 sm:px-6 py-4 text-sm text-slate-600">{g.note}</p>}
              </div>
            </section>
          ))}

          <section className="bg-[#071328] text-white rounded-3xl p-6 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-lg">
              <h2 className="text-xl sm:text-2xl font-bold font-display">Still wondering about something?</h2>
              <p className="mt-2 text-sm text-slate-300">Ask us on WhatsApp. A person will reply.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onOpenContact}
                className="inline-flex items-center px-5 py-3 border border-slate-600 hover:border-slate-400 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Contact us
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
