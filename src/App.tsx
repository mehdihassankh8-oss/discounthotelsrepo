import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MessageSquare, ArrowRight, User } from 'lucide-react';

// Core Navigation & Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';


// Interactive Functional Modals & Drawers
import { BookingPage } from './components/BookingPage';
import { WhatsAppAssistantModal } from './components/WhatsAppAssistantModal';
import { AuthModal } from './components/AuthModal';
import { SearchResultsPage } from './components/SearchResultsPage';
import { HotelDetailPage } from './components/HotelDetailPage';
import { AboutPage } from './components/AboutPage';
import { FaqPage } from './components/FaqPage';
import { ContactPage } from './components/ContactPage';
import { CustomerDashboardPage } from './components/CustomerDashboardPage';
import { UserProfile } from './types/user';
import { AuthService, profileFromApiUser } from './services/authService';
import { apiMe, apiLogout } from './services/qloApi';
import { PAGE_PATHS, parsePath, hotelPath } from './seo/routes';
import { buildSeo } from './seo/seoData';
import { useSeo } from './hooks/useSeo';

// Data & Services
import { useHotels } from './hooks/useHotels';
import { Hotel, RoomType, SearchCriteria } from './types/hotel';
import { SupportedCurrency } from './services/currency';

// Default stay: tomorrow for two nights, so the search never opens on a past date.
function defaultStayDates() {
  const iso = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  return { checkIn: iso(1), checkOut: iso(3) };
}

