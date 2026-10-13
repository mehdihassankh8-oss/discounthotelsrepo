import { Hotel, RoomType, KarachiArea } from '../types/hotel';
import { ApiHotel, ApiAvailability, ApiRoomType } from './qloApi';

/**
 * IMPORTANT — read before using this file.
 *
 * QloApps (via our backend) can currently supply: hotel name, city, address,
 * star rating, check-in/out times, a short description, and — once a search
 * is run — room type names, availability counts, and ONE price per room type
 * per date range.
 *
 * It cannot currently supply (these are placeholder defaults below, not real
 * data — do not treat them as accurate):
 *   - photos                      -> [] (no image data wired yet)
 *   - guestRating / reviewCount   -> 0 (QloApps has no review system)
 *   - area (Karachi neighbourhood)-> 'All Areas' (QloApps has no such field;
 *                                    needs a manual mapping per hotel, e.g.
 *                                    stored as a hotel feature/tag)
 *   - coordinates                 -> 0,0 (not fetched yet; hotels resource
 *                                    doesn't expose lat/lng directly)
 *   - separate corporate/group/longstay rates -> same as the public rate
 *                                    (per our test findings: QloApps returns
 *                                    ONE price per room type; multi-tier
 *                                    pricing needs a decision — see project notes)
 *   - breakfastIncluded, freeCancellationUntilHours, keyFeatures -> defaults
 *                                    below; QloApps DOES have this data
 *                                    (hotel_refund_rules, room_type_features)
 *                                    but the backend doesn't fetch it yet.
 *
 * Ship nothing to real customers that implies these placeholders are real
 * (e.g. don't show "4.8★ · 230 reviews" for a guestRating of 0 — hide the
 * rating block instead until real review data exists).
 */

function mapArea(_apiHotel: ApiHotel): KarachiArea {
  // TODO: no neighbourhood field exists in QloApps yet. Until the client
  // supplies a mapping (or we store it as a hotel feature), every real
  // hotel lands in 'All Areas' rather than a guessed one.
  return 'All Areas';
}

function mapRoomType(rt: ApiRoomType): RoomType {
  const rate = Math.round(rt.pricePerNight);
  return {
    id: String(rt.roomTypeId),
    name: rt.name,
    bedType: '',
    roomSizeSqFt: 0,
    maxOccupancy: 2,
    publicRatePKR: rate,
    discountRatePKR: rate,
    corporateRatePKR: rate, // TODO: real corporate pricing not wired yet
    longStayRatePKR_7d: rate,
    longStayRatePKR_30d: rate,
    breakfastIncluded: false,
    freeCancellationUntilHours: 0,
    availableRooms: rt.availableRooms,
    photos: [],
    keyFeatures: [],
  };
}

/**
 * Builds a Hotel object for display BEFORE a date search has been run
 * (e.g. the featured-hotels grid on the homepage). Prices and room lists
 * are empty/zero until availability is fetched for specific dates.
 */
export function mapHotelBasic(apiHotel: ApiHotel): Hotel {
  return {
    id: String(apiHotel.id),
    name: apiHotel.name,
    starCategory: (apiHotel.stars === 3 || apiHotel.stars === 4 || apiHotel.stars === 5) ? apiHotel.stars : 3,
    city: 'Karachi',
    area: mapArea(apiHotel),
    address: apiHotel.address,
    landmark: '',
    coordinates: { lat: 0, lng: 0 },
    photos: [],
    heroImage: '',
    description: apiHotel.shortDescription,
    guestRating: 0,
    reviewCount: 0,
    facilities: [],
    policies: {
      checkInTime: apiHotel.checkIn ?? '',
      checkOutTime: apiHotel.checkOut ?? '',
      cancellationPolicy: '',
      petPolicy: '',
      idRequirement: '',
    },
    startingPricePKR: 0,
    publicRackPricePKR: 0,
    corporateDiscountPercent: 0,
    groupDiscountPercent: 0,
    longStayDiscountPercent: 0,
    rooms: [],
    popularFor: [],
  };
}

/**
 * Merges a basic hotel with a live availability response for specific
 * dates, filling in real room types and prices.
 */
export function mergeAvailability(hotel: Hotel, availability: ApiAvailability): Hotel {
  const rooms = availability.roomTypes.map(mapRoomType);
  const cheapest = rooms.reduce(
    (min, r) => (r.publicRatePKR > 0 && r.publicRatePKR < min ? r.publicRatePKR : min),
    Infinity,
  );
  return {
    ...hotel,
    rooms,
    startingPricePKR: Number.isFinite(cheapest) ? cheapest : 0,
    publicRackPricePKR: Number.isFinite(cheapest) ? cheapest : 0,
  };
}
