import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ARVI — Agentic Regeneration Via Intelligence',
  description: 'Autonomous urban forest intelligence network. AI-powered environmental monitoring, real-time threat detection, and autonomous operator payments.',
  keywords: ['ARVI', 'urban forest', 'environmental monitoring', 'AI agent', 'blockchain', 'Base', 'autonomous', 'DePIN'],
  openGraph: {
    title: 'ARVI — Autonomous Urban Forest Intelligence',
    description: 'AI agent that monitors urban forests, detects threats in real time, and triggers autonomous responses with onchain payments.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Leaflet CSS — required for map rendering */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="bg-[#060a07] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
