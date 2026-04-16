const bookingApiBaseUrl =
  process.env.BOOKING_API_URL || 'http://127.0.0.1:4000';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const apiUrl = new URL('/api/hotels', bookingApiBaseUrl);
  apiUrl.search = requestUrl.search;

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });

    const payload = await response.json();

    return Response.json(payload, {
      status: response.status,
    });
  } catch {
    return Response.json(
      {
        message:
          'Booking backend is unavailable. Start the Node API on http://127.0.0.1:4000.',
      },
      {
        status: 503,
      }
    );
  }
}
