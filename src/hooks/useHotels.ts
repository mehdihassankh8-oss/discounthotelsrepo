import { useState, useEffect, useCallback, useRef } from 'react';
import { Hotel } from '../types/hotel';
import { fetchHotels, fetchAvailability } from '../services/qloApi';
import { mapHotelBasic, mergeAvailability } from '../services/hotelMapper';

interface UseHotelsResult {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  /** Re-fetches prices/availability for the given dates and guest count. */
  searchDates: (params: { checkIn: string; checkOut: string; adults: number; children: number }) => void;
}

/**
 * Loads the real hotel list on mount (names, addresses, star ratings —
 * always available), then fetches live availability/prices whenever
 * searchDates() is called (e.g. when the user searches or changes dates).
 *
 * Replaces: `import { HOTELS_DATA } from './data/hotels'`
 */
export function useHotels(initialDates: { checkIn: string; checkOut: string; adults: number; children: number }): UseHotelsResult {
  const [basicHotels, setBasicHotels] = useState<Hotel[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDatesRef = useRef(initialDates);

  // Load the hotel list once.
  useEffect(() => {
    let cancelled = false;
    fetchHotels()
      .then(({ hotels: apiHotels }) => {
        if (cancelled) return;
        const mapped = apiHotels.map(mapHotelBasic);
        setBasicHotels(mapped);
        setHotels(mapped);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load hotels');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const searchDates = useCallback(
    (params: { checkIn: string; checkOut: string; adults: number; children: number }) => {
      lastDatesRef.current = params;
      if (basicHotels.length === 0) return;

      setLoading(true);
      setError(null);

      Promise.all(
        basicHotels.map((hotel) =>
          fetchAvailability({
            hotelId: Number(hotel.id),
            dateFrom: params.checkIn,
            dateTo: params.checkOut,
            adults: params.adults,
            children: params.children,
          })
            .then((availability) => mergeAvailability(hotel, availability))
            // A hotel with no rooms for these dates, or a transient error on
            // just this one hotel, shouldn't blank out the whole results page.
            .catch(() => hotel),
        ),
      )
        .then((merged) => {
          // Ignore a result that's no longer for the latest requested dates.
          if (lastDatesRef.current !== params) return;
          setHotels(merged);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Could not check availability');
        })
        .finally(() => setLoading(false));
    },
    [basicHotels],
  );

  // Run the initial search once the hotel list has loaded.
  useEffect(() => {
    if (basicHotels.length > 0) {
      searchDates(initialDates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicHotels]);

  return { hotels, loading, error, searchDates };
}
