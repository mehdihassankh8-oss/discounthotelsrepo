/**
 * Talks ONLY to our own backend (server.js), never to QloApps directly.
 * The QloApps API key must never appear in frontend code or requests.
 *
 * Set VITE_API_BASE_URL in your .env file, e.g.:
 *   VITE_API_BASE_URL=http://localhost:3001
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface ApiHotel {
  id: number;
  name: string;
  city: string;
  address: string;
  stars: number | null;
  checkIn: string | null;
  checkOut: string | null;
  shortDescription: string;
  roomTypeIds: number[];
}

export interface ApiRoomType {
  roomTypeId: number;
  name: string;
  availableRooms: number;
  /** Single all-in guest price (the backend adds markup and tax; the browser never sees a breakdown). */
  totalPrice: number;
  pricePerNight: number;
}

export interface ApiAvailability {
  hotelId: number;
  currency: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  nights: number;
  roomTypes: ApiRoomType[];
}

export interface ApiBookingRequest {
  hotelId: number;
  roomTypeId: number;
  dateFrom: string;
  dateTo: string;
  adults: number;
  children: number;
  guest: { firstName: string; lastName: string; email: string; phone: string };
  idempotencyKey: string;
  hotelName?: string; // display only; stored with the signed-in user's booking
}

export interface ApiBookingResult {
  bookingId: number | null;
  currency: string;
  totalPrice: number;
  roomType: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // send the login session cookie
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && typeof data.error === 'string') ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function fetchHotels(): Promise<{ hotels: ApiHotel[] }> {
  return request('/api/hotels');
}

export function fetchAvailability(params: {
  hotelId: number;
  dateFrom: string;
  dateTo: string;
  adults: number;
  children: number;
}): Promise<ApiAvailability> {
  return request('/api/availability', { method: 'POST', body: JSON.stringify(params) });
}

export function createBooking(payload: ApiBookingRequest): Promise<ApiBookingResult> {
  return request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
}

/** Generates a fresh key per booking attempt, so a retry/double-click is safe. */
export function newIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- Accounts ----------------------------------------------------------
export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: 'guest' | 'corporate' | 'vip';
  joinedDate: string;
  qloCustomerId: number | null;
}

export function apiSignup(p: { fullName: string; email: string; mobile: string; password: string }): Promise<{ user: ApiUser }> {
  return request('/api/auth/signup', { method: 'POST', body: JSON.stringify(p) });
}

export function apiLogin(p: { identifier: string; password: string }): Promise<{ user: ApiUser }> {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(p) });
}

export function apiLogout(): Promise<{ ok: boolean }> {
  return request('/api/auth/logout', { method: 'POST' });
}

export function apiMe(): Promise<{ user: ApiUser }> {
  return request('/api/auth/me');
}

export interface ApiMyBooking {
  bookingId: number | null;
  hotelId: number;
  hotelName?: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  currency: string;
  totalPrice: number | null;
  createdAt: string;
  /** Booking status as QloApps reports it (e.g. "Awaiting confirmation", "Confirmed", "Cancelled"). Optional until the backend sends it. */
  status?: string | null;
}

export function apiMyBookings(): Promise<{ bookings: ApiMyBooking[] }> {
  return request('/api/my/bookings');
}
