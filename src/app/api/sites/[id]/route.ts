import { NextResponse } from 'next/server'
import { updateSite } from '@/lib/sites'

export async function PATCH(req: Request, ctx: RouteContext<'/api/sites/[id]'>) {
  const { id } = await ctx.params
  const body = await req.json()
  await updateSite(Number(id), body)
  return NextResponse.json({ ok: true })
}
