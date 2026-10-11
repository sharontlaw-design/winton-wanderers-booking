import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import AppNav from '@/components/AppNav'
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
        <AppNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
