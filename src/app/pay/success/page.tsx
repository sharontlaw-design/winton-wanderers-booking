const PARK_NAME = process.env.PARK_NAME || 'the park'

export default function PaySuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Payment received</h1>
        <p className="text-slate-600">
          Thanks — your deposit is confirmed. {PARK_NAME} has been notified and will be in touch if there&apos;s
          anything else needed before your stay.
        </p>
      </div>
    </div>
  )
}
