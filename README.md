# Booking Search Workspace

This workspace contains a small hotel booking demo built with Nx.

It currently includes:

- A `Next.js` frontend for searching hotel stays
- A separate `Node.js` backend that queries Postgres for hotel data
- A Postgres database with booking-oriented schema and seed tooling
- A scalable property/photo seeding pipeline for future large datasets
- An Nx setup so both apps can be run together during development

## What Is Built

The frontend app provides:

- A booking-style search UI
- Destination, check-in, check-out, and guest inputs
- Loading and error states
- Fake hotel result cards with price, rating, and perks

The backend app provides:

- `GET /health`
- `GET /api/hotels`
- Database-backed hotel search results with pricing, amenities, and real image URLs

The frontend does not call the backend directly from the browser. Instead:

1. The UI requests `apps/BookingSearch/src/app/api/hotels/route.ts`
2. That Next route proxies the request to the Node backend
3. The Node backend returns generated hotel data

This keeps the frontend simple and gives you a clean place to grow the backend later.

## Project Structure

```text
apps/
  BookingSearch/
    src/app/
      page.tsx
      layout.tsx
      global.css
      api/hotels/route.ts
      _components/
      _lib/
  booking-api/
    src/server.ts
    project.json

shared/
  booking-search/
    hotel-data.ts
db/
  init/
    001-booking-schema.sql
  seed-data/
scripts/
  fetch-house-photo-catalog.mjs
  seed-booking-data.mjs
```

## Main Files

- `apps/BookingSearch/src/app/page.tsx`
  Thin app entry for the BookingSearch frontend

- `apps/BookingSearch/src/app/_components/`
  UI components for the booking search page

- `apps/BookingSearch/src/app/api/hotels/route.ts`
  Next.js proxy route that forwards hotel searches to the backend

- `apps/booking-api/src/server.ts`
  Node backend server with `/health` and `/api/hotels`

- `apps/booking-api/src/search-hotels.ts`
  Postgres-backed hotel search query

- `db/init/001-booking-schema.sql`
  Database schema for locations, properties, images, amenities, and nightly rates

- `scripts/fetch-house-photo-catalog.mjs`
  Fetches real house-photo metadata from Wikimedia Commons into a local catalog

- `scripts/seed-booking-data.mjs`
  Seeds Postgres with scalable fake booking inventory using the photo catalog

- `shared/booking-search/hotel-data.ts`
  Shared API response types used by frontend and backend

## Getting Started

If this is your first time running the project:

1. Install dependencies:

```sh
npm install
```

2. Start both apps together:

```sh
npm run dev:booking
```

3. Open the frontend in your browser:

```text
http://localhost:3000
```

4. The backend will run on:

```text
http://127.0.0.1:4000
```

If you prefer separate terminals:

1. Start the backend:

```sh
npx nx run @org/booking-api:dev
```

2. Start the frontend:

```sh
npx nx dev BookingSearch
```

## Run The Apps

To start both frontend and backend together:

```sh
npm run dev:booking
```

To run the whole workspace in Docker:

