import { readFile } from 'node:fs/promises';
import path from 'node:path';

import pg from 'pg';

const { Pool } = pg;

const catalogPath =
  process.env.PHOTO_CATALOG_PATH ||
  path.join(process.cwd(), 'db', 'seed-data', 'house-photo-catalog.json');
const batchSize = Number(process.env.SEED_BATCH_SIZE || '1000');
const propertyCount = Number(process.env.SEED_PROPERTY_COUNT || '5000');
const daysOfRates = Number(process.env.SEED_RATE_DAYS || '120');
const resetExisting = process.env.SEED_RESET === 'true';

const defaultConnectionString =
  process.env.DATABASE_URL ||
  'postgresql://booking_user:booking_password@127.0.0.1:5432/booking';

const cityCatalog = [
  ['goa', 'Goa', 'Goa', 'IN', 15.4909, 73.8278],
  ['jaipur', 'Jaipur', 'Rajasthan', 'IN', 26.9124, 75.7873],
  ['udaipur', 'Udaipur', 'Rajasthan', 'IN', 24.5854, 73.7125],
  ['manali', 'Manali', 'Himachal Pradesh', 'IN', 32.2432, 77.1892],
  ['mumbai', 'Mumbai', 'Maharashtra', 'IN', 19.076, 72.8777],
  ['bengaluru', 'Bengaluru', 'Karnataka', 'IN', 12.9716, 77.5946],
  ['kochi', 'Kochi', 'Kerala', 'IN', 9.9312, 76.2673],
  ['pondicherry', 'Pondicherry', 'Puducherry', 'IN', 11.9416, 79.8083],
  ['darjeeling', 'Darjeeling', 'West Bengal', 'IN', 27.041, 88.2663],
  ['ooty', 'Ooty', 'Tamil Nadu', 'IN', 11.4064, 76.6932],
];

const areaCatalog = [
  'City Center',
  'Beachfront',
  'Old Quarter',
  'Riverside',
  'Business District',
  'Cliffside',
  'Marina Bay',
  'Market Walk',
  'Heritage Block',
  'Lakeside',
  'Garden District',
  'Sunset Point',
];

const streetCatalog = [
  'Palm Residency Road',
  'Harbor View Lane',
  'Lotus Garden Street',
  'Fort Market Road',
  'Bluewater Avenue',
  'Coconut Grove Lane',
  'Hill Crest Path',
  'Coral Bay Drive',
  'Sunrise Terrace',
  'Cedar House Road',
];

const namePrefixes = [
  'Azure',
  'Golden',
  'Harbor',
  'Velvet',
  'Palm',
  'Luna',
  'Saffron',
  'Regal',
  'Cove',
  'Juniper',
  'Casa',
  'Horizon',
];

const nameSuffixes = [
  'Residency',
  'House',
  'Retreat',
  'Suites',
  'Villas',
  'Stay',
  'Collection',
  'Haven',
  'Manor',
  'Residences',
];

const propertyTypes = ['hotel', 'villa', 'apartment', 'homestay', 'resort'];
const amenitySlugs = [
  'breakfast-included',
  'free-cancellation',
  'pool-access',
  'airport-shuttle',
  'pay-at-property',
  'ocean-view',
  'spa-access',
  'family-rooms',
  'pet-friendly',
  'workspace',
  'self-check-in',
  'kitchen',
];

function seededValue(seed, index) {
  return Array.from(`${seed}-${index}`).reduce(
    (sum, character, position) => sum + character.charCodeAt(0) * (position + 1),
    0
  );
}

