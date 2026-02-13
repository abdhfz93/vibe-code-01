'use client'

import { useState } from 'react'
import { signup } from './actions'
import Link from 'next/link'

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            setSuccess(true)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-slate-200 p-8 sm:p-10 text-center">
                    {success ? (
                        <div className="py-6">
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-2xl">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Check your email</h1>
                            <p className="text-gray-500 text-sm leading-relaxed mb-10">
                                We've sent a confirmation link to your inbox. <br />
                                Please click the link to verify your account and start using Nautilus Central.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block w-full py-4 rounded-2xl bg-gray-900 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-gray-200 hover:bg-black transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                                    Create <span className="text-[#dc3545]">Account</span>
                                </h1>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                    Join Nautilus Central
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] transition-all"
                                        placeholder="your username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] transition-all"
                                        placeholder="your email"
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
                                        minLength={8}
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
                                    {loading ? 'Creating account...' : 'Sign Up'}
                                </button>
                            </form>

                            <div className="mt-10 text-center text-sm">
                                <span className="text-gray-500">Already have an account?</span>{' '}
                                <Link href="/login" className="text-[#dc3545] hover:underline font-bold transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} Nautilus SIP Pte Ltd.
                </p>
            </div>
        </div>
    )
}
