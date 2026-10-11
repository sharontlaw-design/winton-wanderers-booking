import { notFound } from 'next/navigation'
import { getBooking } from '@/lib/bookings'
import { confirmationMessage, receiptMessage } from '@/lib/message'
import { stripeConfigured } from '@/lib/stripe'
import BookingDetailClient from './BookingDetailClient'

export const dynamic = 'force-dynamic'

export default async function BookingDetailPage({ params }: PageProps<'/bookings/[id]'>) {
  const { id } = await params
  const booking = await getBooking(Number(id))
  if (!booking) notFound()

  const siteNumber = booking.site_number ?? '—'
  // Shows the last link we generated, if any — the real send always mints a
  // fresh one (Stripe links expire after 24h), so this is a preview, not
  // necessarily what goes out next time.
  const message = confirmationMessage(booking, siteNumber, booking.stripe_checkout_url)
  const receipt = receiptMessage(booking, siteNumber)
  const paymentPending = !booking.paid_at && stripeConfigured()

  return <BookingDetailClient booking={booking} message={message} receipt={receipt} paymentPending={paymentPending} />
}
