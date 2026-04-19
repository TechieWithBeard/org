import { pool } from './db';

import { HotelSearchResponse } from '../../../shared/booking-search/hotel-data';

type SearchHotelsParams = {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

type HotelRow = {
  id: string;
  name: string;
  location: string;
  area: string;
  distance: string;
  price: number;
  rating: number;
  reviews: number;
  image: string | null;
  perks: string[] | null;
};

function normalizeDate(value: string, fallbackOffsetDays: number) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const fallback = new Date();
    fallback.setUTCDate(fallback.getUTCDate() + fallbackOffsetDays);
    return fallback.toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function buildFallbackImage(destination: string, name: string) {
  const seed = `${destination}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `https://picsum.photos/seed/${seed}/1200/800`;
}

export async function searchHotels({
  destination,
  checkIn,
  checkOut,
  guests,
}: SearchHotelsParams): Promise<HotelSearchResponse> {
  const normalizedDestination = destination.trim() || 'Goa';
  const normalizedCheckIn = normalizeDate(checkIn, 7);
  const normalizedCheckOut = normalizeDate(checkOut, 10);
  const normalizedGuests = Number.isFinite(guests) && guests > 0 ? guests : 2;

  const result = await pool.query<HotelRow>(
    `
      WITH search_window AS (
        SELECT
          $2::date AS check_in,
          GREATEST($3::date, $2::date + 1) AS check_out,
          GREATEST(($3::date - $2::date), 1) AS nights
      )
      SELECT
        p.slug AS id,
        p.name,
        l.city_name AS location,
        p.area_name AS area,
        CONCAT(ROUND(p.distance_km::numeric, 1), ' km from center') AS distance,
        COALESCE(ROUND(AVG(nr.nightly_price_inr)), p.base_price_inr)::integer AS price,
        p.review_score::float8 AS rating,
        p.review_count AS reviews,
        primary_image.image_url AS image,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT a.label), NULL) AS perks
      FROM properties p
      JOIN locations l
        ON l.id = p.location_id
      JOIN search_window sw
        ON TRUE
      LEFT JOIN LATERAL (
        SELECT image_url
        FROM property_images
        WHERE property_id = p.id
        ORDER BY sort_order ASC
        LIMIT 1
      ) AS primary_image
        ON TRUE
      LEFT JOIN nightly_rates nr
        ON nr.property_id = p.id
       AND nr.stay_date >= sw.check_in
       AND nr.stay_date < sw.check_out
       AND nr.available_rooms > 0
       AND nr.min_nights <= sw.nights
      LEFT JOIN property_amenities pa
        ON pa.property_id = p.id
      LEFT JOIN amenities a
        ON a.id = pa.amenity_id
      WHERE p.is_active = TRUE
        AND p.max_guests >= $4
        AND (
          l.city_name ILIKE $1
          OR l.city_slug ILIKE $1
        )
      GROUP BY
        p.id,
        p.slug,
        p.name,
        l.city_name,
        p.area_name,
        p.distance_km,
        p.base_price_inr,
        p.review_score,
        p.review_count,
        primary_image.image_url,
        sw.nights
      HAVING COUNT(DISTINCT nr.stay_date) = sw.nights
      ORDER BY p.review_score DESC, price ASC
      LIMIT 20
    `,
    [normalizedDestination, normalizedCheckIn, normalizedCheckOut, normalizedGuests]
  );

  return {
    destination: normalizedDestination,
    checkIn: normalizedCheckIn,
    checkOut: normalizedCheckOut,
    guests: normalizedGuests,
    results: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      area: row.area,
      distance: row.distance,
      price: row.price,
      rating: row.rating,
      reviews: row.reviews,
      image: row.image || buildFallbackImage(row.location, row.name),
      perks: row.perks?.slice(0, 4) ?? [],
    })),
  };
}
