import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Winton Wanderers Booking',
  description: 'Booking and site management',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
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
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
