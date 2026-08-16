// Sends via Twilio if credentials are configured; otherwise returns the
// message as a "draft" so the UI can offer a copy-to-clipboard fallback.
// This means the app is fully usable before Twilio is ever set up.

export type SendResult =
  | { sent: true }
  | { sent: false; reason: 'not_configured' | 'send_failed'; error?: string }

export async function sendSms(to: string, body: string): Promise<SendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER

  if (!sid || !token || !from) {
    return { sent: false, reason: 'not_configured' }
  }

  const params = new URLSearchParams({ To: to, From: from, Body: body })
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!res.ok) {
    const error = await res.text()
    return { sent: false, reason: 'send_failed', error }
  }

  return { sent: true }
}
