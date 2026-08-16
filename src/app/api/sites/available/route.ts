import { NextRequest, NextResponse } from 'next/server'
import { findAvailableSites } from '@/lib/sites'
import type { SiteSize } from '@/lib/types'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: 'checkIn and checkOut are required' }, { status: 400 })
  }

  const sites = await findAvailableSites({
    checkIn,
    checkOut,
    powered: params.get('powered') === 'true',
    petFriendly: params.get('petFriendly') === 'true',
    waterfront: params.get('waterfront') === 'true',
    accessible: params.get('accessible') === 'true',
    size: (params.get('size') as SiteSize | 'any') || 'any',
    excludeBookingId: params.get('excludeBookingId') ? Number(params.get('excludeBookingId')) : undefined,
  })

  return NextResponse.json({ sites })
}
