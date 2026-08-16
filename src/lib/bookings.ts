import { sql } from './db'
import type { Booking, BookingStatus, BookingWithSite } from './types'

export type NewBooking = {
  guestName: string
  phone: string
  rego: string
  siteId: number
  checkIn: string
  checkOut: string
  nuances: string
  depositAmount: number
}

// Postgres DATE columns come back as JS Date objects from the driver, not
// strings — casting to text keeps check_in/check_out as plain 'YYYY-MM-DD'
// strings everywhere else in the app (matching the Booking type and what
// <input type="date"> and the message templates expect).

export async function createBooking(b: NewBooking): Promise<Booking> {
  const rows = await sql`
    INSERT INTO bookings (guest_name, phone, rego, site_id, check_in, check_out, nuances, deposit_amount)
    VALUES (${b.guestName}, ${b.phone}, ${b.rego}, ${b.siteId}, ${b.checkIn}, ${b.checkOut}, ${b.nuances}, ${b.depositAmount})
    RETURNING id, guest_name, phone, rego, site_id,
      to_char(check_in, 'YYYY-MM-DD') AS check_in,
      to_char(check_out, 'YYYY-MM-DD') AS check_out,
      nuances, deposit_amount, status, message_sent_at, receipt_sent_at, created_at
  `
  return rows[0] as Booking
}

export async function listBookings(): Promise<BookingWithSite[]> {
  const rows = await sql`
    SELECT b.id, b.guest_name, b.phone, b.rego, b.site_id,
      to_char(b.check_in, 'YYYY-MM-DD') AS check_in,
      to_char(b.check_out, 'YYYY-MM-DD') AS check_out,
      b.nuances, b.deposit_amount, b.status,
      b.message_sent_at, b.receipt_sent_at, b.created_at,
      s.number AS site_number
    FROM bookings b
    LEFT JOIN sites s ON s.id = b.site_id
    WHERE b.status <> 'cancelled'
    ORDER BY b.check_in DESC
  `
  return rows as BookingWithSite[]
}

// Bookings whose stay covers "today" — this is what drives the dashboard grid.
export async function listActiveToday(): Promise<BookingWithSite[]> {
  const rows = await sql`
    SELECT b.id, b.guest_name, b.phone, b.rego, b.site_id,
      to_char(b.check_in, 'YYYY-MM-DD') AS check_in,
      to_char(b.check_out, 'YYYY-MM-DD') AS check_out,
      b.nuances, b.deposit_amount, b.status,
      b.message_sent_at, b.receipt_sent_at, b.created_at,
      s.number AS site_number
    FROM bookings b
    LEFT JOIN sites s ON s.id = b.site_id
    WHERE b.status IN ('booked', 'checked_in')
      AND b.check_in <= CURRENT_DATE
      AND b.check_out > CURRENT_DATE
  `
  return rows as BookingWithSite[]
}

export async function getBooking(id: number): Promise<BookingWithSite | null> {
  const rows = await sql`
    SELECT b.id, b.guest_name, b.phone, b.rego, b.site_id,
      to_char(b.check_in, 'YYYY-MM-DD') AS check_in,
      to_char(b.check_out, 'YYYY-MM-DD') AS check_out,
      b.nuances, b.deposit_amount, b.status,
      b.message_sent_at, b.receipt_sent_at, b.created_at,
      s.number AS site_number
    FROM bookings b
    LEFT JOIN sites s ON s.id = b.site_id
    WHERE b.id = ${id}
  `
  return (rows[0] as BookingWithSite) ?? null
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<void> {
  await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`
}

export async function updateDepositAmount(id: number, depositAmount: number): Promise<void> {
  await sql`UPDATE bookings SET deposit_amount = ${depositAmount} WHERE id = ${id}`
}

export async function markMessageSent(id: number): Promise<void> {
  await sql`UPDATE bookings SET message_sent_at = now() WHERE id = ${id}`
}

export async function markReceiptSent(id: number): Promise<void> {
  await sql`UPDATE bookings SET receipt_sent_at = now() WHERE id = ${id}`
}
