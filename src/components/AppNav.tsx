'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

// Hidden on /login (its own full-screen layout) and /pay/* (guest-facing
// payment pages — a guest should never see Jesse's internal nav or sign-out).
const HIDE_ON_PREFIXES = ['/login', '/pay']

export default function AppNav() {
  const pathname = usePathname()
  if (HIDE_ON_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null

  return (
    <nav className="bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <span className="font-semibold">Winton Wanderers</span>
        <Link href="/dashboard" className="text-sm hover:text-white text-slate-300">
          Site map
        </Link>
        <Link href="/bookings" className="text-sm hover:text-white text-slate-300">
          Bookings
        </Link>
        <Link href="/bookings/new" className="text-sm hover:text-white text-slate-300">
          New booking
        </Link>
        <Link href="/sites" className="text-sm hover:text-white text-slate-300">
          Sites
        </Link>
        <span className="flex-1" />
        <LogoutButton />
      </div>
    </nav>
  )
}
