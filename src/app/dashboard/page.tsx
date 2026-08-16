import Link from 'next/link'
import { listSites } from '@/lib/sites'
import { listActiveToday } from '@/lib/bookings'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [sites, activeBookings] = await Promise.all([listSites(), listActiveToday()])
  const bySite = new Map(activeBookings.map((b) => [b.site_id, b]))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Site map — today</h1>
      <p className="text-sm text-slate-500 mb-6">
        Click an empty site to start a booking, or an occupied site to see its details.
      </p>

      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-white border border-slate-300 inline-block" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-orange-300 inline-block" /> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-300 inline-block" /> Checked in
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {sites.map((site) => {
          const booking = bySite.get(site.id)
          const color = !booking
            ? 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
            : booking.status === 'checked_in'
              ? 'bg-yellow-300 hover:bg-yellow-400 text-yellow-950'
              : 'bg-orange-300 hover:bg-orange-400 text-orange-950'

          const href = booking ? `/bookings/${booking.id}` : `/bookings/new?site=${site.number}`

          return (
            <Link
              key={site.id}
              href={href}
              className={`aspect-square rounded-md flex items-center justify-center font-medium text-sm transition-colors ${color}`}
              title={booking ? `${booking.guest_name} — ${booking.check_in} to ${booking.check_out}` : `Site ${site.number} — available`}
            >
              {site.number}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
