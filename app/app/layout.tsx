import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ARVI — Environmental Intelligence',
  description: 'An autonomous intelligence layer that transforms environmental signals into actionable systems.',
  openGraph: {
    title: 'ARVI — Environmental Intelligence',
    description: 'Signals become decisions. Autonomous ecosystem monitoring on Base.',
    url: 'https://arvi-eight.vercel.app',
    siteName: 'ARVI',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
