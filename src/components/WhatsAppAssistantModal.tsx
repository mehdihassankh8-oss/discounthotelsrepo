import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ExternalLink, 
  Phone, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { askKarachiConcierge } from '../services/aiConcierge';

interface WhatsAppAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const WhatsAppAssistantModal: React.FC<WhatsAppAssistantModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [activeMode, setActiveMode] = useState<'ai' | 'direct_wa'>('ai');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Salam! I am your DiscountHotels.pk Karachi Concierge. Whether you need corporate tariff advice, wedding group blocks, or oceanfront suites in Clifton, ask me anything or connect straight to our WhatsApp helpline.',
    },
  ]);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Which hotel has free airport shuttle in Karachi?',
    'Best executive hotel near Clifton and Dolmen Mall?',
    'What are corporate rates at Pearl Continental?',
    'Best long stay residence with a kitchenette?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askKarachiConcierge(query);
      setMessages([...newMsgs, { sender: 'assistant', text: response }]);
    } catch {
      setMessages([
        ...newMsgs,
        {
          sender: 'assistant',
          text: 'Our Karachi concierge desk is also standing by on WhatsApp at +92 322 0957136 for live agent assistance.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const launchWhatsApp = (customMessage: string) => {
    const encoded = encodeURIComponent(customMessage);
    window.open(`https://wa.me/923220957136?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[650px] max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-[#081225] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">DiscountHotels.pk Assistant</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-300">
                AI Hospitality Concierge & Official WhatsApp Support Desk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-100 p-1 flex border-b border-slate-200">
          <button
            onClick={() => setActiveMode('ai')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'ai' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Karachi Concierge</span>
          </button>
          <button
            onClick={() => setActiveMode('direct_wa')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'direct_wa' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Quick Desk</span>
          </button>
        </div>

        {/* Mode 1: AI Concierge */}
        {activeMode === 'ai' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-400 text-slate-950 font-medium'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-11">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  <span>Checking Karachi hotel inventories & rates...</span>
                </div>
              )}
            </div>

            {/* Suggestions & Input */}
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <div className="flex gap-2 overflow-x-auto pb-2 text-[11px]">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 mt-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about Karachi hotels, areas, airport transit..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mode 2: Direct WhatsApp Help Desk */}
        {activeMode === 'direct_wa' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>24/7 Verified Karachi Booking Desk</span>
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Direct phone & WhatsApp assistance: <span className="font-bold font-mono">+92 322 0957136</span>. Average response time is under 3 minutes.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose a Fast Topic to Start WhatsApp Chat:
              </h4>

              {[
                {
                  title: 'Corporate Rate Agreement',
                  desc: 'Inquire about company discounts and corporate credit terms.',
                  msg: 'Salam DiscountHotels.pk! I would like to inquire about corporate rates and company billing for Karachi hotel stays.',
                },
                {
                  title: 'Wedding or Group Block (5+ Rooms)',
                  desc: 'Get custom block pricing for family weddings or corporate offsites.',
                  msg: 'Salam! We need group booking assistance for a wedding party in Karachi (approx 10-20 rooms).',
                },
                {
                  title: 'Long Stay Extended Suite (15–30+ Nights)',
                  desc: 'Book a furnished residence with kitchenette in Clifton or Saddar.',
                  msg: 'Salam! I need long-stay accommodation in Karachi for 30+ nights with laundry & kitchenette.',
                },
                {
                  title: 'Urgent Same-Day Check-In or Airport Pickup',
                  desc: 'Immediate check-in assistance or transit booking with free shuttle.',
                  msg: 'Salam! I need urgent same-day hotel booking assistance in Karachi near the airport/Saddar.',
                },
              ].map((topic, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{topic.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{topic.desc}</p>
                  </div>
                  <button
                    onClick={() => launchWhatsApp(topic.msg)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Launch Chat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
