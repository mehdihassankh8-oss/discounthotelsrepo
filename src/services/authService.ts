import { UserProfile, CustomerBooking, CancellationRequest } from '../types/user';
import { HOTELS_DATA } from '../data/hotels';
import type { ApiUser } from './qloApi';

const AUTH_STORAGE_KEY = 'discounthotels_auth_user';
const BOOKINGS_STORAGE_KEY = 'discounthotels_customer_bookings';
const CANCELLATIONS_STORAGE_KEY = 'discounthotels_cancellations';
const SAVED_HOTELS_STORAGE_KEY = 'discounthotels_saved_hotels';

// Default initial demo user profile
export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_khi_98214',
  fullName: 'Hamza Tariq Abbasi',
  email: 'hamza.abbasi@engro.com.pk',
  mobile: '+92 321 8472910',
  role: 'corporate',
  corporateCompany: 'Engro Corporation Pakistan',
  corporateNTN: '0712984-7',
  rememberMe: true,
  pmsGuestId: 'PMS-KHI-4902-OPERA',
  pmsFolioNumber: 'FOL-2026-9810',
  pmsSyncStatus: 'connected',
  pmsLastSyncTime: '2026-09-25 11:45 PKT',
  loyaltyTier: 'Platinum Corporate',
  joinedDate: 'Jan 2025',
  preferredArea: 'Clifton',
  savedHotelIds: ['pearl-continental-karachi', 'zaver-pearl-suites-clifton'],
};

// Initial default bookings with PMS integration codes
export const INITIAL_SAMPLE_BOOKINGS: CustomerBooking[] = [
  {
    id: 'PK-KHI-9024',
    hotelId: 'pearl-continental-karachi',
    hotelName: 'Pearl Continental Hotel Karachi',
    hotelImage: HOTELS_DATA[0].heroImage,
    area: 'Saddar / Club Road',
    starCategory: 5,
    roomName: 'Executive Deluxe Club Room',
    checkIn: '2026-10-12',
    checkOut: '2026-10-15',
    nights: 3,
    guests: 2,
    roomsCount: 1,
    totalPricePKR: 114000,
    status: 'confirmed',
    pmsReservationCode: 'OPERA-PC-98124',
    pmsRatePlanCode: 'CORP-ENGRO-B2B',
    taxAmountPKR: 14820,
    canCancelFree: true,
    freeCancellationDeadline: '2026-10-10 18:00 PKT',
  },
  {
    id: 'PK-KHI-8711',
    hotelId: 'movenpick-hotel-karachi',
    hotelName: 'Mövenpick Hotel Karachi',
    hotelImage: HOTELS_DATA[1].heroImage,
    area: 'Saddar / Club Road',
    starCategory: 5,
    roomName: 'Classic King Room',
    checkIn: '2026-08-14',
    checkOut: '2026-08-17',
    nights: 3,
    guests: 1,
    roomsCount: 1,
    totalPricePKR: 105000,
    status: 'completed',
    pmsReservationCode: 'PROTEL-MP-77218',
    pmsRatePlanCode: 'CORP-TIER1-NET',
    taxAmountPKR: 13650,
    canCancelFree: false,
    freeCancellationDeadline: 'Expired',
  },
  {
    id: 'PK-KHI-7902',
    hotelId: 'zaver-pearl-suites-clifton',
    hotelName: 'Zaver Pearl Suites Clifton',
    hotelImage: HOTELS_DATA[3].heroImage,
    area: 'Clifton',
    starCategory: 4,
    roomName: '1-Bedroom Executive Serviced Suite',
    checkIn: '2026-07-01',
    checkOut: '2026-07-08',
    nights: 7,
    guests: 2,
    roomsCount: 1,
    totalPricePKR: 168000,
    status: 'completed',
    pmsReservationCode: 'IDS-ZVR-3341',
    pmsRatePlanCode: 'LONGSTAY-WEEKLY-7',
    taxAmountPKR: 21840,
    canCancelFree: false,
    freeCancellationDeadline: 'Expired',
  },
];

export const INITIAL_CANCELLATIONS: CancellationRequest[] = [
  {
    id: 'CAN-2026-041',
    bookingId: 'PK-KHI-8102',
    hotelName: 'Avari Towers Karachi',
    requestedAt: '2026-08-01 14:20 PKT',
    status: 'Refund Processed',
    refundAmountPKR: 42000,
    refundMethod: 'Original Payment Method',
    reason: 'Meeting rescheduled by Karachi client',
    estimatedSettlementDays: 'Settled (3 business days)',
  }
];

// Turns the backend's account record into the profile shape the UI uses.
// PMS/loyalty fields are placeholders until those systems are connected.
export function profileFromApiUser(u: ApiUser): UserProfile {
  const corp = u.role === 'corporate';
  const d = new Date(u.joinedDate);
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    mobile: u.mobile,
    role: u.role,
    corporateCompany: corp ? `${u.email.split('@')[1].split('.')[0].toUpperCase()} Pakistan` : undefined,
    rememberMe: true,
    serverAuth: true,
    pmsGuestId: u.qloCustomerId ? `QLO-${u.qloCustomerId}` : 'PENDING',
    pmsSyncStatus: u.qloCustomerId ? 'connected' : 'pending',
    loyaltyTier: corp ? 'Platinum Corporate' : 'Silver Member',
    joinedDate: isNaN(d.getTime()) ? u.joinedDate : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    savedHotelIds: [],
  };
}

export class AuthService {
  static getStoredUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return null;
  }

  static saveUser(user: UserProfile | null): void {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }

  static getBookings(): CustomerBooking[] {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return [];
  }

  static saveBookings(bookings: CustomerBooking[]): void {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // Ignore
    }
  }

  static getCancellations(): CancellationRequest[] {
    try {
      const stored = localStorage.getItem(CANCELLATIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return [];
  }

  static saveCancellations(cancellations: CancellationRequest[]): void {
    try {
      localStorage.setItem(CANCELLATIONS_STORAGE_KEY, JSON.stringify(cancellations));
    } catch {
      // Ignore
    }
  }

  // Future PMS Synchronization simulation
  static async syncWithPMS(pmsGuestId: string): Promise<{ success: boolean; lastSync: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT';
        resolve({ success: true, lastSync: now });
      }, 800);
    });
  }
}
