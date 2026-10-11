'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingWithSite, BookingStatus } from '@/lib/types'

const STATUS_LABEL: Record<BookingStatus, string> = {
  booked: 'Booked',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
  cancelled: 'Cancelled',
}

export default function BookingDetailClient({
  booking,
  message,
  receipt,
  paymentPending,
}: {
  booking: BookingWithSite
  message: string
  receipt: string
  paymentPending: boolean
}) {
  const router = useRouter()
  const [depositAmount, setDepositAmount] = useState(booking.deposit_amount)
  const [savingDeposit, setSavingDeposit] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    router.refresh()
  }

  async function saveDeposit() {
    setSavingDeposit(true)
    await patch({ depositAmount })
    setSavingDeposit(false)
  }

  async function setStatus(status: BookingStatus) {
    if (status === 'cancelled' && !confirm('Cancel this booking? This frees up the site.')) return
    setChangingStatus(true)
    await patch({ status })
    setChangingStatus(false)
  }

  if (booking.status === 'cancelled') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-slate-500">This booking was cancelled.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">{booking.guest_name}</h1>
          <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-700">
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Site {booking.site_number} · {booking.check_in} to {booking.check_out}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm bg-white border border-slate-200 rounded-lg p-4">
        <div>
          <span className="text-slate-500">Phone</span>
          <p className="font-medium text-slate-900">{booking.phone}</p>
        </div>
        <div>
          <span className="text-slate-500">Rego</span>
          <p className="font-medium text-slate-900">{booking.rego || '—'}</p>
        </div>
        {booking.nuances && (
          <div className="col-span-2">
            <span className="text-slate-500">Notes</span>
            <p className="font-medium text-slate-900">{booking.nuances}</p>
          </div>
        )}
        <div>
          <span className="text-slate-500">Deposit paid ($)</span>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              min="0"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-28 border border-slate-300 rounded-md px-2 py-1"
            />
            <button
              onClick={saveDeposit}
              disabled={savingDeposit}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              {savingDeposit ? 'Saving...' : 'Save'}
            </button>
          </div>
          {booking.paid_at && (
            <p className="text-xs text-emerald-700 mt-1">Paid online {new Date(booking.paid_at).toLocaleString()}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {booking.status === 'booked' && (
          <ActionButton onClick={() => setStatus('checked_in')} disabled={changingStatus}>
            Mark checked in
          </ActionButton>
        )}
        {booking.status === 'checked_in' && (
          <ActionButton onClick={() => setStatus('checked_out')} disabled={changingStatus}>
            Mark checked out
          </ActionButton>
        )}
        <ActionButton onClick={() => setStatus('cancelled')} disabled={changingStatus} variant="danger">
          Cancel booking
        </ActionButton>
      </div>

      <SendPanel
        title="Confirmation message"
        text={message}
        endpoint={`/api/bookings/${booking.id}/message`}
        alreadySentAt={booking.message_sent_at}
        phone={booking.phone}
        caption={paymentPending ? 'A fresh payment link is created each time this is sent, so it never goes out expired.' : undefined}
      />

      <SendPanel
        title="Receipt"
        text={receipt}
        endpoint={`/api/bookings/${booking.id}/receipt`}
        alreadySentAt={booking.receipt_sent_at}
        phone={booking.phone}
      />
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50 ${
        variant === 'danger'
          ? 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
          : 'bg-slate-900 text-white hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  )
}

function SendPanel({
  title,
  text,
  endpoint,
  alreadySentAt,
  phone,
  caption,
}: {
  title: string
  text: string
  endpoint: string
  alreadySentAt: string | null
  phone: string
  caption?: string
}) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function send() {
    setSending(true)
    setStatus(null)
    const res = await fetch(endpoint, { method: 'POST' })
    const data = await res.json()
    setSending(false)

    if (data.sent) {
      setStatus('Sent.')
      router.refresh()
    } else if (data.reason === 'not_configured') {
      await navigator.clipboard.writeText(data.draftText)
      setStatus(`Texting isn't set up yet — copied to clipboard. Paste it into a text to ${phone}.`)
    } else {
      setStatus('Could not send — check the Twilio setup in README.')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {alreadySentAt && <span className="text-xs text-slate-400">Sent {new Date(alreadySentAt).toLocaleString()}</span>}
      </div>
      <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-md p-3 mb-3 font-sans">{text}</pre>
      {caption && <p className="text-xs text-slate-400 mb-3">{caption}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={send}
          disabled={sending}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
        {status && <span className="text-sm text-slate-600">{status}</span>}
      </div>
    </div>
  )
}
