import { Hotel } from './hotel';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  role: 'guest' | 'corporate' | 'vip';
  corporateCompany?: string;
  corporateNTN?: string;
  rememberMe?: boolean;
  serverAuth?: boolean; // true when this account came from the real backend login
  
  // Future PMS Integration fields
  pmsGuestId: string; // e.g. "PMS-KHI-4902"
  pmsFolioNumber?: string;
  pmsSyncStatus: 'connected' | 'pending' | 'offline';
  pmsLastSyncTime?: string;
  loyaltyTier: 'Silver Member' | 'Gold Executive' | 'Platinum Corporate';
  
  joinedDate: string;
  preferredArea?: string;
  savedHotelIds: string[];
}

export interface CustomerBooking {
  id: string; // Booking reference, e.g. "PK-KHI-8941"
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  area: string;
  starCategory: number;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomsCount: number;
  totalPricePKR: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancellation_pending';
  
  // PMS linkage
  pmsReservationCode: string; // e.g. "OPERA-PC-98124"
  pmsRatePlanCode: string; // e.g. "CORP-B2B-NET"
  
  taxAmountPKR: number; // SST 13%
  
  // Cancellation details
  canCancelFree: boolean;
  freeCancellationDeadline: string;
  cancellationRequestedAt?: string;
  cancellationReason?: string;
}

export interface CancellationRequest {
  id: string;
  bookingId: string;
  hotelName: string;
  requestedAt: string;
  status: 'Under Review' | 'Refund Processed' | 'Cancelled with Zero Fee';
  refundAmountPKR: number;
  refundMethod: 'Original Payment Method' | 'Bank Transfer (IBFT)';
  reason: string;
  estimatedSettlementDays: string;
}
