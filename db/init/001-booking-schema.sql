CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug TEXT NOT NULL UNIQUE,
  city_name TEXT NOT NULL,
  state_name TEXT,
  country_code CHAR(2) NOT NULL DEFAULT 'IN',
  center_latitude NUMERIC(9, 6) NOT NULL,
  center_longitude NUMERIC(9, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  property_type TEXT NOT NULL,
  star_rating NUMERIC(2, 1) NOT NULL,
  review_score NUMERIC(2, 1) NOT NULL,
  review_count INTEGER NOT NULL,
  area_name TEXT NOT NULL,
  address_line TEXT NOT NULL,
  distance_km NUMERIC(5, 2) NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  description TEXT NOT NULL,
  base_price_inr INTEGER NOT NULL,
  taxes_and_fees_inr INTEGER NOT NULL DEFAULT 0,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  photographer_name TEXT,
  photographer_profile_url TEXT,
  source_name TEXT NOT NULL,
  source_page_url TEXT,
  source_license TEXT,
  alt_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE property_images
  ADD CONSTRAINT property_images_property_sort_order_unique
  UNIQUE (property_id, sort_order);

CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_amenities (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS nightly_rates (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  stay_date DATE NOT NULL,
  nightly_price_inr INTEGER NOT NULL,
  available_rooms INTEGER NOT NULL,
  min_nights INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (property_id, stay_date)
);

CREATE INDEX IF NOT EXISTS idx_locations_city_name
  ON locations (city_name);

CREATE INDEX IF NOT EXISTS idx_properties_location_id
  ON properties (location_id);

CREATE INDEX IF NOT EXISTS idx_properties_active_price
  ON properties (is_active, base_price_inr);

CREATE INDEX IF NOT EXISTS idx_properties_review_score
  ON properties (review_score DESC, review_count DESC);

CREATE INDEX IF NOT EXISTS idx_nightly_rates_stay_date
  ON nightly_rates (stay_date);

CREATE INDEX IF NOT EXISTS idx_nightly_rates_property_date
  ON nightly_rates (property_id, stay_date);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id
  ON property_images (property_id, sort_order);

INSERT INTO amenities (slug, label, category)
VALUES
  ('breakfast-included', 'Breakfast included', 'food'),
  ('free-cancellation', 'Free cancellation', 'policy'),
  ('pool-access', 'Pool access', 'wellness'),
  ('airport-shuttle', 'Airport shuttle', 'transport'),
  ('pay-at-property', 'Pay at property', 'policy'),
  ('ocean-view', 'Ocean view', 'view'),
  ('spa-access', 'Spa access', 'wellness'),
  ('family-rooms', 'Family rooms', 'room'),
  ('pet-friendly', 'Pet friendly', 'policy'),
  ('workspace', 'Dedicated workspace', 'business'),
  ('self-check-in', 'Self check-in', 'convenience'),
  ('kitchen', 'Kitchen', 'room')
ON CONFLICT (slug) DO NOTHING;
