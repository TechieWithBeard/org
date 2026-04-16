import { Dispatch, FormEventHandler, SetStateAction } from 'react';

import { BookingSearchState } from '../_lib/booking-search';

type SearchFormProps = {
  loading: boolean;
  search: BookingSearchState;
  setSearch: Dispatch<SetStateAction<BookingSearchState>>;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function SearchForm({
  loading,
  search,
  setSearch,
  onSubmit,
}: SearchFormProps) {
  return (
    <form className="search-card" onSubmit={onSubmit}>
      <div className="search-grid">
        <label className="field">
          <span>Destination</span>
          <input
            type="text"
            value={search.destination}
            onChange={(event) =>
              setSearch((current) => ({
                ...current,
                destination: event.target.value,
              }))
            }
            placeholder="Where are you going?"
          />
        </label>

        <label className="field">
          <span>Check-in</span>
          <input
            type="date"
            value={search.checkIn}
            onChange={(event) =>
              setSearch((current) => ({
                ...current,
                checkIn: event.target.value,
              }))
            }
          />
        </label>

        <label className="field">
          <span>Check-out</span>
          <input
            type="date"
            value={search.checkOut}
            min={search.checkIn}
            onChange={(event) =>
              setSearch((current) => ({
                ...current,
                checkOut: event.target.value,
              }))
            }
          />
        </label>

        <label className="field">
          <span>Guests</span>
          <input
            type="number"
            min="1"
            max="8"
            value={search.guests}
            onChange={(event) =>
              setSearch((current) => ({
                ...current,
                guests: Number(event.target.value) || 1,
              }))
            }
          />
        </label>
      </div>

      <button className="search-button" type="submit" disabled={loading}>
        {loading ? 'Searching...' : 'Search stays'}
      </button>
    </form>
  );
}
