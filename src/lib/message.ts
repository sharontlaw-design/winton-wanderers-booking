import { format, parseISO } from 'date-fns'
import type { Booking } from './types'

const PARK_NAME = process.env.PARK_NAME || 'the park'

function fmt(isoDate: string) {
  return format(parseISO(isoDate), 'd MMM yyyy')
}

function money(amount: string | number) {
  return Number(amount).toFixed(2)
}

// The text she currently copies from notes and hand-edits per booking.
// `paymentUrl` is only passed when Stripe is configured and the deposit
// hasn't been paid yet — otherwise this reads exactly as it did before
// Stripe existed, so the message stays sensible for manually-tracked deposits.
export function confirmationMessage(booking: Booking, siteNumber: string, paymentUrl?: string | null) {
  const intro = `Hi ${booking.guest_name}, your site is booked at ${PARK_NAME}! Site ${siteNumber}, ${fmt(booking.check_in)} to ${fmt(booking.check_out)}.`

  if (!booking.paid_at && paymentUrl) {
    return `${intro} To secure your site, pay your $${money(booking.deposit_amount)} deposit here: ${paymentUrl}`
  }
  return `${intro} Deposit received: $${money(booking.deposit_amount)}. See you soon!`
}

// Replaces the photo of the paper receipt she currently texts across.
export function receiptMessage(booking: Booking, siteNumber: string) {
  return (
    `${PARK_NAME} - booking receipt\n` +
    `${booking.guest_name}\n` +
    `Site ${siteNumber}\n` +
    `${fmt(booking.check_in)} - ${fmt(booking.check_out)}\n` +
    `Deposit paid: $${money(booking.deposit_amount)}`
  )
}
