import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartWatch — Market intelligence that matters',
  description: 'A calm, explainable view of the market changes that deserve your attention.',
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f7f8fa', userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
