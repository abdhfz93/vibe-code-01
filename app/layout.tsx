import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maintenance Records',
  description: 'Internal maintenance record management system',
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
