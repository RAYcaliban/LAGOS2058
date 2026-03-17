import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { AeroNav } from '@/components/layout/AeroNav'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'LAGOS 2058',
  description: 'A 12-turn political campaign simulation set in a near-future Nigeria',
  openGraph: {
    title: 'LAGOS 2058',
    description: 'A 12-turn political campaign simulation set in a near-future Nigeria',
    images: [{ url: '/og-image.jpeg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAGOS 2058',
    description: 'A 12-turn political campaign simulation set in a near-future Nigeria',
    images: ['/og-image.jpeg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AeroNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <div className="scanlines" />
        <Analytics />
      </body>
    </html>
  )
}
