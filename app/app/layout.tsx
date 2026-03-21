import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Mono, Inter } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
})

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'ARVI — Agentic Regeneration Via Intelligence',
  description: 'Autonomous agents that sense, analyze, and act on planetary ecosystems. No human bottlenecks. No delays. Just intelligence acting on the data our planet generates.',
  openGraph: {
    title: 'ARVI — Agentic Regeneration Via Intelligence',
    description: 'The first autonomous multi-ecosystem intelligence network. Urban forests, aquatic systems, coral reefs, soil microbiomes — one agent network.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable} ${inter.variable}`}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      </head>
      <body className="bg-void text-parchment antialiased">
        {children}
      </body>
    </html>
  )
}
