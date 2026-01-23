import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200 border border-gray-100 max-w-2xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
          <span className="text-[#dc3545]">Nautilus</span> Central
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">
          Internal Management Systems
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/masterlist"
            className="group p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#dc3545] transition-all hover:shadow-lg hover:shadow-[#dc3545]/5 text-left"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#dc3545]/10 group-hover:text-[#dc3545] text-slate-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-2">Customer Masterlist</h2>
            <p className="text-sm text-gray-500 mt-1">Manage the centralized customer and server directory.</p>
          </Link>

          <Link
            href="/incident"
            className="group p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#dc3545] transition-all hover:shadow-lg hover:shadow-[#dc3545]/5 text-left"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#dc3545]/10 group-hover:text-[#dc3545] text-slate-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-2">Incident Report</h2>
            <p className="text-sm text-gray-500 mt-1">Generate technical reports from conversation logs.</p>
          </Link>

          <Link
            href="/maintenance"
            className="group p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#dc3545] transition-all hover:shadow-lg hover:shadow-[#dc3545]/5 text-left"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#dc3545]/10 group-hover:text-[#dc3545] text-slate-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-2">Maintenance Record</h2>
            <p className="text-sm text-gray-500 mt-1">Submit and track Nautilus server maintenance records.</p>
          </Link>
        </div>

        <footer className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Nautilus SIP Pte Ltd.
        </footer>
      </div>
    </main>
  )
}
