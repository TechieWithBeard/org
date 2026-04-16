export type Hotel = {
  id: string;
  name: string;
  location: string;
  area: string;
  distance: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  perks: string[];
};

export type BookingSearchState = {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type BookingSearchResponse = BookingSearchState & {
  results: Hotel[];
};

export const initialSearchState: BookingSearchState = {
  destination: 'Goa',
  checkIn: '',
  checkOut: '',
  guests: 2,
};

export function getDefaultDates() {
  const now = new Date();
  const checkIn = new Date(now);
  checkIn.setDate(now.getDate() + 7);

  const checkOut = new Date(now);
  checkOut.setDate(now.getDate() + 10);

  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

export function createDefaultSearchState(): BookingSearchState {
  return {
    ...initialSearchState,
    ...getDefaultDates(),
  };
}