function pick(list, value) {
  return list[value % list.length];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function chunk(list, size) {
  const result = [];

  for (let index = 0; index < list.length; index += size) {
    result.push(list.slice(index, index + size));
  }

  return result;
}

async function loadPhotoCatalog() {
  const rawCatalog = await readFile(catalogPath, 'utf8');
  const parsedCatalog = JSON.parse(rawCatalog);

  if (!Array.isArray(parsedCatalog.photos) || parsedCatalog.photos.length === 0) {
    throw new Error(
      `Photo catalog at ${catalogPath} is empty. Run the photo fetch script first.`
    );
  }

  return parsedCatalog.photos;
}

function buildPropertyRecord(index, photos) {
  const location = cityCatalog[index % cityCatalog.length];
  const [citySlug, cityName, stateName, countryCode, latitude, longitude] = location;
  const seed = `${citySlug}-${index}`;
  const base = seededValue(seed, index);
  const propertyType = pick(propertyTypes, base);
  const areaName = pick(areaCatalog, base + 3);
  const photo = photos[index % photos.length];
  const bedrooms = propertyType === 'hotel' ? 1 : 1 + (base % 4);
  const bathrooms = Math.max(1, bedrooms - 1 + (base % 2));
  const beds = Math.max(bedrooms + 1, bedrooms + (base % 3));
  const maxGuests = clamp(beds + (base % 3), 2, 12);
  const basePrice = 3200 + (base % 15) * 850;
  const taxes = Math.round(basePrice * 0.12);
  const propertyName = `${pick(namePrefixes, base)} ${pick(nameSuffixes, base + 5)}`;
  const slug = `${citySlug}-${propertyName}-${index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const latOffset = ((base % 200) - 100) / 1000;
  const lonOffset = (((base * 3) % 200) - 100) / 1000;
  const reviewScore = Number((4 + (base % 10) / 10).toFixed(1));
  const starRating = Number((3 + (base % 3) * 0.5 + 1).toFixed(1));
  const reviewCount = 80 + (base % 2400);
  const streetNumber = 10 + (base % 300);
  const addressLine = `${streetNumber} ${pick(streetCatalog, base + 7)}, ${areaName}`;
  const distanceKm = Number((((base % 24) + 1) / 2).toFixed(1));
  const description =
    `${propertyName} is a ${propertyType} stay in ${cityName} with strong guest ratings, spacious interiors, and a location that works well for short and extended trips.`;

  const amenities = Array.from({ length: 4 + (base % 3) }, (_, amenityIndex) =>
    pick(amenitySlugs, base + amenityIndex * 2)
  ).filter((amenity, amenityIndex, allAmenities) => allAmenities.indexOf(amenity) === amenityIndex);

  return {
    location: {
      citySlug,
      cityName,
      stateName,
      countryCode,
      latitude,
      longitude,
    },
    property: {
      slug,
      name: propertyName,
      propertyType,
      starRating,
      reviewScore,
      reviewCount,
      areaName,
      addressLine,
      distanceKm,
      latitude: Number((latitude + latOffset).toFixed(6)),
      longitude: Number((longitude + lonOffset).toFixed(6)),
      description,
      basePrice,
      taxes,
      maxGuests,
      bedrooms,
      bathrooms,
      beds,
      photo,
      amenities,
    },
  };
}

function buildRateRows(propertySlug, basePrice) {
  const rows = [];
  const today = new Date();

  for (let offset = 0; offset < daysOfRates; offset += 1) {
    const stayDate = new Date(today);
    stayDate.setUTCDate(today.getUTCDate() + offset);
    const weekday = stayDate.getUTCDay();
    const weekendMultiplier = weekday === 5 || weekday === 6 ? 1.22 : 1;
    const seasonalMultiplier = 1 + ((offset % 45) / 100);

    rows.push({
      propertySlug,
      stayDate: stayDate.toISOString().slice(0, 10),
      nightlyPrice: Math.round(basePrice * weekendMultiplier * seasonalMultiplier),
      availableRooms: 2 + (offset % 8),
      minNights: weekday === 5 ? 2 : 1,
    });
  }

  return rows;
}

async function insertJsonRows(client, sql, rows) {
  if (rows.length === 0) {
    return;
  }

  await client.query(sql, [JSON.stringify(rows)]);
}

async function resetTables(client) {
  await client.query(`
    TRUNCATE TABLE
      nightly_rates,
      property_amenities,
      property_images,
      properties,
      locations
    RESTART IDENTITY CASCADE
  `);
}

async function ensureLocations(client, uniqueLocations) {
  const rows = uniqueLocations.map((location) => ({
    city_slug: location.citySlug,
    city_name: location.cityName,
    state_name: location.stateName,
    country_code: location.countryCode,
    center_latitude: location.latitude,
    center_longitude: location.longitude,
  }));

  const values = [];
  const placeholders = rows.map((row, rowIndex) => {
    const baseIndex = rowIndex * 6;
    values.push(
      row.city_slug,
      row.city_name,
      row.state_name,
      row.country_code,
      row.center_latitude,
      row.center_longitude
    );

    return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`;
  });

  await client.query(
    `
      INSERT INTO locations (
        city_slug,
        city_name,
        state_name,
        country_code,
        center_latitude,
        center_longitude
      )
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (city_slug) DO UPDATE
      SET
        city_name = EXCLUDED.city_name,
        state_name = EXCLUDED.state_name,
        country_code = EXCLUDED.country_code,
        center_latitude = EXCLUDED.center_latitude,
        center_longitude = EXCLUDED.center_longitude
    `,
    values
  );
}

