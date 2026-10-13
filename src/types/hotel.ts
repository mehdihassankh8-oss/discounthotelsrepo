export type StarRating = 3 | 4 | 5;

export type KarachiArea =
  | 'All Areas'
  | 'Clifton'
  | 'DHA'
  | 'Shahrah-e-Faisal'
  | 'Dolmen City'
  | 'Karachi Airport'
  | 'I.I. Chundrigar Road'
  | 'Korangi Industrial Area'
  | 'Port Qasim'
  | 'Expo Centre'
  | 'Saddar / Club Road'
  | 'Port / Lalazar';

export type StayType = 'standard' | 'corporate' | 'group' | 'longstay';

export interface RoomType {
  id: string;
  name: string;
  bedType: string;
  roomSizeSqFt: number;
  maxOccupancy: number;
  publicRatePKR: number;
  discountRatePKR: number;
  corporateRatePKR: number;
  longStayRatePKR_7d: number;
  longStayRatePKR_30d: number;
  breakfastIncluded: boolean;
  freeCancellationUntilHours: number;
  availableRooms: number;
  photos: string[];
  keyFeatures: string[];
}

export interface Hotel {
  id: string;
  name: string;
  starCategory: StarRating;
  city: 'Karachi';
  area: KarachiArea;
  address: string;
  landmark: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photos: string[];
  heroImage: string;
  description: string;
  guestRating: number;
  reviewCount: number;
  facilities: string[];
  distanceKm?: number;
  distanceText?: string;
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    petPolicy: string;
    idRequirement: string;
  };
  startingPricePKR: number;
  publicRackPricePKR: number;
  corporateDiscountPercent: number;
  groupDiscountPercent: number;
  longStayDiscountPercent: number;
  rooms: RoomType[];
  isFeatured?: boolean;
  pmsSyncStatus?: 'connected' | 'live' | 'standby';
  pmsProvider?: 'Opera' | 'Cloudbeds' | 'Fidelio' | 'Custom API';
  popularFor: ('Corporate' | 'Groups' | 'Family' | 'Long Stay' | 'Airport Transit' | 'Ocean View')[];
}

export type SortOption =
  | 'recommended'
  | 'priceAsc'
  | 'priceDesc'
  | 'stars'
  | 'rating'
  | 'distance'
  | 'roomSize'
  | 'corporateSavings';

export interface SearchCriteria {
  area: KarachiArea;
  checkIn: string;
  checkOut: string;
  roomsCount: number;
  adultsCount: number;
  childrenCount: number;
  stayType: StayType;
  minPrice?: number;
  maxPrice?: number;
  starRatings?: StarRating[];
  selectedFacilities?: string[];
  selectedRoomTypes?: string[];
  selectedBookingConditions?: string[];
  selectedCustomerTypes?: string[];
  breakfastOnly?: boolean;
  freeCancellationOnly?: boolean;
  corporateOnly?: boolean;
  sortBy?: SortOption;
}

export interface BookingDetails {
  bookingId: string;
  hotelId: string;
  hotelName: string;
  hotelArea: string;
  roomTypeId: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  roomsCount: number;
  guestCount: number;
  stayType: StayType;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCnicOrPassport?: string;
  companyName?: string;
  corporateNtn?: string;
  specialRequests?: string;
  pricePerNightPKR: number;
  totalRoomPricePKR: number;
  taxesAndFeesPKR: number;
  totalAmountPKR: number;
  savingsPKR: number;
  paymentMethod: 'hotel' | 'bank_transfer' | 'corporate_invoice' | 'whatsapp';
  status: 'confirmed' | 'pending_verification' | 'corporate_review';
  createdAt: string;
}

export interface CorporateQuoteRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  ntnNumber?: string;
  preferredArea: KarachiArea;
  estimatedRoomsPerMonth: number;
  budgetPerNightPKR: number;
  requirements: string[];
  status: 'received' | 'pricing_generated';
}

export interface GroupQuoteRequest {
  id: string;
  organizerName: string;
  groupType: 'Wedding' | 'Corporate Conference' | 'Sports / Delegation' | 'Family Reunion' | 'Other';
  email: string;
  phone: string;
  roomCount: number;
  checkIn: string;
  checkOut: string;
  preferredHotelId?: string;
  notes?: string;
}

export interface LongStayQuoteRequest {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  durationNights: 7 | 15 | 30 | 60 | 90;
  preferredArea: KarachiArea;
  requiresKitchenette: boolean;
  notes?: string;
}
