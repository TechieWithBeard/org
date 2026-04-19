import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://booking_user:booking_password@127.0.0.1:5432/booking';

export const pool = new Pool({
  connectionString,
});