async function loadLocationIds(client) {
  const result = await client.query('SELECT city_slug, id FROM locations');

  return new Map(result.rows.map((row) => [row.city_slug, row.id]));
}

async function loadAmenityIds(client) {
  const result = await client.query('SELECT slug, id FROM amenities');

  return new Map(result.rows.map((row) => [row.slug, row.id]));
}

async function insertProperties(client, propertyRows) {
  if (propertyRows.length === 0) {
    return;
  }

  const columns = [
    'slug',
    'location_id',
    'name',
    'property_type',
    'star_rating',
    'review_score',
    'review_count',
    'area_name',
    'address_line',
    'distance_km',
    'latitude',
    'longitude',
    'description',
    'base_price_inr',
    'taxes_and_fees_inr',
    'max_guests',
    'bedrooms',
    'bathrooms',
    'beds',
    'is_active',
  ];

  const values = [];
  const placeholders = propertyRows.map((row, rowIndex) => {
    const baseIndex = rowIndex * columns.length;

    values.push(
      row.slug,
      row.locationId,
      row.name,
      row.propertyType,
      row.starRating,
      row.reviewScore,
      row.reviewCount,
      row.areaName,
      row.addressLine,
      row.distanceKm,
      row.latitude,
      row.longitude,
      row.description,
      row.basePrice,
      row.taxes,
      row.maxGuests,
      row.bedrooms,
      row.bathrooms,
      row.beds,
      true
    );

    return `(${Array.from({ length: columns.length }, (_, index) => `$${baseIndex + index + 1}`).join(', ')})`;
  });

  await client.query(
    `
      INSERT INTO properties (
        ${columns.join(', ')}
      )
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (slug) DO NOTHING
    `,
    values
  );
}

async function loadPropertyIds(client, slugs) {
  const result = await client.query(
    'SELECT slug, id FROM properties WHERE slug = ANY($1)',
    [slugs]
  );

  return new Map(result.rows.map((row) => [row.slug, row.id]));
}

async function insertPropertyImages(client, imageRows) {
  await insertJsonRows(
    client,
    `
      INSERT INTO property_images (
        property_id,
        image_url,
        thumbnail_url,
        photographer_name,
        photographer_profile_url,
        source_name,
        source_page_url,
        source_license,
        alt_text,
        sort_order
      )
      SELECT
        property_id::uuid,
        image_url,
        thumbnail_url,
        photographer_name,
        photographer_profile_url,
        source_name,
        source_page_url,
        source_license,
        alt_text,
        sort_order::integer
      FROM jsonb_to_recordset($1::jsonb) AS rows(
        property_id text,
        image_url text,
        thumbnail_url text,
        photographer_name text,
        photographer_profile_url text,
        source_name text,
        source_page_url text,
        source_license text,
        alt_text text,
        sort_order integer
      )
      ON CONFLICT (property_id, sort_order) DO UPDATE
      SET
        image_url = EXCLUDED.image_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        photographer_name = EXCLUDED.photographer_name,
        photographer_profile_url = EXCLUDED.photographer_profile_url,
        source_name = EXCLUDED.source_name,
        source_page_url = EXCLUDED.source_page_url,
        source_license = EXCLUDED.source_license,
        alt_text = EXCLUDED.alt_text
    `,
    imageRows
  );
}

