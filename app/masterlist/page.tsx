'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MasterlistRecord } from '@/types/masterlist'
import MasterlistTable from '@/components/MasterlistTable'
import MasterlistForm from '@/components/MasterlistForm'

export default function MasterlistPage() {
    const [records, setRecords] = useState<MasterlistRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingRecord, setEditingRecord] = useState<MasterlistRecord | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchRecords()
    }, [])

    const fetchRecords = async () => {
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
    }

    const handleAdd = () => {
        setEditingRecord(null)
        setShowForm(true)
    }

    const handleEdit = (record: MasterlistRecord) => {
        setEditingRecord(record)
        setShowForm(true)
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

    const filteredRecords = records.filter(record =>
        record.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.server_url && record.server_url.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.sip_id && record.sip_id.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search by name, URL or SIP..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 transition-colors group-focus-within:text-[#dc3545]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <button
                                onClick={handleAdd}
                                className="bg-gradient-to-r from-[#dc3545] to-[#a71d2a] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#dc3545]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm whitespace-nowrap"
                            >
                                + Add Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900">Feature Under Construction</h4>
                        <p className="text-xs text-amber-700">The Customer Masterlist is currently being populated and refined. Some functions may be limited.</p>
                    </div>
                </div>
            </div>

            <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Refreshing...</p>
                        </div>
                    ) : (
                        <MasterlistTable
                            records={filteredRecords}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </main>

            <footer className="mt-20 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">
                    &copy; {new Date().getFullYear()} Nautilus SIP Pte Ltd.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="/maintenance" className="text-[10px] text-[#dc3545] font-bold hover:underline">Maintenance Record</a>
                    <span className="text-gray-200 text-[10px]">|</span>
                    <span className="text-[10px] text-gray-400 font-bold">Customer Masterlist</span>
                </div>
            </footer>
        </div>
    )
}
