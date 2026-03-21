import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ARVI — Agentic Regeneration Via Intelligence',
  description: 'Autonomous environmental intelligence network for urban forests',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
