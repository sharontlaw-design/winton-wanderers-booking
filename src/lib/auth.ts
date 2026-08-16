// A single shared password gates the whole app (this is a one-person tool,
// not a multi-user system). The cookie never stores the password itself —
// just an HMAC signature keyed on it, so changing APP_PASSWORD automatically
// invalidates any existing sessions.

export const SESSION_COOKIE = 'wwb_session'

const encoder = new TextEncoder()

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sign(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode('authenticated'))
  return bufToHex(sig)
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = process.env.APP_PASSWORD
  if (!expected) throw new Error('APP_PASSWORD is not set. Add it to your .env.local file.')
  return candidate === expected
}

export async function sessionTokenFor(password: string): Promise<string> {
  return sign(password)
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  const password = process.env.APP_PASSWORD
  if (!password || !token) return false
  const expected = await sign(password)
  return token === expected
}