async function insertPropertyAmenities(client, amenityRows) {
  await insertJsonRows(
    client,
    `
      INSERT INTO property_amenities (
        property_id,
        amenity_id
      )
      SELECT
        property_id::uuid,
        amenity_id::uuid
      FROM jsonb_to_recordset($1::jsonb) AS rows(
        property_id text,
        amenity_id text
      )
      ON CONFLICT (property_id, amenity_id) DO NOTHING
    `,
    amenityRows
  );
}

async function insertNightlyRates(client, rateRows) {
  await insertJsonRows(
    client,
    `
      INSERT INTO nightly_rates (
        property_id,
        stay_date,
        nightly_price_inr,
        available_rooms,
        min_nights
      )
      SELECT
        property_id::uuid,
        stay_date::date,
        nightly_price_inr::integer,
        available_rooms::integer,
        min_nights::integer
      FROM jsonb_to_recordset($1::jsonb) AS rows(
        property_id text,
        stay_date text,
        nightly_price_inr integer,
        available_rooms integer,
        min_nights integer
      )
      ON CONFLICT (property_id, stay_date) DO UPDATE
      SET
        nightly_price_inr = EXCLUDED.nightly_price_inr,
        available_rooms = EXCLUDED.available_rooms,
        min_nights = EXCLUDED.min_nights
    `,
    rateRows
  );
}

async function main() {
  const photos = await loadPhotoCatalog();
  const pool = new Pool({
    connectionString: defaultConnectionString,
  });

  const client = await pool.connect();

  try {
    if (resetExisting) {
      await resetTables(client);
    }

    const propertyRecords = Array.from({ length: propertyCount }, (_, index) =>
      buildPropertyRecord(index, photos)
    );

    const uniqueLocations = Array.from(
      new Map(
        propertyRecords.map((record) => [record.location.citySlug, record.location])
      ).values()
    );

    await ensureLocations(client, uniqueLocations);

    const locationIds = await loadLocationIds(client);
    const amenityIds = await loadAmenityIds(client);

    for (const propertyBatch of chunk(propertyRecords, batchSize)) {
      const propertyRows = propertyBatch.map(({ location, property }) => ({
        locationId: locationIds.get(location.citySlug),
        ...property,
      }));

      await insertProperties(client, propertyRows);

      const propertyIds = await loadPropertyIds(
        client,
        propertyRows.map((row) => row.slug)
      );

      const imageRows = propertyRows.flatMap((row) => {
        const propertyId = propertyIds.get(row.slug);
        if (!propertyId) {
          return [];
        }

        return [
          {
            property_id: propertyId,
            image_url: row.photo.imageUrl,
            thumbnail_url: row.photo.thumbnailUrl,
            photographer_name: row.photo.photographerName,
            photographer_profile_url: row.photo.photographerProfileUrl,
            source_name: row.photo.sourceName,
            source_page_url: row.photo.sourcePageUrl,
            source_license: row.photo.sourceLicense,
            alt_text: `${row.name} exterior`,
            sort_order: 0,
          },
        ];
      });

      const amenityRows = propertyRows.flatMap((row) => {
        const propertyId = propertyIds.get(row.slug);
        if (!propertyId) {
          return [];
        }

        return row.amenities
          .map((amenitySlug) => amenityIds.get(amenitySlug))
          .filter(Boolean)
          .map((amenityId) => ({
            property_id: propertyId,
            amenity_id: amenityId,
          }));
      });

      const rateRows = propertyRows.flatMap((row) => {
        const propertyId = propertyIds.get(row.slug);
        if (!propertyId) {
          return [];
        }

        return buildRateRows(row.slug, row.basePrice).map((rate) => ({
          property_id: propertyId,
          stay_date: rate.stayDate,
          nightly_price_inr: rate.nightlyPrice,
          available_rooms: rate.availableRooms,
          min_nights: rate.minNights,
        }));
      });

      await insertPropertyImages(client, imageRows);
      await insertPropertyAmenities(client, amenityRows);
      await insertNightlyRates(client, rateRows);

      console.log(`Seeded ${propertyRows.length} properties in current batch`);
    }

    console.log(`Finished seeding ${propertyCount} properties`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
