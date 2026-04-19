import { Dispatch, FormEventHandler, SetStateAction } from 'react';

import { BookingSearchState } from '../_lib/booking-search';

type SearchFormProps = {
  aiMode: boolean;
  aiPrompt: string;
  loading: boolean;
  search: BookingSearchState;
  setAiMode: Dispatch<SetStateAction<boolean>>;
  setAiPrompt: Dispatch<SetStateAction<string>>;
  setSearch: Dispatch<SetStateAction<BookingSearchState>>;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function SearchForm({
  aiMode,
  aiPrompt,
  loading,
  search,
  setAiMode,
  setAiPrompt,
  setSearch,
  onSubmit,
}: SearchFormProps) {
  return (
    <form className="search-card" onSubmit={onSubmit}>
      <div className="search-card-top">
        <div>
          <p className="search-mode-label">{aiMode ? 'AI search' : 'Classic search'}</p>
          <h2 className="search-card-title">
            {aiMode ? 'Describe the stay you want' : 'Tune your trip details'}
          </h2>
        </div>

        <button
          aria-label={aiMode ? 'Switch to classic search' : 'Switch to AI search'}
          className={`ai-toggle ${aiMode ? 'active' : ''}`}
          onClick={() => setAiMode((current) => !current)}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M12 2l1.8 4.7L18.5 8.5l-4.7 1.8L12 15l-1.8-4.7L5.5 8.5l4.7-1.8L12 2zm6.5 11l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6zM6 14l1.2 3.3L10.5 18l-3.3 1.2L6 22.5l-1.2-3.3L1.5 18l3.3-1.7L6 14z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {aiMode ? (
        <label className="ai-field">
          <span>One prompt instead of destination and dates</span>
          <input
            type="text"
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            placeholder="Beach house in Goa next weekend for 2 guests"
          />
        </label>
      ) : (
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
      )}

      <button className="search-button" type="submit" disabled={loading}>
        {loading ? 'Searching...' : aiMode ? 'Ask AI search' : 'Search stays'}
      </button>
    </form>
  );
}
