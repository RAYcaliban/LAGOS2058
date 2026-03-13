import type { Metadata } from 'next'
import { AeroNav } from '@/components/layout/AeroNav'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'LAGOS 2058',
  description: 'A 12-turn political campaign simulation set in a near-future Nigeria',
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
      </body>
    </html>
  )
}
