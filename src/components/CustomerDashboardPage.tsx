import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Heart, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  LogOut, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  MessageSquare, 
  Star, 
  RotateCw, 
  FileText, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  Lock,
  Building
} from 'lucide-react';

import { UserProfile, CustomerBooking, CancellationRequest } from '../types/user';
import { Hotel } from '../types/hotel';
import { HOTELS_DATA } from '../data/hotels';
import { SupportedCurrency, formatPrice } from '../services/currency';
import { AuthService } from '../services/authService';
import { apiMyBookings } from '../services/qloApi';

interface CustomerDashboardPageProps {
  user: UserProfile;
  currency: SupportedCurrency;
  onSignOut: () => void;
  onUpdateUser: (updated: UserProfile) => void;
  onSelectHotelForBooking: (hotel: Hotel) => void;
  onBackToHome: () => void;
}

export type DashboardTab = 
  | 'upcoming'
  | 'previous'
  | 'saved'
  | 'cancellations'
  | 'profile';

/**
 * Turns the status text QloApps reports into the dashboard's status.
 * Until the backend sends a status, an upcoming booking is shown as awaiting
 * confirmation rather than claiming a confirmation the site cannot verify.
 */
function mapServerStatus(raw: string | null | undefined, checkOut: string, today: string): CustomerBooking['status'] {
  const text = (raw || '').toLowerCase();
  if (/cancel|refund/.test(text)) return 'cancelled';
  if (checkOut < today) return 'completed';
  // "Awaiting confirmation" contains the word "confirm", so check for waiting first.
  if (/await|pending|wait|request|new/.test(text)) return 'pending';
  if (/confirm|paid|accept|check[ _-]?in/.test(text)) return 'confirmed';
  return 'pending';
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  user,
  currency,
  onSignOut,
  onUpdateUser,
  onSelectHotelForBooking,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('upcoming');
  const [bookings, setBookings] = useState<CustomerBooking[]>(user.serverAuth ? [] : AuthService.getBookings());

  // Signed-in accounts: load this user's real bookings from the server.
  useEffect(() => {
    if (!user.serverAuth) return;
    apiMyBookings()
      .then(({ bookings: rows }) => {
        setBookings(
          rows.map((b) => {
            const total = b.totalPrice ?? 0;
            const today = new Date().toISOString().slice(0, 10);
            return {
              id: `DH-${b.bookingId ?? 'PENDING'}`,
              hotelId: String(b.hotelId),
              hotelName: b.hotelName || 'Hotel',
              hotelImage: '',
              area: '',
              starCategory: 4,
              roomName: b.roomType,
              checkIn: b.checkIn,
              checkOut: b.checkOut,
              nights: b.nights,
              guests: b.adults + b.children,
              roomsCount: 1,
              totalPricePKR: Math.round(total),
              status: mapServerStatus(b.status, b.checkOut, today),
              pmsReservationCode: b.bookingId ? `QLO-${b.bookingId}` : 'PENDING',
              pmsRatePlanCode: 'B2B-DIRECT',
              taxAmountPKR: 0,
              canCancelFree: false,
              freeCancellationDeadline: 'Contact support to cancel',
            } as CustomerBooking;
          }),
        );
      })
      .catch(() => {});
  }, [user.serverAuth]);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>(AuthService.getCancellations());
  
  // PMS sync state
  const [isSyncingPMS, setIsSyncingPMS] = useState(false);
  const [pmsSyncSuccessMessage, setPmsSyncSuccessMessage] = useState('');

  // Cancellation modal state
  const [bookingToCancel, setBookingToCancel] = useState<CustomerBooking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Change of Karachi travel dates');

  // Edit Profile Form State
  const [profileName, setProfileName] = useState(user.fullName);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileMobile, setProfileMobile] = useState(user.mobile);
  const [profileCompany, setProfileCompany] = useState(user.corporateCompany || '');
  const [profilePreferredArea, setProfilePreferredArea] = useState(user.preferredArea || 'Clifton');
  const [profileSavedNotification, setProfileSavedNotification] = useState(false);

  // Filter Upcoming vs Previous
  const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'cancellation_pending');
  const previousBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  // Saved Hotels list from user's saved IDs
  const savedHotels = HOTELS_DATA.filter((h) => user.savedHotelIds.includes(h.id));

  // Trigger Future PMS Sync simulation
  const handlePMSSync = async () => {
    setIsSyncingPMS(true);
    setPmsSyncSuccessMessage('');
    const res = await AuthService.syncWithPMS(user.pmsGuestId);
    setIsSyncingPMS(false);
    if (res.success) {
      setPmsSyncSuccessMessage(`Folios synchronized with Opera Cloud PMS at ${res.lastSync}`);
      const updated: UserProfile = {
        ...user,
        pmsLastSyncTime: res.lastSync,
        pmsSyncStatus: 'connected',
      };
      onUpdateUser(updated);
      AuthService.saveUser(updated);
    }
  };

  // Submit Cancellation Request
  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingToCancel) return;

    const newCancellation: CancellationRequest = {
      id: `CAN-${Date.now().toString().slice(-4)}`,
      bookingId: bookingToCancel.id,
      hotelName: bookingToCancel.hotelName,
      requestedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      status: 'Under Review',
      refundAmountPKR: bookingToCancel.totalPricePKR,
      refundMethod: 'Original Payment Method',
      reason: cancellationReason,
      estimatedSettlementDays: 'Within 2-3 business days',
    };

    const updatedCancellations = [newCancellation, ...cancellations];
    setCancellations(updatedCancellations);
    AuthService.saveCancellations(updatedCancellations);

    // Update booking status
    const updatedBookings = bookings.map((b) => 
      b.id === bookingToCancel.id ? { ...b, status: 'cancellation_pending' as const } : b
    );
    setBookings(updatedBookings);
    AuthService.saveBookings(updatedBookings);

    setBookingToCancel(null);
    setActiveTab('cancellations');
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      fullName: profileName,
      email: profileEmail,
      mobile: profileMobile,
      corporateCompany: profileCompany || undefined,
      preferredArea: profilePreferredArea,
    };
    onUpdateUser(updated);
    AuthService.saveUser(updated);
    setProfileSavedNotification(true);
    setTimeout(() => setProfileSavedNotification(false), 3000);
  };

  // Remove hotel from saved
  const handleRemoveSaved = (hotelId: string) => {
    const updatedSaved = user.savedHotelIds.filter((id) => id !== hotelId);
    const updated = { ...user, savedHotelIds: updatedSaved };
    onUpdateUser(updated);
    AuthService.saveUser(updated);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 selection:bg-amber-100 selection:text-amber-900">
      
      {/* ========================================================
          DASHBOARD HEADER
         ======================================================== */}
      <header className="bg-[#08152e] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-300">
                {user.fullName.charAt(0)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white font-display">
                    {user.fullName}
                  </h1>
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                    {user.loyaltyTier}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{user.email}</span>
                  <span>·</span>
                  <span>{user.mobile}</span>
                  {user.corporateCompany && (
                    <>
                      <span>·</span>
                      <span className="text-amber-400 font-semibold">{user.corporateCompany}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* PMS Linkage Indicator & Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* PMS Future Integration Badge */}
              <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.pmsSyncStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">PMS Guest ID</div>
                  <div className="font-mono text-xs font-bold text-white">{user.pmsGuestId}</div>
                </div>
                <button
                  type="button"
                  onClick={handlePMSSync}
                  disabled={isSyncingPMS}
                  className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Synchronize with PMS Cloud"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isSyncingPMS ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={onSignOut}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

            </div>

          </div>

          {pmsSyncSuccessMessage && (
            <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pmsSyncSuccessMessage}</span>
            </div>
          )}

          {/* ========================================================
              DASHBOARD TABS
              1. Upcoming bookings
              2. Previous bookings
              3. Saved hotels
              4. Cancellation requests
              5. Profile
             ======================================================== */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-px text-xs font-bold">
            {[
              { id: 'upcoming' as const, label: 'Upcoming Bookings', icon: Calendar, badge: upcomingBookings.length },
              { id: 'previous' as const, label: 'Previous Bookings', icon: Clock, badge: previousBookings.length },
              { id: 'saved' as const, label: 'Saved Hotels', icon: Heart, badge: savedHotels.length },
              { id: 'cancellations' as const, label: 'Cancellation Requests', icon: AlertCircle, badge: cancellations.length },
              { id: 'profile' as const, label: 'Profile & Settings', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* ========================================================
          MAIN TAB CONTENT AREA
         ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ========================================================
            TAB 1: UPCOMING BOOKINGS
           ======================================================== */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">Upcoming Karachi Bookings</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your booking requests and confirmed reservations.
                </p>
              </div>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-800">No Upcoming Bookings</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have no scheduled hotel stays in Karachi right now. Explore discounted properties or corporate rates.
                </p>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="mt-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Browse Karachi Hotels
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-28 h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                        {b.hotelImage ? (<img src={b.hotelImage} alt={b.hotelName} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-end p-2 text-[10px] leading-tight text-white/90 bg-gradient-to-br from-[#0b1a33] to-[#12294d]">{b.hotelName}</div>)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">Ref: {b.id}</span>
                          <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
                            PMS: {b.pmsReservationCode}
                          </span>
                          {b.status === 'cancellation_pending' ? (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              Cancellation Under Review
                            </span>
                          ) : b.status === 'pending' ? (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Awaiting confirmation</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Confirmed</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-slate-900">{b.hotelName}</h3>
                        <div className="text-xs text-slate-600">
                          {b.roomName} · {b.nights} Nights ({b.guests} Guests)
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>{b.checkIn} to {b.checkOut}</span>
                          </span>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold">{b.freeCancellationDeadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="lg:text-right">
                        <div className="text-[11px] text-slate-400">Total:</div>
                        <div className="text-lg font-black text-slate-950 tabular-nums">
                          {formatPrice(b.totalPricePKR, currency)}
                        </div>
                        <div className="text-[10px] text-slate-500">All taxes included</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status === 'confirmed' && b.canCancelFree && (
                          <button
                            type="button"
                            onClick={() => setBookingToCancel(b)}
                            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
                          >
                            <span>Cancel Stay</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: PREVIOUS BOOKINGS
           ======================================================== */}
        {activeTab === 'previous' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-display">Previous Karachi Stays</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Past completed and archived hotel reservations.
              </p>
            </div>

            <div className="space-y-4">
              {previousBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      {b.hotelImage ? (<img src={b.hotelImage} alt={b.hotelName} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-end p-2 text-[10px] leading-tight text-white/90 bg-gradient-to-br from-[#0b1a33] to-[#12294d]">{b.hotelName}</div>)}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span>Ref: {b.id}</span>
                        <span>·</span>
                        <span className="text-slate-600 font-semibold">{b.checkIn} to {b.checkOut}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{b.hotelName}</h3>
                      <div className="text-xs text-slate-500">{b.roomName} · Completed Stay</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <div className="text-sm font-black text-slate-900 tabular-nums">
                        {formatPrice(b.totalPricePKR, currency)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const target = HOTELS_DATA.find((h) => h.id === b.hotelId);
                        if (target) onSelectHotelForBooking(target);
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Re-Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SAVED HOTELS
           ======================================================== */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-display">Saved Hotels Wishlist</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Properties you have bookmarked for future trips and executive reviews.
              </p>
            </div>

            {savedHotels.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-800">No Saved Hotels Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the heart icon on any Karachi hotel card to save it here for quick rate checks.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedHotels.map((h) => (
                  <div
                    key={h.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-900">
                        <img src={h.heroImage} alt={h.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[11px] font-bold">
                          {h.area}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSaved(h.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-600 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-5 space-y-1">
                        <div className="flex items-center text-amber-500 text-xs">
                          {Array.from({ length: h.starCategory }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="ml-1 font-bold text-slate-700">{h.starCategory}-Star</span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 line-clamp-1">{h.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{h.description}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatPrice(h.publicRackPricePKR, currency)}
                          </div>
                          <div className="text-sm font-black text-slate-900">
                            {formatPrice(h.startingPricePKR, currency)} / night
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectHotelForBooking(h)}
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Book Room
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: CANCELLATION REQUESTS
           ======================================================== */}
        {activeTab === 'cancellations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-display">Cancellation Requests Tracker</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor the status of your booking cancellation refunds and hotel approvals.
              </p>
            </div>

            <div className="space-y-4">
              {cancellations.map((c) => (
                <div key={c.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">Request #{c.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-slate-900">{c.hotelName}</span>
                    </div>

                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      c.status === 'Refund Processed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400">Refund Amount:</div>
                      <div className="text-sm font-black text-slate-900 tabular-nums">
                        {formatPrice(c.refundAmountPKR, currency)}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400">Refund Method:</div>
                      <div className="font-bold text-slate-800">{c.refundMethod}</div>
                    </div>

                    <div>
                      <div className="text-slate-400">Settlement Timeline:</div>
                      <div className="font-semibold text-slate-700">{c.estimatedSettlementDays}</div>
                    </div>

                    <div>
                      <div className="text-slate-400">Reason Provided:</div>
                      <div className="font-medium text-slate-600 truncate">{c.reason}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PROFILE & PMS SETTINGS
           ======================================================== */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-display">Profile & PMS Integration Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your company details and central PMS credentials.
              </p>
            </div>

            {profileSavedNotification && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated and synchronized successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Karachi Corridor</label>
                  <select
                    value={profilePreferredArea}
                    onChange={(e) => setProfilePreferredArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Clifton">Clifton (Diplomatic & Multinational HQ)</option>
                    <option value="Shahrah-e-Faisal">Shahrah-e-Faisal (Business Boulevard)</option>
                    <option value="Saddar / Club Road">Saddar / Club Road (Luxury 5-Star Zone)</option>
                    <option value="DHA">DHA (Executive Coastline)</option>
                    <option value="Karachi Airport">Karachi Airport Perimeter</option>
                  </select>
                </div>
              </div>

              {/* Corporate Details */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Corporate Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={profileCompany}
                      onChange={(e) => setProfileCompany(e.target.value)}
                      placeholder="e.g. Engro Corporation Pakistan"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                </div>
              </div>

              {/* Future PMS Ready Integration Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-400">PMS Cloud Architecture Ready</div>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    OPERA / PROTEL CONNECTED
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  PMS Guest Identifier: <span className="font-mono font-bold text-white">{user.pmsGuestId}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Last verified synchronization: {user.pmsLastSyncTime || 'Active'}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

      {/* ========================================================
          CANCELLATION REQUEST MODAL
         ======================================================== */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Request Booking Cancellation</h3>
                <p className="text-xs text-slate-400 font-mono">{bookingToCancel.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingToCancel(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancellation} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                <span className="font-bold block">Free Cancellation Eligible:</span>
                <span>This booking is within the zero-fee cancellation window ({bookingToCancel.freeCancellationDeadline}). You are eligible for a 100% refund.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Hotel & Stay:</label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-medium">
                  {bookingToCancel.hotelName} ({bookingToCancel.checkIn} to {bookingToCancel.checkOut})
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Reason for Cancellation *</label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="Change of Karachi travel dates">Change of Karachi travel dates</option>
                  <option value="Meeting / event cancelled">Meeting / event cancelled</option>
                  <option value="Flight delay / rescheduling">Flight delay / rescheduling</option>
                  <option value="Found alternative corporate accommodation">Found alternative corporate accommodation</option>
                  <option value="Other personal reason">Other personal reason</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Confirm 100% Refund Cancellation
                </button>
                <button
                  type="button"
                  onClick={() => setBookingToCancel(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Keep Booking
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
