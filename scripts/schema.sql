-- Idempotent schema for the Winton Wanderers booking tool.
-- Safe to run repeatedly (used both for first-time setup and future deploys).

CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  powered BOOLEAN NOT NULL DEFAULT false,
  pet_friendly BOOLEAN NOT NULL DEFAULT false,
  waterfront BOOLEAN NOT NULL DEFAULT false,
  accessible BOOLEAN NOT NULL DEFAULT false,
  size TEXT NOT NULL DEFAULT 'standard', -- 'small' | 'standard' | 'large'
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  rego TEXT NOT NULL DEFAULT '',
  site_id INTEGER REFERENCES sites(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nuances TEXT NOT NULL DEFAULT '',
  deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'booked', -- 'booked' | 'checked_in' | 'checked_out' | 'cancelled'
  message_sent_at TIMESTAMPTZ,
  receipt_sent_at TIMESTAMPTZ,
  stripe_session_id TEXT,
  stripe_checkout_url TEXT,
  paid_at TIMESTAMPTZ, -- set by the Stripe webhook once the deposit is paid online
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ALTER ... ADD COLUMN IF NOT EXISTS so this stays safe to re-run against a
-- database that already had the bookings table from before these columns existed.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS bookings_site_dates_idx ON bookings (site_id, check_in, check_out) WHERE status <> 'cancelled';
