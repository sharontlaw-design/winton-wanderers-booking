const PARK_NAME = process.env.PARK_NAME || 'the park'

export default function PayCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Payment not completed</h1>
        <p className="text-slate-600">
          No charge was made. If you&apos;d still like to pay your deposit, just reply to the text from {PARK_NAME}{' '}
          and ask for a fresh payment link.
        </p>
      </div>
    </div>
  )
}
