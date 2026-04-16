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

export type HotelSearchResponse = {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  results: Hotel[];
};

const hotelPrefixes = [
  'Grand',
  'Azure',
  'Golden',
  'Harbor',
  'Velvet',
  'Palm',
  'Luna',
  'Saffron',
  'Regal',
  'Cove',
];

const hotelSuffixes = [
  'Resort',
  'Suites',
  'Retreat',
  'Inn',
  'House',
  'Palace',
  'Residency',
  'Stay',
  'Collection',
  'Haven',
];

const areas = [
  'City Center',
  'Beachfront',
  'Old Quarter',
  'Riverside',
  'Business District',
  'Cliffside',
  'Marina Bay',
  'Market Walk',
];

const perkPool = [
  'Breakfast included',
  'Free cancellation',
  'Pool access',
  'Airport shuttle',
  'Pay at property',
  'Ocean view',
  'Spa access',
  'Family rooms',
];

const gradients = [
  'linear-gradient(135deg, #0f766e, #5eead4)',
  'linear-gradient(135deg, #1d4ed8, #93c5fd)',
  'linear-gradient(135deg, #7c2d12, #fdba74)',
  'linear-gradient(135deg, #3f3f46, #d4d4d8)',
  'linear-gradient(135deg, #14532d, #86efac)',
  'linear-gradient(135deg, #9a3412, #fcd34d)',
];

function seededValue(seed: string, index: number) {
  return Array.from(`${seed}-${index}`).reduce(
    (sum, char, position) => sum + char.charCodeAt(0) * (position + 1),
    0
  );
}

function pick<T>(list: T[], value: number) {
  return list[value % list.length];
}

function buildHotel(seed: string, destination: string, guests: number, index: number): Hotel {
  const base = seededValue(seed, index);
  const rating = 3.8 + (base % 13) / 10;
  const price = 4200 + (base % 14) * 850 + Math.max(0, guests - 1) * 600;

  return {
    id: `${destination.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
    name: `${pick(hotelPrefixes, base)} ${pick(hotelSuffixes, base + 2)}`,
    location: destination,
    area: pick(areas, base + 4),
    distance: `${((base % 25) + 1) / 2} km from center`,
    price,
    rating: Number(Math.min(rating, 4.9).toFixed(1)),
    reviews: 120 + (base % 900),
    image: pick(gradients, base + 1),
    perks: [
      pick(perkPool, base),
      pick(perkPool, base + 3),
      pick(perkPool, base + 5),
    ].filter((perk, perkIndex, allPerks) => allPerks.indexOf(perk) === perkIndex),
  };
}

export function createHotelSearchResponse(
  destination: string,
  checkIn: string,
  checkOut: string,
  guests: number
): HotelSearchResponse {
  const seed = `${destination}-${checkIn}-${checkOut}-${guests}`;

  return {
    destination,
    checkIn,
    checkOut,
    guests,
    results: Array.from({ length: 8 }, (_, index) =>
      buildHotel(seed, destination, guests, index)
    ),
  };
}
