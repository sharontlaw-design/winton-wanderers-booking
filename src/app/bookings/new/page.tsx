'use client'

import { Suspense, useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Site, SiteSize } from '@/lib/types'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function NewBookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectSite = searchParams.get('site')

  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [rego, setRego] = useState('')
  const [checkIn, setCheckIn] = useState(todayIso())
  const [checkOut, setCheckOut] = useState(todayIso())
  const [nuances, setNuances] = useState('')
  const [depositAmount, setDepositAmount] = useState('')

  const [powered, setPowered] = useState(false)
  const [petFriendly, setPetFriendly] = useState(false)
  const [waterfront, setWaterfront] = useState(false)
  const [accessible, setAccessible] = useState(false)
  const [size, setSize] = useState<SiteSize | 'any'>('any')

  const [availableSites, setAvailableSites] = useState<Site[]>([])
  const [manualSiteId, setManualSiteId] = useState<number | null>(null)
  const [loadingSites, startLoadingSites] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Defaults to the site clicked from the dashboard (if it's in the
  // available list); a manual click overrides that default.
  const selectedSiteId = manualSiteId ?? availableSites.find((s) => s.number === preselectSite)?.id ?? null

  useEffect(() => {
    if (checkOut <= checkIn) return
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      powered: String(powered),
      petFriendly: String(petFriendly),
      waterfront: String(waterfront),
      accessible: String(accessible),
      size,
    })
    startLoadingSites(async () => {
      const res = await fetch(`/api/sites/available?${params}`)
      const data = await res.json()
      setAvailableSites(data.sites ?? [])
    })
  }, [checkIn, checkOut, powered, petFriendly, waterfront, accessible, size])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSiteId) {
      setError('Pick a site first')
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName,
        phone,
        rego,
        siteId: selectedSiteId,
        checkIn,
        checkOut,
        nuances,
        depositAmount,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      setError('Could not save booking')
      return
    }
    const { booking } = await res.json()
    router.push(`/bookings/${booking.id}`)
  }

  const dateRangeValid = checkOut > checkIn

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">New booking</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Guest name">
            <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone number">
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="04xx xxx xxx" />
          </Field>
          <Field label="Vehicle rego">
            <input value={rego} onChange={(e) => setRego(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Deposit paid ($)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Check in">
            <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Check out">
            <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <Field label="Notes / nuances">
          <textarea
            value={nuances}
            onChange={(e) => setNuances(e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="e.g. wants shade, big van, celebrating anniversary..."
          />
        </Field>

        {!dateRangeValid && <p className="text-sm text-red-600">Check-out must be after check-in.</p>}

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Site requirements</p>
          <div className="flex flex-wrap gap-4 items-center">
            <Checkbox label="Powered" checked={powered} onChange={setPowered} />
            <Checkbox label="Pet friendly" checked={petFriendly} onChange={setPetFriendly} />
            <Checkbox label="Waterfront" checked={waterfront} onChange={setWaterfront} />
            <Checkbox label="Accessible" checked={accessible} onChange={setAccessible} />
            <select value={size} onChange={(e) => setSize(e.target.value as SiteSize | 'any')} className={inputClass + ' w-auto'}>
              <option value="any">Any size</option>
              <option value="small">Small</option>
              <option value="standard">Standard</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Available sites {loadingSites && <span className="text-slate-400 font-normal">loading...</span>}
          </p>
          {dateRangeValid && !loadingSites && availableSites.length === 0 && (
            <p className="text-sm text-slate-500">No sites match those dates and requirements.</p>
          )}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {availableSites.map((site) => (
              <button
                type="button"
                key={site.id}
                onClick={() => setManualSiteId(site.id)}
                className={`aspect-square rounded-md text-sm font-medium border transition-colors ${
                  selectedSiteId === site.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                {site.number}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !selectedSiteId}
          className="bg-slate-900 text-white font-medium px-5 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save booking'}
        </button>
      </form>
    </div>
  )
}

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense>
      <NewBookingForm />
    </Suspense>
  )
}
