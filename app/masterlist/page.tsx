'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { MasterlistRecord } from '@/types/masterlist'
import MasterlistTable from '@/components/MasterlistTable'
import MasterlistForm from '@/components/MasterlistForm'
import MasterlistView from '@/components/MasterlistView'

// Defined values for fixed filters (Must match MasterlistForm constants)
const PROVIDERS = ['MyRepublic', 'Singtel']
const CATEGORIES = ['Grow Profile', 'High Profile', 'Medium Profile']
const ENDPOINT_CLASSIFICATIONS = [
    'ATA (Gateway)',
    'Call Forwarding',
    'Door phone',
    'GS Wave (Mobile App)',
    'IP phone (Hardphone)',
    'Nautilus Connect (Mobile App)',
    'Nautilus Desk (Softphone)',
    'Nautilus Go (Mobile App)',
    'SIP Trunk',
    'UCM - Grandstream PBX',
    'Webphone',
    'Zoiper (Softphone)'
]

export default function MasterlistPage() {
    const [records, setRecords] = useState<MasterlistRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingRecord, setEditingRecord] = useState<MasterlistRecord | null>(null)
    const [viewingRecord, setViewingRecord] = useState<MasterlistRecord | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Filters
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [endpointFilter, setEndpointFilter] = useState('all')

    const fetchRecords = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('customer_masterlist')
                .select('*')
                .order('company_name', { ascending: true })

            if (error) throw error
            setRecords(data || [])
        } catch (error) {
            console.error('Error fetching masterlist:', error)
            alert('Failed to load customer masterlist')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords])

    const handleAdd = () => {
        setEditingRecord(null)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleEdit = (record: MasterlistRecord) => {
        setViewingRecord(null)
        setEditingRecord(record)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleView = (record: MasterlistRecord) => {
        setViewingRecord(record)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer from the masterlist?')) {
            return
        }

        try {
            const { error } = await supabase
                .from('customer_masterlist')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchRecords()
        } catch (error) {
            console.error('Error deleting record:', error)
            alert('Failed to delete customer')
        }
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setEditingRecord(null)
        fetchRecords()
    }

    const filteredRecords = records.filter(record => {
        const term = searchTerm.toLowerCase().trim()
        const isExact = term.startsWith('"') && term.endsWith('"') && term.length > 2
        const searchStr = isExact ? term.slice(1, -1) : term

        const matchesSearch = isExact ? (
            record.company_name.toLowerCase() === searchStr ||
            (record.sip_id && record.sip_id.toLowerCase() === searchStr) ||
            (record.ip_address && record.ip_address.toLowerCase() === searchStr) ||
            (record.server_url && record.server_url.toLowerCase() === searchStr) ||
            (record.custom_features && record.custom_features.toLowerCase() === searchStr) ||
            (record.subscription_plan && record.subscription_plan.toLowerCase() === searchStr)
        ) : (
            record.company_name.toLowerCase().includes(searchStr) ||
            (record.sip_id && record.sip_id.toLowerCase().includes(searchStr)) ||
            (record.ip_address && record.ip_address.toLowerCase().includes(searchStr)) ||
            (record.server_url && record.server_url.toLowerCase().includes(searchStr)) ||
            (record.custom_features && record.custom_features.toLowerCase().includes(searchStr)) ||
            (record.subscription_plan && record.subscription_plan.toLowerCase().includes(searchStr))
        )

        const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter
        const matchesEndpoint = endpointFilter === 'all' || (record.endpoint_classification && record.endpoint_classification.split(', ').includes(endpointFilter))

        return matchesSearch && matchesCategory && matchesEndpoint
    })

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            {/* Premium Sticky Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <a
                                href="/"
                                className="p-2 bg-slate-50 text-slate-400 hover:text-[#dc3545] hover:bg-[#dc3545]/10 rounded-xl transition-all group"
                                title="Back to Home"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </a>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                <span className="text-[#dc3545]">Nautilus</span> Customer Masterlist
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group flex-1 min-w-[300px]">
                                <input
                                    type="text"
                                    placeholder="Search by Name, SIP# or IP..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5 transition-colors group-focus-within:text-[#dc3545]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <div className="flex gap-2">

                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] outline-none transition-all text-xs font-bold text-gray-700"
                                >
                                    <option value="all">All Categories</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>

                                <select
                                    value={endpointFilter}
                                    onChange={(e) => setEndpointFilter(e.target.value)}
                                    className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] outline-none transition-all text-xs font-bold text-gray-700"
                                >
                                    <option value="all">All Endpoints</option>
                                    {ENDPOINT_CLASSIFICATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={handleAdd}
                                disabled={showForm}
                                className="bg-gradient-to-r from-[#dc3545] to-[#a71d2a] text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-[#dc3545]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm whitespace-nowrap disabled:grayscale disabled:opacity-50"
                            >
                                + Add Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">

                {showForm && (
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <MasterlistForm
                            record={editingRecord}
                            onSuccess={handleFormSuccess}
                            onCancel={() => {
                                setShowForm(false)
                                setEditingRecord(null)
                            }}
                        />
                    </div>
                )}

                <div className="bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dc3545] mb-4"></div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Accessing Database...</p>
                        </div>
                    ) : (
                        <MasterlistTable
                            records={filteredRecords}
                            onEdit={handleEdit}
                            onView={handleView}
                            onDelete={handleDelete}
                        />
                    )}
                </div>

                {viewingRecord && (
                    <MasterlistView
                        record={viewingRecord}
                        onClose={() => setViewingRecord(null)}
                    />
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 text-center z-40">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
                    &copy; {new Date().getFullYear()} Nautilus SIP Pte Ltd.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="/maintenance" className="text-[10px] text-[#dc3545] font-bold hover:underline">Maintenance Record</a>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <a href="/incident" className="text-[10px] text-[#dc3545] font-bold hover:underline">Incident Report</a>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <span className="text-[10px] text-gray-400 font-bold">Customer Masterlist</span>
                </div>
            </footer>
        </div>
    )
}
