import type { SeededRNG } from '../utils/seeded-rng';

export interface FlightOption {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  class: string;
  stops: number;
}

export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  nights: number;
  total: number;
  amenities: string[];
}

export interface TravelItinerary {
  id: string;
  label: string;
  description: string;
  flight: FlightOption;
  hotel: HotelOption;
  totalCost: number;
}

export function generateTravelOptions(rng: SeededRNG): TravelItinerary[] {
  const airlines = ['Emirates', 'Singapore Airlines', 'Delta', 'United'];
  const hotels = ['The Ritz-Carlton', 'Four Seasons', 'Marriott', 'Hilton Garden Inn'];
  const amenities = [['Spa', 'Pool', 'Gym', 'Concierge'], ['Pool', 'Breakfast', 'WiFi'], ['Gym', 'WiFi', 'Parking'], ['WiFi', 'Breakfast']];

  return [
    {
      id: 'itinerary_a',
      label: 'Option A — Cost Optimized',
      description: 'Best value. Economy class with a comfortable 4-star hotel.',
      flight: {
        id: 'flight_a',
        airline: airlines[rng.int(2, 3)],
        departure: '2026-03-01T08:30:00Z',
        arrival: '2026-03-01T14:45:00Z',
        duration: '6h 15m',
        price: 340 + rng.int(0, 80),
        class: 'Economy',
        stops: 1,
      },
      hotel: {
        id: 'hotel_a',
        name: hotels[rng.int(2, 3)],
        rating: 4.0 + rng.next() * 0.5,
        pricePerNight: 120 + rng.int(0, 30),
        nights: 3,
        total: 0,
        amenities: amenities[2],
      },
      totalCost: 0,
    },
    {
      id: 'itinerary_b',
      label: 'Option B — Comfort Optimized',
      description: 'Premium experience. Business class with a 5-star luxury hotel.',
      flight: {
        id: 'flight_b',
        airline: airlines[rng.int(0, 1)],
        departure: '2026-03-01T10:00:00Z',
        arrival: '2026-03-01T15:30:00Z',
        duration: '5h 30m',
        price: 1200 + rng.int(0, 300),
        class: 'Business',
        stops: 0,
      },
      hotel: {
        id: 'hotel_b',
        name: hotels[rng.int(0, 1)],
        rating: 4.5 + rng.next() * 0.5,
        pricePerNight: 350 + rng.int(0, 100),
        nights: 3,
        total: 0,
        amenities: amenities[0],
      },
      totalCost: 0,
    },
  ].map(it => {
    it.hotel.total = it.hotel.pricePerNight * it.hotel.nights;
    it.totalCost = it.flight.price + it.hotel.total;
    it.hotel.rating = Math.round(it.hotel.rating * 10) / 10;
    return it;
  });
}
