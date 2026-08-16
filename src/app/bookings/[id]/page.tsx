import { notFound } from 'next/navigation'
import { getBooking } from '@/lib/bookings'
import { confirmationMessage, receiptMessage } from '@/lib/message'
import BookingDetailClient from './BookingDetailClient'

export const dynamic = 'force-dynamic'

export default async function BookingDetailPage({ params }: PageProps<'/bookings/[id]'>) {
  const { id } = await params
  const booking = await getBooking(Number(id))
  if (!booking) notFound()

  const siteNumber = booking.site_number ?? '—'
  const message = confirmationMessage(booking, siteNumber)
  const receipt = receiptMessage(booking, siteNumber)

  return <BookingDetailClient booking={booking} message={message} receipt={receipt} />
}
