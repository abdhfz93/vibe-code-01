import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nautilus Maintenance Record System
        </h1>
        <Link
          href="/maintenance"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Nautilus Maintenance Record
        </Link>
      </div>
    </main>
  )
}
