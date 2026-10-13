import React from 'react';
import { ArrowRight, MessageSquare, Quote } from 'lucide-react';
import { ABOUT_INTRO, ABOUT_SECTIONS } from '../data/about';

interface AboutPageProps {
  onBrowseHotels: () => void;
  onOpenContact: () => void;
}

const WHATSAPP_URL =
  'https://wa.me/923220957136?text=' +
  encodeURIComponent("Salam DiscountHotels.pk! I'd like to know more about your hotel rates in Karachi.");

export const AboutPage: React.FC<AboutPageProps> = ({ onBrowseHotels, onOpenContact }) => {
  return (
    <div className="bg-slate-50 text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      {/* HERO */}
      <section className="relative bg-[#071328] text-white pt-16 pb-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#1f365d_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
        <div className="absolute -top-28 -right-28 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
            <span>Home</span>
            <span>/</span>
            <span className="text-amber-400 font-semibold">About us</span>
          </div>
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">About Discount Hotels</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight font-display leading-[1.15]">
              {ABOUT_INTRO}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Premium hospitality, made more accessible: specially negotiated rates at leading star hotels across Karachi, with more value for what you pay.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Section index (desktop) */}
        <aside className="hidden lg:block lg:col-span-3">
          <nav aria-label="About sections" className="sticky top-28 space-y-1 text-sm">
            {ABOUT_SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#about-${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`about-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-baseline gap-3 py-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="font-mono text-xs font-bold text-amber-600">0{i + 1}</span>
                <span className="font-medium leading-snug">{s.title.split(':')[0]}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-9 space-y-6">
          {ABOUT_SECTIONS.map((s, i) => (
            <section
              key={s.id}
              id={`about-${s.id}`}
              className="scroll-mt-28 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-9"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display leading-snug">
                  {s.title}
                </h2>
                <span className="font-mono font-black text-3xl text-slate-200 shrink-0" aria-hidden="true">
                  0{i + 1}
                </span>
              </div>
              <div className="mt-4 space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {s.pull && (
                <blockquote className="mt-6 flex gap-3 border-l-4 border-amber-400 bg-amber-50/60 rounded-r-2xl py-4 pl-4 pr-5 max-w-3xl">
                  <Quote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="font-semibold text-slate-900 leading-relaxed">{s.pull}</p>
                </blockquote>
              )}
            </section>
          ))}

          {/* CTA */}
          <section className="bg-[#071328] text-white rounded-3xl p-6 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-lg">
              <h2 className="text-xl sm:text-2xl font-bold font-display">Ready to see the difference?</h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Browse Karachi's star hotels, or message us and a real person will help you find the right one.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onBrowseHotels}
                className="inline-flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <span>Browse hotels</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
