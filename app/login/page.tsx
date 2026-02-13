'use client'

import { useState } from 'react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-slate-200 p-8 sm:p-10">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                            <span className="text-[#dc3545]">Nautilus</span> Central
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                            Internal Management Systems
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                                Username or Email
                            </label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] transition-all"
                                placeholder="your username or email"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] transition-all"
                                placeholder="your password"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-[#dc3545] text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm">
                        <span className="text-gray-500">Don't have an account?</span>{' '}
                        <Link href="/signup" className="text-[#dc3545] hover:underline font-bold transition-colors">
                            Sign up
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} Nautilus SIP Pte Ltd.
                </p>
            </div>
        </div>
    )
}
