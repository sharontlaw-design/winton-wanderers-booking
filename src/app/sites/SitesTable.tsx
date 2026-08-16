'use client'

import { useState } from 'react'
import type { Site, SiteSize } from '@/lib/types'

export default function SitesTable({ initialSites }: { initialSites: Site[] }) {
  const [sites, setSites] = useState(initialSites)

  function update(id: number, fields: Partial<Site>) {
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, ...fields } : s)))
    fetch(`/api/sites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Site</th>
            <th className="px-3 py-2 font-medium">Powered</th>
            <th className="px-3 py-2 font-medium">Pet friendly</th>
            <th className="px-3 py-2 font-medium">Waterfront</th>
            <th className="px-3 py-2 font-medium">Accessible</th>
            <th className="px-3 py-2 font-medium">Size</th>
            <th className="px-3 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id} className="border-t border-slate-100">
              <td className="px-3 py-2 font-medium text-slate-900">{site.number}</td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={site.powered}
                  onChange={(e) => update(site.id, { powered: e.target.checked })}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={site.pet_friendly}
                  onChange={(e) => update(site.id, { pet_friendly: e.target.checked })}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={site.waterfront}
                  onChange={(e) => update(site.id, { waterfront: e.target.checked })}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={site.accessible}
                  onChange={(e) => update(site.id, { accessible: e.target.checked })}
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={site.size}
                  onChange={(e) => update(site.id, { size: e.target.value as SiteSize })}
                  className="border border-slate-300 rounded px-1 py-0.5"
                >
                  <option value="small">Small</option>
                  <option value="standard">Standard</option>
                  <option value="large">Large</option>
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  defaultValue={site.notes}
                  onBlur={(e) => update(site.id, { notes: e.target.value })}
                  className="border border-slate-300 rounded px-2 py-0.5 w-40"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