```sh
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

The API will be available at:

```text
http://localhost:4000
```

Postgres will be available at:

```text
localhost:5432
```

If you already created the Postgres volume before the schema files were added, recreate it once so Docker reruns the init scripts:

```sh
docker compose down -v
docker compose up --build
```

To start only the frontend:

```sh
npx nx dev BookingSearch
```

To start only the backend with Nx:

```sh
npx nx run @org/booking-api:dev
```

To start only the backend with npm workspace scripts:

```sh
npm run dev:booking-api
```

## Build Commands

Build the frontend:

```sh
npx nx build BookingSearch
```

Build the backend:

```sh
npx nx run @org/booking-api:build
```

Or:

```sh
npm run build:booking-api
```

## Database Schema

The booking database includes:

- `locations`
  Searchable city/location records

- `properties`
  Core stay inventory with pricing, ratings, guest capacity, and geodata

- `property_images`
  Real property image URLs and source attribution

- `amenities`
  Canonical amenity definitions

- `property_amenities`
  Many-to-many property amenity mapping

- `nightly_rates`
  Per-property, per-date pricing and availability

## Start The Built Backend

```sh
npx nx run @org/booking-api:start
```

Or:

```sh
npm run start:booking-api
```

By default, the backend listens on:

```text
http://127.0.0.1:4000
```

## API Endpoints

Health check:

```text
GET /health
```

Hotel search:

```text
GET /api/hotels?destination=Goa&checkIn=2026-04-20&checkOut=2026-04-23&guests=2
```

Example response shape:

```json
{
  "destination": "Goa",
  "checkIn": "2026-04-20",
  "checkOut": "2026-04-23",
  "guests": 2,
  "results": [
    {
      "id": "goa-1",
      "name": "Velvet Residency",
      "location": "Goa",
      "area": "Marina Bay",
      "distance": "2.5 km from center",
      "price": 8200,
      "rating": 4.6,
      "reviews": 774,
      "image": "linear-gradient(135deg, #1d4ed8, #93c5fd)",
      "perks": ["Pool access", "Ocean view", "Family rooms"]
    }
  ]
}
```

## Environment Notes

The Next proxy route uses this backend base URL by default:

```text
http://127.0.0.1:4000
```

It can be overridden with:

```text
BOOKING_API_URL
```

Inside Docker Compose, the frontend is configured to use:

```text
http://booking-api:4000
```

The Docker Compose stack also provisions Postgres with:

```text
host: postgres
port: 5432
database: booking
user: booking_user
password: booking_password
```

The API container receives these database environment variables:

```text
PGHOST=postgres
PGPORT=5432
PGDATABASE=booking
PGUSER=booking_user
PGPASSWORD=booking_password
DATABASE_URL=postgresql://booking_user:booking_password@postgres:5432/booking
```

The current demo API does not use Postgres yet, but the database is now part of the stack and ready for application code to connect to.
The current app now queries Postgres for hotel search results.

## Docker Files

This repo now includes:

- `Dockerfile.frontend`
  Builds and serves the Next.js frontend on port `3000`

- `Dockerfile.api`
  Builds and runs the booking API on port `4000`

- `docker-compose.yml`
  Starts Postgres, the API, and the frontend together

## Docker Postgres Setup

Start the full stack:

```sh
docker compose up --build
```

Start only Postgres:

```sh
docker compose up postgres
```

Connect with `psql` from your host:

```sh
psql postgresql://booking_user:booking_password@localhost:5432/booking
```

Stop the stack:

```sh
docker compose down
```

Stop the stack and remove the Postgres data volume:

```sh
docker compose down -v
```

## Seed Realistic Booking Data

1. Start Postgres:

```sh
docker compose up -d postgres
```

2. Fetch a reusable real-photo catalog from Wikimedia Commons:

```sh
npm run db:photos
```

3. Seed the database with booking inventory:

```sh
npm run db:seed
```

4. Reset and reseed from scratch:

```sh
npm run db:seed:reset
```

Useful seed controls:

- `SEED_PROPERTY_COUNT=5000 npm run db:seed`
  Seed 5,000 properties

- `SEED_PROPERTY_COUNT=100000 SEED_BATCH_SIZE=2000 npm run db:seed`
  Seed 100,000 properties in larger batches

- `SEED_PROPERTY_COUNT=1000000 SEED_BATCH_SIZE=5000 SEED_RATE_DAYS=30 npm run db:seed`
  Generate 1 million properties with a shorter nightly-rate horizon to keep total row volume manageable

Photo catalog notes:

- The image catalog is stored in `db/seed-data/house-photo-catalog.json`
- The fetch script uses the Wikimedia Commons API and stores attribution/license metadata with each image
- The seeder reuses that catalog across many generated properties so you can scale record counts without scraping every run

## What Has Been Done So Far

- Replaced the starter Nx/Next landing page with a booking search interface
- Replaced the fake hotel search flow with a Postgres-backed search path
- Organized frontend code into components and small libs
- Added a separate Node backend app
- Registered the backend as an Nx project
- Added a booking-oriented Postgres schema
- Added a Wikimedia Commons photo catalog fetcher
- Added a scalable seeding script for large datasets
- Added a single command to run frontend and backend together

## Verification Completed

- Postgres container starts healthy
- Database schema applied successfully
- Real-photo catalog fetched successfully
- Seeded `500` properties, `500` images, and `60,000` nightly rate rows
- API build passes
- Database-backed hotel search returns seeded results

The following commands have already been verified successfully during setup:

- `npx nx build BookingSearch`
- `npm run build:booking-api`
- `npx nx run @org/booking-api:build`
- `npx nx run @org/booking-api:start`

The backend was also smoke-tested with:

- `GET /health`
- `GET /api/hotels`

## Next Good Improvements

Some natural next steps from here would be:

- Add real backend routing with Express or Fastify
- Add request validation for hotel search params
- Add filters like price, rating, and amenities
- Add tests for the backend endpoints
- Add `.env.example` for backend/frontend config
- Replace fake data with a real database or third-party API
