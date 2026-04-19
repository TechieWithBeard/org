import { BookingSearchResponse } from '../_lib/booking-search';

type HotelResultsProps = {
  data: BookingSearchResponse | null;
  error: string | null;
  loading: boolean;
};

export function HotelResults({
  data,
  error,
  loading,
}: HotelResultsProps) {
  return (
    <section className="results-panel">
      <div className="results-header">
        <div>
          <p className="section-label">Search results</p>
          <h2>
            {data ? `${data.results.length} places in ${data.destination}` : 'Top stays'}
          </h2>
        </div>
        {data ? (
          <p className="results-meta">
            {data.guests} guests · {data.checkIn} to {data.checkOut}
          </p>
        ) : null}
      </div>

      {error ? <div className="status-card error-card">{error}</div> : null}

      {loading ? (
        <div className="results-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <article className="hotel-card skeleton-card" key={index}>
              <div className="hotel-image skeleton-block" />
              <div className="hotel-content">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="results-grid">
          {data?.results.map((hotel) => (
            <article className="hotel-card" key={hotel.id}>
              <div
                className="hotel-image"
                style={{
                  backgroundImage: hotel.image.startsWith('http')
                    ? `linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.66)), url(${hotel.image})`
                    : `linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.66)), ${hotel.image}`,
                }}
              >
                <div className="hotel-badge">{hotel.distance}</div>
              </div>

              <div className="hotel-content">
                <div className="hotel-topline">
                  <div>
                    <p className="hotel-location">
                      {hotel.location} · {hotel.area}
                    </p>
                    <h3>{hotel.name}</h3>
                  </div>
                  <div className="rating-pill">
                    <strong>{hotel.rating.toFixed(1)}</strong>
                    <span>{hotel.reviews} reviews</span>
                  </div>
                </div>

                <div className="perk-row">
                  {hotel.perks.map((perk) => (
                    <span className="perk-pill" key={perk}>
                      {perk}
                    </span>
                  ))}
                </div>

                <div className="hotel-footer">
                  <p>
                    <span className="price">₹{hotel.price.toLocaleString('en-IN')}</span>
                    <span className="price-copy"> / night</span>
                  </p>
                  <button className="secondary-button" type="button">
                    View deal
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
