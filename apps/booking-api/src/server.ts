import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';

import { HotelSearchResponse } from '../../../shared/booking-search/hotel-data';
import { searchHotels } from './search-hotels';

const port = Number(process.env.PORT || '4000');
const host = process.env.HOST || '127.0.0.1';

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown> | HotelSearchResponse
) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

async function handleHotels(requestUrl: URL, response: ServerResponse) {
  const destination = requestUrl.searchParams.get('destination')?.trim() || 'Goa';
  const checkIn = requestUrl.searchParams.get('checkIn') || '';
  const checkOut = requestUrl.searchParams.get('checkOut') || '';
  const guests = Number(requestUrl.searchParams.get('guests') || '2');

  try {
    const payload = await searchHotels({
      destination,
      checkIn,
      checkOut,
      guests,
    });

    sendJson(response, 200, payload);
  } catch (error) {
    console.error('Failed to fetch hotels from database', error);
    sendJson(response, 500, {
      message: 'Hotel search is unavailable right now.',
    });
  }
}

async function requestListener(request: IncomingMessage, response: ServerResponse) {
  if (!request.url) {
    sendJson(response, 400, { message: 'Missing request URL.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    response.end();
    return;
  }

  const requestUrl = new URL(request.url, `http://${host}:${port}`);

  if (request.method === 'GET' && requestUrl.pathname === '/health') {
    sendJson(response, 200, { ok: true, service: 'booking-api' });
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/hotels') {
    await handleHotels(requestUrl, response);
    return;
  }

  sendJson(response, 404, { message: 'Route not found.' });
}

createServer(requestListener).listen(port, host, () => {
  console.log(`Booking API listening on http://${host}:${port}`);
});
