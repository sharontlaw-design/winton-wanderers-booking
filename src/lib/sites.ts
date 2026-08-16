import { sql } from './db'
import type { Site, SiteSize } from './types'

export async function listSites(): Promise<Site[]> {
  const rows = await sql`SELECT * FROM sites ORDER BY number::int`
  return rows as Site[]
}

export async function getSite(id: number): Promise<Site | null> {
  const rows = await sql`SELECT * FROM sites WHERE id = ${id}`
  return (rows[0] as Site) ?? null
}

export async function updateSite(
  id: number,
  fields: Partial<Pick<Site, 'powered' | 'pet_friendly' | 'waterfront' | 'accessible' | 'size' | 'notes'>>
): Promise<void> {
  await sql`
    UPDATE sites SET
      powered = COALESCE(${fields.powered ?? null}, powered),
      pet_friendly = COALESCE(${fields.pet_friendly ?? null}, pet_friendly),
      waterfront = COALESCE(${fields.waterfront ?? null}, waterfront),
      accessible = COALESCE(${fields.accessible ?? null}, accessible),
      size = COALESCE(${fields.size ?? null}, size),
      notes = COALESCE(${fields.notes ?? null}, notes)
    WHERE id = ${id}
  `
}

export type SiteRequirements = {
  checkIn: string
  checkOut: string
  powered?: boolean
  petFriendly?: boolean
  waterfront?: boolean
  accessible?: boolean
  size?: SiteSize | 'any'
  excludeBookingId?: number
}

// Sites that are free for the whole [checkIn, checkOut) range and match the
// requested attributes. Only attributes explicitly requested as true (or a
// specific size) are filtered on — anything else is left open.
export async function findAvailableSites(req: SiteRequirements): Promise<Site[]> {
  const rows = await sql`
    SELECT s.* FROM sites s
    WHERE (${req.powered ?? false} = false OR s.powered = true)
      AND (${req.petFriendly ?? false} = false OR s.pet_friendly = true)
      AND (${req.waterfront ?? false} = false OR s.waterfront = true)
      AND (${req.accessible ?? false} = false OR s.accessible = true)
      AND (${req.size ?? 'any'} = 'any' OR s.size = ${req.size ?? 'any'})
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.site_id = s.id
          AND b.status <> 'cancelled'
          AND b.id <> ${req.excludeBookingId ?? -1}
          AND b.check_in < ${req.checkOut}
          AND b.check_out > ${req.checkIn}
      )
    ORDER BY s.number::int
  `
  return rows as Site[]
}
