import { NextResponse } from 'next/server'
import { getBooking, updateBookingStatus, updateDepositAmount } from '@/lib/bookings'
import type { BookingStatus } from '@/lib/types'

const VALID_STATUSES: BookingStatus[] = ['booked', 'checked_in', 'checked_out', 'cancelled']

export async function GET(_req: Request, ctx: RouteContext<'/api/bookings/[id]'>) {
  const { id } = await ctx.params
  const booking = await getBooking(Number(id))
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ booking })
}

export async function PATCH(req: Request, ctx: RouteContext<'/api/bookings/[id]'>) {
  const { id } = await ctx.params
  const bookingId = Number(id)
  const body = await req.json()

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    await updateBookingStatus(bookingId, body.status)
  }

  if (body.depositAmount !== undefined) {
    await updateDepositAmount(bookingId, Number(body.depositAmount))
  }

  const booking = await getBooking(bookingId)
  return NextResponse.json({ booking })
}
