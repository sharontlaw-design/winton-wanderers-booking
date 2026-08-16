import { NextResponse } from 'next/server'
import { createBooking } from '@/lib/bookings'

export async function POST(request: Request) {
  const body = await request.json()

  const { guestName, phone, siteId, checkIn, checkOut } = body
  if (!guestName || !phone || !siteId || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const booking = await createBooking({
    guestName,
    phone,
    rego: body.rego ?? '',
    siteId: Number(siteId),
    checkIn,
    checkOut,
    nuances: body.nuances ?? '',
    depositAmount: Number(body.depositAmount) || 0,
  })

  return NextResponse.json({ booking })
}