export default function App() {
  // Navigation State
  // The address bar decides which screen opens first (so /hotels, /contact etc. work when shared or refreshed).
  const [activeTab, setActiveTab] = useState<string>(() => parsePath(window.location.pathname).tab);
  const pendingHotelId = useRef<string | undefined>(parsePath(window.location.pathname).hotelId);
  // Currency is fixed to PKR (currency switcher removed)
  const currency: SupportedCurrency = 'PKR';

  // Search & Filter State
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    area: 'All Areas',
    checkIn: defaultStayDates().checkIn,
    checkOut: defaultStayDates().checkOut,
    roomsCount: 1,
    adultsCount: 2,
    childrenCount: 0,
    stayType: 'standard',
    minPrice: 0,
    maxPrice: 110000,
    starRatings: [],
    selectedFacilities: [],
    sortBy: 'recommended',
  });

  // Live hotel + availability data from QloApps (via our backend).
  // Replaces the old static HOTELS_DATA import.
  const {
    hotels: liveHotels,
    loading: hotelsLoading,
    error: hotelsError,
    searchDates,
  } = useHotels({
    checkIn: searchCriteria.checkIn,
    checkOut: searchCriteria.checkOut,
    adults: searchCriteria.adultsCount,
    children: searchCriteria.childrenCount,
  });

  // Hotel being viewed on the hotel detail page
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<Hotel | null>(null);

  // Room chosen on the hotel page (Reserve) and carried to the booking page
  const [booking, setBooking] = useState<{ hotelId: string; room: RoomType; qty: number } | null>(null);

  // WhatsApp, AI Concierge & Auth Modals
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppInitialQuery, setWhatsAppInitialQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => AuthService.getStoredUser());

  // Re-check the real login session on page load.
  useEffect(() => {
    apiMe()
      .then(({ user }) => {
        const profile = profileFromApiUser(user);
        setCurrentUser(profile);
        AuthService.saveUser(profile);
      })
      .catch(() => {
        // Not signed in on the server: clear any stale locally-stored account.
        if (AuthService.getStoredUser()) {
          setCurrentUser(null);
          AuthService.saveUser(null);
        }
      });
  }, []);

  // Keep the address bar in step with the visible screen (real URLs for every page).
  useEffect(() => {
    let path = PAGE_PATHS[activeTab] ?? '/';
    if (activeTab === 'hotel-detail') {
      if (!selectedHotelForDetails) return; // still resolving a /hotel/... link
      path = hotelPath(selectedHotelForDetails);
    }
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
  }, [activeTab, selectedHotelForDetails]);

  // Browser back/forward buttons.
  useEffect(() => {
    const onPop = () => {
      const route = parsePath(window.location.pathname);
      pendingHotelId.current = route.hotelId;
      setActiveTab(route.tab);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Open a hotel from a /hotel/<id>-<name> link once hotels have loaded.
  useEffect(() => {
    const id = pendingHotelId.current;
    if (!id || liveHotels.length === 0) return;
    pendingHotelId.current = undefined;
    const found = liveHotels.find((h) => String(h.id) === id);
    if (found) setSelectedHotelForDetails(found);
    else setActiveTab('hotels');
  }, [liveHotels, activeTab]);

  // Per-page title, description, canonical, social tags and structured data.
  const hotelFromUrl = pendingHotelId.current
    ? liveHotels.find((h) => String(h.id) === pendingHotelId.current)
    : undefined;
  // A /hotel/<id>-<name> link shows that hotel (never a different one) once the list has loaded.
  const liveSelected = selectedHotelForDetails
    ? liveHotels.find((h) => h.id === selectedHotelForDetails.id) || selectedHotelForDetails
    : undefined;
  const detailHotel = liveSelected || hotelFromUrl || (pendingHotelId.current ? undefined : liveHotels[0]);
  useSeo(buildSeo(activeTab, detailHotel || null, searchCriteria.area, liveHotels));

  const homeHotels = useMemo(
    () =>
      [...liveHotels].sort((x, y) => {
        // Hotels with rooms for the chosen dates first, then featured, then A to Z.
        if ((x.startingPricePKR > 0) !== (y.startingPricePKR > 0)) return x.startingPricePKR > 0 ? -1 : 1;
        if (!!x.isFeatured !== !!y.isFeatured) return x.isFeatured ? -1 : 1;
        return x.name.localeCompare(y.name);
      }),
    [liveHotels],
  );

  // The booking page needs a chosen room. Without one (page refreshed, or opened by link) go back to the hotels list.
  const bookingHotel = booking ? liveHotels.find((h) => h.id === booking.hotelId) || selectedHotelForDetails : null;
  useEffect(() => {
    if (activeTab === 'booking' && !booking) setActiveTab('hotels');
  }, [activeTab, booking]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // "View rooms" / hotel card / hotel name: always open the hotel detail page.
  const handleOpenHotel = (hotel: Hotel) => {
    setSelectedHotelForDetails(hotel);
    setActiveTab('hotel-detail');
    scrollTop();
  };

  // Reserve on the hotel page: go to the booking page for that room.
  const handleReserve = (hotel: Hotel, room: RoomType, qty: number) => {
    setSelectedHotelForDetails(hotel);
    setBooking({ hotelId: hotel.id, room, qty });
    setActiveTab('booking');
    scrollTop();
  };

  const handleWhatsAppHotelInquiry = (hotelNameOrCustomMsg: string) => {
    setWhatsAppInitialQuery(`Salam DiscountHotels.pk! I would like to inquire about booking rates for ${hotelNameOrCustomMsg}.`);
    setIsWhatsAppModalOpen(true);
  };

  // Apply new dates / guests. Only dates and guest counts need a fresh request to QloApps
  // (prices and availability); the other filters work on data that is already loaded.
  const applySearch = (patch?: Partial<SearchCriteria>) => {
    const next = patch ? { ...searchCriteria, ...patch } : searchCriteria;
    if (!patch) return;
    setSearchCriteria(next);
    if (
      patch.checkIn !== undefined ||
      patch.checkOut !== undefined ||
      patch.adultsCount !== undefined ||
      patch.childrenCount !== undefined
    ) {
      searchDates({
        checkIn: next.checkIn,
        checkOut: next.checkOut,
        adults: next.adultsCount,
        children: next.childrenCount,
      });
    }
  };

  // Search bar on the home and hotels pages. Picking one hotel opens its page; otherwise show the results list.
  const handleSearch = (patch?: Partial<SearchCriteria>, hotelId?: string) => {
    applySearch(patch);
    const picked = hotelId ? liveHotels.find((h) => String(h.id) === hotelId) : undefined;
    if (picked) {
      handleOpenHotel(picked);
      return;
    }
    setActiveTab('hotels');
    scrollTop();
  };

  // Search bar on the hotel page: re-check rates here, or jump to another hotel if one was picked.
  const handleChangeStay = (patch: Partial<SearchCriteria>, hotelId?: string) => {
    applySearch(patch);
    const picked = hotelId ? liveHotels.find((h) => String(h.id) === hotelId) : undefined;
    if (picked && picked.id !== selectedHotelForDetails?.id) handleOpenHotel(picked);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* ========================================================
          SECTION 1 — HEADER (PREMIUM STICKY HEADER)
          Left: DiscountHotels.pk logo
          Navigation: Home, Hotels, About us, FAQ, Contact
          Right: Sign In
          Desktop & mobile carefully designed
         ======================================================== */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSignIn={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1">
        
        {/* HOMEPAGE: search bar, hotels, how booking works */}
        {activeTab === 'home' && (
          <HomePage
            criteria={searchCriteria}
            hotels={liveHotels}
            loading={hotelsLoading}
            error={hotelsError}
            currency={currency}
            onSearch={handleSearch}
            onOpenHotel={handleOpenHotel}
            onNavigate={(tab) => {
              setActiveTab(tab);
              scrollTop();
            }}
          />
        )}

        {/* DEDICATED HOTEL SEARCH RESULTS PAGE */}
        {activeTab === 'hotels' && (
          <SearchResultsPage
            criteria={searchCriteria}
            hotels={liveHotels}
            loading={hotelsLoading}
            error={hotelsError}
            currency={currency}
            onSearch={handleSearch}
            onViewHotelDetails={handleOpenHotel}
            onWhatsAppInquiry={handleWhatsAppHotelInquiry}
            onBackToHome={() => {
              setActiveTab('home');
              scrollTop();
            }}
          />
        )}

        {/* DEDICATED HOTEL DETAIL PAGE */}
        {activeTab === 'hotel-detail' && !detailHotel && pendingHotelId.current && (
          <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-500 text-sm" role="status">
            Loading hotel details…
          </div>
        )}
        {activeTab === 'hotel-detail' && detailHotel && (
          <HotelDetailPage
            hotel={detailHotel}
            hotels={liveHotels}
            currency={currency}
            criteria={searchCriteria}
            loadingRates={hotelsLoading}
            onChangeStay={handleChangeStay}
            onReserve={handleReserve}
            onWhatsAppInquiry={handleWhatsAppHotelInquiry}
            onBackToSearch={() => {
              setActiveTab('hotels');
              scrollTop();
            }}
            onBackToHome={() => {
              setActiveTab('home');
              scrollTop();
            }}
          />
        )}

        {/* BOOKING PAGE: guest details, bank transfer, then awaiting confirmation */}
        {activeTab === 'booking' && bookingHotel && booking && (
          <BookingPage
            key={`${bookingHotel.id}-${booking.room.id}-${booking.qty}`}
            hotel={bookingHotel}
            room={booking.room}
            qty={booking.qty}
            criteria={searchCriteria}
            currency={currency}
            onChangeRoom={() => {
              setActiveTab('hotel-detail');
              scrollTop();
            }}
            onBackToHotels={() => {
              setActiveTab('hotels');
              scrollTop();
            }}
            onViewBooking={() => {
              setActiveTab('account');
              scrollTop();
            }}
            onOpenFaq={() => {
              setActiveTab('faq');
              scrollTop();
            }}
          />
        )}

        {/* ABOUT US PAGE */}
        {activeTab === 'about' && (
          <AboutPage
            onBrowseHotels={() => {
              setActiveTab('hotels');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={() => {
              setActiveTab('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* FAQ PAGE */}
        {activeTab === 'faq' && (
          <FaqPage
            onOpenContact={() => {
              setActiveTab('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* DEDICATED CONTACT / 24/7 SUPPORT PAGE */}
        {activeTab === 'contact' && (
          <ContactPage
            onOpenFaq={() => {
              setActiveTab('faq');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* DEDICATED CUSTOMER DASHBOARD & AUTH HUB */}
        {activeTab === 'account' && (
          currentUser ? (
            <CustomerDashboardPage
              user={currentUser}
              currency={currency}
              onSignOut={() => {
                apiLogout().catch(() => {});
                setCurrentUser(null);
                AuthService.saveUser(null);
                setActiveTab('home');
              }}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                AuthService.saveUser(updated);
              }}
              onSelectHotelForBooking={handleOpenHotel}
              onBackToHome={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-white">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
              <p className="text-xs text-slate-600 max-w-sm mb-6">
                Please sign in to access your upcoming bookings, previous stays, and saved hotels.
              </p>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          )
        )}

      </main>

      {/* FLOATING STATIC WHATSAPP BUTTON (Bottom Right) - the only WhatsApp button in header/footer areas */}
      <a
        href="https://wa.me/923220957136?text=Salam%20DiscountHotels.pk!%20I%20need%20help%20selecting%20the%20best%20hotel%20in%20Karachi."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl border border-emerald-400/40"
      >
        <MessageSquare className="w-6 h-6 fill-white text-emerald-600" />
      </a>

      {/* ========================================================
          INTERACTIVE FUNCTIONAL MODALS
         ======================================================== */}
      {/* WhatsApp & AI Concierge Modal */}
      <WhatsAppAssistantModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        initialQuery={whatsAppInitialQuery}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(profile) => {
          setCurrentUser(profile);
          AuthService.saveUser(profile);
        }}
      />

      {/* ========================================================
          SECTION 13 — FOOTER
          Copyright line only
         ======================================================== */}
      <Footer
        hotels={liveHotels}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHotel={handleOpenHotel}
      />

    </div>
  );
}
