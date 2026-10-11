import { NextResponse } from 'next/server'
import { getBooking, markPaidViaStripe, markReceiptSent } from '@/lib/bookings'
import { verifyWebhookSignature } from '@/lib/stripe'
import { sendSms } from '@/lib/sms'
import { receiptMessage } from '@/lib/message'

// Stripe calls this directly — it carries no session cookie, so this route
// is listed as public in proxy.ts. Authenticity instead comes from the
// webhook signature below, which only Stripe (holding STRIPE_WEBHOOK_SECRET)
// can produce.
export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const rawBody = await req.text()
  const event = verifyWebhookSignature(rawBody, signature)
  if (!event) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = Number(session.metadata?.bookingId)
    const amountPaid = (session.amount_total ?? 0) / 100

    if (bookingId) {
      const booking = await getBooking(bookingId)
      // Idempotency: a webhook can legitimately be delivered more than once
      // for the same event — only act on it the first time.
      if (booking && !booking.paid_at) {
        await markPaidViaStripe(bookingId, amountPaid)

        if (booking.site_number) {
          const paidBooking = { ...booking, deposit_amount: String(amountPaid), paid_at: new Date().toISOString() }
          const result = await sendSms(booking.phone, receiptMessage(paidBooking, booking.site_number))
          if (result.sent) await markReceiptSent(bookingId)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
