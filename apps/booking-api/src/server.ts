import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';

import {
  createHotelSearchResponse,
  HotelSearchResponse,
} from '../../../shared/booking-search/hotel-data';

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

function handleHotels(requestUrl: URL, response: ServerResponse) {
  const destination = requestUrl.searchParams.get('destination')?.trim() || 'Goa';
  const checkIn = requestUrl.searchParams.get('checkIn') || '';
  const checkOut = requestUrl.searchParams.get('checkOut') || '';
  const guests = Number(requestUrl.searchParams.get('guests') || '2');

  sendJson(
    response,
    200,
    createHotelSearchResponse(destination, checkIn, checkOut, guests)
  );
}

function requestListener(request: IncomingMessage, response: ServerResponse) {
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
    handleHotels(requestUrl, response);
    return;
  }

  sendJson(response, 404, { message: 'Route not found.' });
}

createServer(requestListener).listen(port, host, () => {
  console.log(`Booking API listening on http://${host}:${port}`);
});
