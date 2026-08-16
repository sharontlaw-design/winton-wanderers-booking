import Link from 'next/link'
import { listBookings } from '@/lib/bookings'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  booked: 'Booked',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
}

const STATUS_COLOR: Record<string, string> = {
  booked: 'bg-orange-100 text-orange-800',
  checked_in: 'bg-yellow-100 text-yellow-800',
  checked_out: 'bg-slate-100 text-slate-600',
}

export default async function BookingsPage() {
  const bookings = await listBookings()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-slate-900">All bookings</h1>
        <Link href="/bookings/new" className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-800">
          New booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-slate-500">No bookings yet.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Guest</th>
                <th className="px-4 py-2 font-medium">Site</th>
                <th className="px-4 py-2 font-medium">Check in</th>
                <th className="px-4 py-2 font-medium">Check out</th>
                <th className="px-4 py-2 font-medium">Deposit</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link href={`/bookings/${b.id}`} className="text-slate-900 font-medium hover:underline">
                      {b.guest_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{b.site_number ?? '—'}</td>
                  <td className="px-4 py-2">{b.check_in}</td>
                  <td className="px-4 py-2">{b.check_out}</td>
                  <td className="px-4 py-2">${Number(b.deposit_amount).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
