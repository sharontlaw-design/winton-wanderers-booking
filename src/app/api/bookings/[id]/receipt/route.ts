import { NextResponse } from 'next/server'
import { getBooking, markReceiptSent } from '@/lib/bookings'
import { sendSms } from '@/lib/sms'
import { receiptMessage } from '@/lib/message'

export async function POST(_req: Request, ctx: RouteContext<'/api/bookings/[id]/receipt'>) {
  const { id } = await ctx.params
  const booking = await getBooking(Number(id))
  if (!booking || !booking.site_number) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = receiptMessage(booking, booking.site_number)
  const result = await sendSms(booking.phone, body)

  if (result.sent) {
    await markReceiptSent(booking.id)
  }

  return NextResponse.json({ ...result, draftText: body })
}
