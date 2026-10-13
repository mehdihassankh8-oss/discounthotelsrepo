import React, { useState } from 'react';
import { 
  Home,
  Building2, 
  Info,
  HelpCircle,
  PhoneCall, 
  User, 
  Menu, 
  X
} from 'lucide-react';
import { UserProfile } from '../types/user';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSignIn: () => void;
  currentUser?: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenSignIn,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'hotels', label: 'Hotels', icon: Building2 },
    { id: 'about', label: 'About us', icon: Info },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: PhoneCall },
  ];
  // A hotel page belongs to the Hotels section.
  const currentSection = activeTab === 'hotel-detail' ? 'hotels' : activeTab;

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#081225] border-b border-slate-800 shadow-lg text-white">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Zone 1: Single element Brand Wordmark */}
        <div className="flex items-center gap-4">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); handleTabClick('home'); }}
            className="text-left group focus:outline-none cursor-pointer"
            title="Return to DiscountHotels.pk Homepage"
          >
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              DiscountHotels<span className="text-amber-400">.pk</span>
            </span>
          </a>
        </div>

        {/* Zone 2: 4-7 clean text navigation links (desktop) */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <a
                key={item.id}
                href={item.id === 'home' ? '/' : `/${item.id}`}
                onClick={(e) => { e.preventDefault(); handleTabClick(item.id); }}
                className={`relative whitespace-nowrap py-1 transition-colors duration-150 flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-amber-400 font-semibold' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Sign In, Primary CTA) */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Sign In / User Account Portal */}
          {currentUser ? (
            <button
              onClick={() => {
                onTabChange('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                {currentUser.fullName.charAt(0)}
              </div>
              <span className="max-w-[100px] truncate">{currentUser.fullName.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Actions: Menu */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a162e] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-b border-slate-800">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-sm text-left transition-colors ${
                    isActive ? 'bg-amber-400/20 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div />

            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onTabChange('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                My Account ({currentUser.fullName.split(' ')[0]})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSignIn();
                }}
                className="text-xs text-amber-400 font-medium hover:underline"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
