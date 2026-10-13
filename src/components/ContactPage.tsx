import React, { useState } from 'react';
import { MessageSquare, Phone, Mail } from 'lucide-react';
import { CONTACT, waLink } from '../data/contact';

interface ContactPageProps {
  onOpenFaq?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenFaq }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(waLink(`Hi Discount Hotels, I'm ${name}. ${message}`), '_blank', 'noopener');
  };

  const boxes = [
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      text: 'Quotes, bookings, payment receipts, changes. Usually answered within minutes.',
      value: CONTACT.phoneLocal,
      action: 'Open WhatsApp',
      href: waLink("Hi Discount Hotels, I'd like a rate for Karachi."),
      external: true,
      primary: true,
    },
    {
      icon: Phone,
      title: 'Phone',
      text: "For urgent changes on the day of arrival, or if you'd just rather talk.",
      value: CONTACT.phoneIntl,
      action: 'Call us',
      href: `tel:+${CONTACT.whatsapp}`,
    },
    {
      icon: Mail,
      title: 'Email',
      text: "Booking questions and anything you'd rather put in writing.",
      value: CONTACT.email,
      action: 'Write to us',
      href: `mailto:${CONTACT.email}`,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      <section className="relative bg-[#071328] text-white pt-16 pb-16 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#1f365d_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">Contact</span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display leading-[1.15]">
            Talk to a person, not a form.
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            WhatsApp is the fastest way to reach us. Send your dates and the hotel you have in mind, and we'll come back with a rate.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {boxes.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <b.icon className="w-6 h-6 text-amber-600" />
              <h2 className="mt-4 text-lg font-bold text-slate-900">{b.title}</h2>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">{b.text}</p>
              <div className="mt-4 mb-5 text-lg font-bold text-slate-900 break-all">{b.value}</div>
              <a
                href={b.href}
                {...(b.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`mt-auto text-center py-3 rounded-xl text-sm font-bold transition-colors ${
                  b.primary
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300'
                }`}
              >
                {b.action}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 font-display">Send us your dates</h2>
            <p className="mt-1 text-sm text-slate-500">This opens WhatsApp with your message ready to send.</p>

            <label htmlFor="c-name" className="block mt-6 mb-1.5 text-sm font-semibold text-slate-800">Your name</label>
            <input
              id="c-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
            />

            <label htmlFor="c-msg" className="block mt-5 mb-1.5 text-sm font-semibold text-slate-800">What do you need?</label>
            <textarea
              id="c-msg"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="2 rooms at Mövenpick, 12 to 14 November, 4 adults"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
            />

            <button
              type="submit"
              className="mt-6 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Send on WhatsApp
            </button>
          </form>

          <div className="lg:pt-4">
            <h2 className="text-xl font-bold text-slate-900 font-display">When we're around</h2>
            <div className="mt-4 flex justify-between py-3 border-b border-slate-200 text-sm">
              <span className="text-slate-800">Daily</span>
              <span className="text-slate-600">9am to 11pm</span>
            </div>
            <p className="mt-4 text-sm">
              <a
                href="/faq"
                onClick={(e) => {
                  if (!onOpenFaq) return;
                  e.preventDefault();
                  onOpenFaq();
                }}
                className="font-semibold text-slate-900 underline underline-offset-2 hover:text-amber-700"
              >
                Read the FAQ →
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
