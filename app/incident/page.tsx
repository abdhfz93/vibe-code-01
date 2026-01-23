'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { IncidentReport } from '@/types/incident'

export default function IncidentPage() {
    const [context, setContext] = useState('')
    const [report, setReport] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Form fields
    const [sipId, setSipId] = useState('')
    const [clientName, setClientName] = useState('')
    const [incidentDate, setIncidentDate] = useState('')

    const [pastIncidents, setPastIncidents] = useState<IncidentReport[]>([])
    const [fetchingHistory, setFetchingHistory] = useState(true)

    const reportRef = useRef<HTMLDivElement>(null)

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingIncident, setEditingIncident] = useState<IncidentReport | null>(null)
    const [editForm, setEditForm] = useState({
        title: '',
        sip_id: '',
        client_name: '',
        incident_date: ''
    })
    const [isUpdating, setIsUpdating] = useState(false)

    // Handle ESC key to clear or close modal (if any)
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsEditModalOpen(false)
                setEditingIncident(null)
            }
        }
        window.addEventListener('keydown', handleEsc)
        fetchHistory()
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    const fetchHistory = async () => {
        setFetchingHistory(true)
        try {
            const { data, error } = await supabase
                .from('incident_reports')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setPastIncidents(data)
            if (error) console.error('Error fetching history:', error)
        } catch (error) {
            console.error('History Fetch Error:', error)
        } finally {
            setFetchingHistory(false)
        }
    }

    const generateReport = async () => {
        if (!context.trim()) return

        if (context.trim().length < 20) {
            alert('The conversation context seems too short. Please provide more details for a better report.')
            return
        }

        setLoading(true)
        setReport('')
        try {
            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context,
                    sip_id: sipId,
                    client_name: clientName,
                    incident_date: incidentDate
                }),
            })
            const data = await response.json()

            if (data.error) {
                alert(data.error)
                setLoading(false)
                return
            }

            if (data.report) {
                if (data.dbError) {
                    let errorMsg = `Report generated but failed to save to database: ${data.dbError}`;
                    if (data.dbDetail) errorMsg += `\nDetail: ${data.dbDetail}`;
                    if (data.dbHint) errorMsg += `\nHint: ${data.dbHint}`;
                    alert(errorMsg + `\n\nPlease check your Supabase table schema.`);
                }
                setReport(data.report)
                setShowForm(false) // Close form on success
                fetchHistory() // Refresh the past incidents list
                setTimeout(() => {
                    reportRef.current?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            } else {
                alert(data.error || 'Failed to generate report')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred while generating the report')
        } finally {
            setLoading(false)
        }
    }

    const formatIncidentTitle = (sip: string, client: string, dateStr: string) => {
        let formattedDate = dateStr
        try {
            const d = new Date(dateStr)
            if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0')
                const month = d.toLocaleString('en-GB', { month: 'short' })
                const year = d.getFullYear()
                formattedDate = `${day} ${month} ${year}`
            }
        } catch (e) { }

        return `Incident Report for ${client || 'N/A'} (${sip || 'N/A'}) - ${formattedDate || 'N/A'}`
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(report)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const viewPastReport = (inc: IncidentReport) => {
        setReport(inc.content)
        setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleDeleteIncident = async (id: number) => {
        if (!confirm('Are you sure you want to delete this incident report?')) return

        try {
            const { error } = await supabase
                .from('incident_reports')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchHistory()
        } catch (error) {
            console.error('Delete Error:', error)
            alert('Failed to delete incident report')
        }
    }

    const openEditModal = (inc: IncidentReport) => {
        setEditingIncident(inc)
        setEditForm({
            title: inc.title || '',
            sip_id: inc.sip_id || '',
            client_name: inc.client_name || '',
            incident_date: inc.incident_date || ''
        })
        setIsEditModalOpen(true)
    }

    // Effect to keep title in sync during editing
    useEffect(() => {
        if (isEditModalOpen) {
            const newTitle = formatIncidentTitle(editForm.sip_id, editForm.client_name, editForm.incident_date)
            setEditForm(prev => ({ ...prev, title: newTitle }))
        }
    }, [editForm.sip_id, editForm.client_name, editForm.incident_date, isEditModalOpen])

    const handleUpdateIncident = async () => {
        if (!editingIncident) return
        setIsUpdating(true)

        try {
            const { error } = await supabase
                .from('incident_reports')
                .update({
                    title: editForm.title,
                    sip_id: editForm.sip_id,
                    client_name: editForm.client_name,
                    incident_date: editForm.incident_date,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingIncident.id)

            if (error) throw error

            setIsEditModalOpen(false)
            setEditingIncident(null)
            fetchHistory()
        } catch (error) {
            console.error('Update Error:', error)
            alert('Failed to update incident report')
        } finally {
            setIsUpdating(false)
        }
    }

    const filteredIncidents = pastIncidents.filter(inc => {
        const searchStr = searchTerm.toLowerCase().trim()
        if (!searchStr) return true

        const displayTitle = formatIncidentTitle(inc.sip_id, inc.client_name, inc.incident_date).toLowerCase()

        return (
            displayTitle.includes(searchStr) ||
            (inc.sip_id && inc.sip_id.toLowerCase().includes(searchStr)) ||
            (inc.client_name && inc.client_name.toLowerCase().includes(searchStr)) ||
            (inc.incident_number && inc.incident_number.toLowerCase().includes(searchStr))
        )
    })

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
                                <span className="text-[#dc3545]">Nautilus</span> Incident Report
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group flex-1 min-w-[300px]">
                                <input
                                    type="text"
                                    placeholder="Past Incidents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5 transition-colors group-focus-within:text-[#dc3545]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-gradient-to-r from-[#dc3545] to-[#a71d2a] text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-[#dc3545]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm whitespace-nowrap disabled:grayscale disabled:opacity-50"
                            >
                                {showForm ? 'Close Generator' : '+ Generate New Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
                {/* Generation Section */}
                {showForm && (
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Server ID</label>
                                    <input
                                        type="text"
                                        value={sipId}
                                        onChange={(e) => setSipId(e.target.value)}
                                        placeholder="e.g. sip11"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] outline-none transition-all text-sm font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Client Name</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="e.g. Certis"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] outline-none transition-all text-sm font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Incident</label>
                                    <input
                                        type={incidentDate ? "date" : "text"}
                                        value={incidentDate}
                                        onChange={(e) => setIncidentDate(e.target.value)}
                                        onFocus={(e) => (e.target.type = "date")}
                                        onBlur={(e) => !incidentDate && (e.target.type = "text")}
                                        placeholder="dd------yy"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] outline-none transition-all text-sm font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Source Context</label>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100/50">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Please be aware: Do not paste sensitive data like API keys, etc. into this box.</span>
                                    </div>
                                </div>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="Paste WhatsApp conversation here..."
                                    className="w-full h-48 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#dc3545] outline-none transition-all text-sm font-mono leading-relaxed resize-none"
                                />
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={generateReport}
                                    disabled={loading || !context.trim()}
                                    className={`px-10 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all transform active:scale-95 shadow-lg flex items-center gap-3 ${loading || !context.trim()
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#dc3545] to-[#a71d2a] hover:scale-[1.02] shadow-[#dc3545]/20'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                            Analyzing & Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Generate & Save Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {report && (
                    <div
                        ref={reportRef}
                        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 scroll-mt-24"
                    >
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">GENERATED REPORT</h2>
                                <button
                                    onClick={() => setReport('')}
                                    className="p-2 text-slate-400 hover:text-[#dc3545] hover:bg-[#dc3545]/10 rounded-xl transition-all group flex items-center gap-2"
                                    title="Close Report"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Close</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-inner font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                {report}
                            </div>
                            <div className="mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider text-center">
                                    Note: This report is AI-generated. Please review and make judgment on your own.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Past Incidents List */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Past Incidents</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        INC #
                                    </th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Incident Title
                                    </th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {fetchingHistory ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-[#dc3545]"></div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading history...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredIncidents.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No past incidents found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIncidents.map((inc) => (
                                        <tr key={inc.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {inc.incident_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-0.5 max-w-[400px]">
                                                    <span className="text-sm font-bold text-slate-700 truncate">
                                                        {formatIncidentTitle(inc.sip_id, inc.client_name, inc.incident_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => viewPastReport(inc)}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="View Report"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(inc)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteIncident(inc.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Incident"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 text-center z-40">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
                    &copy; {new Date().getFullYear().toString()} Nautilus SIP Pte Ltd.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="/maintenance" className="text-[10px] text-[#dc3545] font-bold hover:underline">Maintenance Record</a>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <span className="text-[10px] text-gray-400 font-bold">Incident Report</span>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <a href="/masterlist" className="text-[10px] text-[#dc3545] font-bold hover:underline">Customer Masterlist</a>
                </div>
            </footer>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
                            <div className="bg-white px-8 pt-8 pb-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                            Edit Incident Details
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                                            {editingIncident?.incident_number}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Report Title</label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            readOnly
                                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-500 cursor-not-allowed"
                                        />
                                        <p className="text-[9px] text-slate-400 mt-1 ml-1 uppercase font-bold tracking-tight italic">Title auto-updates based on fields below</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Server ID</label>
                                            <input
                                                type="text"
                                                value={editForm.sip_id}
                                                onChange={(e) => setEditForm({ ...editForm, sip_id: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] outline-none transition-all text-sm font-bold text-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Client Name</label>
                                            <input
                                                type="text"
                                                value={editForm.client_name}
                                                onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] outline-none transition-all text-sm font-bold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Incident</label>
                                        <input
                                            type="date"
                                            value={editForm.incident_date}
                                            onChange={(e) => setEditForm({ ...editForm, incident_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dc3545]/20 focus:border-[#dc3545] outline-none transition-all text-sm font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-8 py-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isUpdating}
                                    className="px-6 py-2.5 bg-[#dc3545] text-white text-sm font-bold rounded-xl hover:bg-[#bb2d3b] transition-colors shadow-lg shadow-[#dc3545]/20 disabled:opacity-50 flex items-center gap-2"
                                    onClick={handleUpdateIncident}
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
