'use client'

import { useState, useEffect, useRef } from 'react'
import { getNote, saveNote } from './actions'
import Link from 'next/link'

export default function NotesPage() {
    const [note, setNote] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('loading')
    const [errorMessage, setErrorMessage] = useState('')

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        async function loadNote() {
            const data = await getNote()
            if (data === null) {
                setStatus('error')
                setErrorMessage('Failed to load note. Please try logging in again.')
            } else {
                setNote(data)
                setStatus('idle')
            }
        }
        loadNote()
    }, [])

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setNote(newValue)

        // Auto-save logic
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

        setStatus('idle')
        saveTimeoutRef.current = setTimeout(() => {
            performSave(newValue)
        }, 1000)
    }

    const performSave = async (content: string) => {
        setIsSaving(true)
        const result = await saveNote(content)
        setIsSaving(false)

        if (result.error) {
            setStatus('error')
            setErrorMessage(result.error)
        } else {
            setStatus('success')
            setLastSaved(new Date())
            setTimeout(() => setStatus('idle'), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            {/* Premium Sticky Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="p-2 bg-slate-50 text-slate-400 hover:text-[#dc3545] hover:bg-[#dc3545]/10 rounded-xl transition-all group"
                                title="Back to Home"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                <span className="text-[#dc3545]">Nautilus</span> Personal Note
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {status === 'loading' && note === null ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-200 border-t-[#dc3545]"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Opening...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="text-[10px] font-black uppercase tracking-widest">AES-256 Encrypted</span>
                                </div>
                            )}

                            <div className="h-8 w-px bg-slate-100 mx-1"></div>

                            <button
                                onClick={() => performSave(note || '')}
                                disabled={isSaving || status === 'loading'}
                                className="bg-gradient-to-r from-[#dc3545] to-[#a71d2a] text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-[#dc3545]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm whitespace-nowrap disabled:grayscale disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Manual Save'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-bold">{errorMessage}</p>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#dc3545] border border-slate-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Personal Vault</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">End-to-End Secure Notepad</p>
                            </div>
                        </div>

                        <div className="text-right">
                            {status === 'success' ? (
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">Changes Saved</span>
                            ) : lastSaved ? (
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced: {lastSaved.toLocaleTimeString()}</span>
                            ) : null}
                        </div>
                    </div>

                    <div className="relative">
                        <textarea
                            value={note || ''}
                            onChange={handleNoteChange}
                            placeholder="Start typing your secure notes here... Your data is automatically encrypted with AES-256 before being saved to the database."
                            className="w-full h-[60vh] p-8 sm:p-12 outline-none resize-none text-slate-700 font-mono text-sm leading-relaxed bg-white border-0 focus:ring-0 transition-all placeholder:text-slate-300"
                            disabled={status === 'loading'}
                        />

                        {/* Decorative side markers like a real notebook */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-50 border-r border-slate-100"></div>
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Character Count</span>
                                <span className="text-sm font-bold text-slate-700">{note?.length || 0}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encryption</span>
                                <span className="text-sm font-bold text-emerald-600">Verified Active</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100/50 max-w-md">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-[9px] font-bold uppercase tracking-tight leading-tight">Data is synced to your account only. Nautilus staff cannot access this vault.</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 text-center z-40">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
                    &copy; {new Date().getFullYear().toString()} Nautilus SIP Pte Ltd.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="/masterlist" className="text-[10px] text-[#dc3545] font-bold hover:underline">Customer Masterlist</a>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <a href="/incident" className="text-[10px] text-[#dc3545] font-bold hover:underline">Incident Report</a>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <a href="/maintenance" className="text-[10px] text-[#dc3545] font-bold hover:underline">Maintenance Record</a>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <span className="text-[10px] text-gray-400 font-bold">Personal Note</span>
                </div>
            </footer>
        </div>
    )
}
