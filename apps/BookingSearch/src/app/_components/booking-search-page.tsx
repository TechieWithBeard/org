'use client';

import { FormEvent, useEffect, useState } from 'react';

import {
  BookingSearchState,
  BookingSearchResponse,
  createDefaultSearchState,
  initialSearchState,
} from '../_lib/booking-search';
import { HotelResults } from './hotel-results';
import { SearchForm } from './search-form';

async function fetchHotels(params: BookingSearchState) {
  const query = new URLSearchParams({
    destination: params.destination,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: String(params.guests),
  });

  const response = await fetch(`/api/hotels?${query.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load hotels right now.');
  }

  return (await response.json()) as BookingSearchResponse;
}

export function BookingSearchPage() {
  const [search, setSearch] = useState<BookingSearchState>(initialSearchState);
  const [data, setData] = useState<BookingSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHotels(params: BookingSearchState) {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchHotels(params);
      setData(result);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : 'Something went wrong while loading results.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const nextSearch = createDefaultSearchState();
    setSearch(nextSearch);
    loadHotels(nextSearch);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadHotels(search);
  }

  return (
    <main className="booking-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Stay smarter</span>
          <h1>Find a stay that feels worth the trip.</h1>
          <p>
            Search curated hotels with strong ratings, flexible perks, and
            pricing that is easy to compare at a glance.
          </p>
        </div>

        <SearchForm
          loading={loading}
          search={search}
          setSearch={setSearch}
          onSubmit={handleSubmit}
        />
      </section>

      <HotelResults data={data} error={error} loading={loading} />
    </main>
  );
}
