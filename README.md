# Booking Search Workspace

This workspace contains a small hotel booking demo built with Nx.

It currently includes:

- A `Next.js` frontend for searching hotel stays
- A separate `Node.js` backend that returns fake hotel data
- Shared hotel data generation logic used by the backend
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
- Deterministic fake hotel results based on the query params

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

- `shared/booking-search/hotel-data.ts`
  Shared fake hotel generator used by the backend

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

## What Has Been Done So Far

- Replaced the starter Nx/Next landing page with a booking search interface
- Added a fake hotel search API flow
- Organized frontend code into components and small libs
- Added a separate Node backend app
- Registered the backend as an Nx project
- Added a shared hotel data generator
- Added a single command to run frontend and backend together

## Verification Completed

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
