import Stripe from 'stripe'
import type { Booking } from './types'

const PARK_NAME = process.env.PARK_NAME || 'the park'

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key)
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

// Creates a fresh Checkout Session for a booking's deposit. Stripe Checkout
// links expire after 24 hours, so this is called right before a message is
// sent rather than once at booking creation — a booking made weeks ahead of
// the stay always gets a link that's actually still valid when it's used.
export async function createCheckoutSession(
  booking: Booking,
  siteNumber: string,
  baseUrl: string
): Promise<{ sessionId: string; url: string } | null> {
  const stripe = getStripe()
  if (!stripe) return null

  const amount = Math.round(Number(booking.deposit_amount) * 100)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'aud',
          unit_amount: amount,
          product_data: {
            name: `${PARK_NAME} — deposit for site ${siteNumber}`,
            description: `${booking.check_in} to ${booking.check_out}`,
          },
        },
      },
    ],
    metadata: { bookingId: String(booking.id) },
    success_url: `${baseUrl}/pay/success`,
    cancel_url: `${baseUrl}/pay/cancelled`,
  })

  if (!session.url) return null
  return { sessionId: session.id, url: session.url }
}

export function verifyWebhookSignature(rawBody: string, signature: string): Stripe.Event | null {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return null
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch {
    return null
  }
}
