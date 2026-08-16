export type SiteSize = 'small' | 'standard' | 'large'

export type Site = {
  id: number
  number: string
  powered: boolean
  pet_friendly: boolean
  waterfront: boolean
  accessible: boolean
  size: SiteSize
  notes: string
}

export type BookingStatus = 'booked' | 'checked_in' | 'checked_out' | 'cancelled'

export type Booking = {
  id: number
  guest_name: string
  phone: string
  rego: string
  site_id: number | null
  check_in: string // ISO date (YYYY-MM-DD)
  check_out: string
  nuances: string
  deposit_amount: string // numeric comes back as string from Postgres
  status: BookingStatus
  message_sent_at: string | null
  receipt_sent_at: string | null
  created_at: string
}

export type BookingWithSite = Booking & {
  site_number: string | null
}
