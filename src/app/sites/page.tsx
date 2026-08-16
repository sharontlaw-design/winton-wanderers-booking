import { listSites } from '@/lib/sites'
import SitesTable from './SitesTable'

export const dynamic = 'force-dynamic'

export default async function SitesPage() {
  const sites = await listSites()
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Sites</h1>
      <p className="text-sm text-slate-500 mb-6">
        Set each site&apos;s real attributes here once — changes save automatically. This is what the new-booking
        matching uses to suggest sites.
      </p>
      <SitesTable initialSites={sites} />
    </div>
  )
}
