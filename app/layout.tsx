import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nautilus Central',
  description: 'Internal management systems',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        href: '/favicon.png',
      }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
