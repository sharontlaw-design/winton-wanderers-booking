import { NextResponse } from 'next/server'
import { getBooking, markMessageSent, setStripeSession } from '@/lib/bookings'
import { sendSms } from '@/lib/sms'
import { confirmationMessage } from '@/lib/message'
import { createCheckoutSession, stripeConfigured } from '@/lib/stripe'

export async function POST(req: Request, ctx: RouteContext<'/api/bookings/[id]/message'>) {
  const { id } = await ctx.params
  const booking = await getBooking(Number(id))
  if (!booking || !booking.site_number) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let paymentUrl: string | null = null
  if (!booking.paid_at && stripeConfigured()) {
    try {
      const baseUrl = process.env.APP_BASE_URL || new URL(req.url).origin
      const session = await createCheckoutSession(booking, booking.site_number, baseUrl)
      if (session) {
        await setStripeSession(booking.id, session.sessionId, session.url)
        paymentUrl = session.url
      }
    } catch (error) {
      // A Stripe problem (bad key, outage) shouldn't block the message
      // itself — it just goes out without a payment link this time.
      console.error('Stripe checkout session creation failed:', error)
    }
  }

  const body = confirmationMessage(booking, booking.site_number, paymentUrl)
  const result = await sendSms(booking.phone, body)

  if (result.sent) {
    await markMessageSent(booking.id)
  }

  return NextResponse.json({ ...result, draftText: body })
}
