import { NextResponse } from 'next/server'
import { SESSION_COOKIE, checkPassword, sessionTokenFor } from '@/lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (typeof password !== 'string' || !(await checkPassword(password))) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const token = await sessionTokenFor(password)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 days — this is a low-stakes single-user tool
  })
  return res
}
