'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MaintenanceRecord, Status } from '@/types/maintenance'
import MaintenanceForm from '@/components/MaintenanceForm'
import MaintenanceTable from '@/components/MaintenanceTable'
import SearchAndFilter from '@/components/SearchAndFilter'

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [isCopying, setIsCopying] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .order('submit_date', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
      alert('Failed to fetch maintenance records')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingRecord(null)
    setIsCopying(false)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record)
    setIsCopying(false)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCopy = (record: MaintenanceRecord) => {
    setEditingRecord(record)
    setIsCopying(true)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      // Also delete the proof files if they exist
      const record = records.find(r => r.id === id)
      if (record?.proof_of_maintenance && record.proof_of_maintenance.length > 0) {
        const fileNames = record.proof_of_maintenance.map(p => {
          const url = typeof p === 'string' ? p : p.url
          const urlParts = url.split('/')
          return urlParts[urlParts.length - 1]?.split('?')[0]
        }).filter(Boolean) as string[]

        if (fileNames.length > 0) {
          await supabase.storage
            .from('maintenance-proofs')
            .remove(fileNames)
        }
      }

      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Failed to delete record')
    }
  }

  const handleUpdateChecklist = async (recordId: string, checklist: any[]) => {
    try {
      const { error } = await supabase
        .from('maintenance_records')
        .update({
          checklist: checklist,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)

      if (error) throw error

      // Update local state without full refetch for better UX
      setRecords(prev => prev.map(r =>
        r.id === recordId ? { ...r, checklist } : r
      ))
    } catch (error) {
      console.error('Error updating checklist:', error)
      throw error // Re-throw to be handled by the component
    }
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    setEditingRecord(null)
    setIsCopying(false)
    fetchRecords()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingRecord(null)
    setIsCopying(false)
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter records based on search and status
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.server_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.maintenance_reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.performed_by.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

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
                <span className="text-[#dc3545]">Nautilus</span> Maintenance Record
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5 transition-colors group-focus-within:text-[#dc3545]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                className="pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] outline-none transition-all text-sm font-semibold text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="on-hold">On-Hold</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              <button
                onClick={handleAdd}
                disabled={showForm}
                className="bg-gradient-to-r from-[#dc3545] to-[#a71d2a] text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-[#dc3545]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm whitespace-nowrap disabled:grayscale disabled:opacity-50"
              >
                {isCopying ? 'Copying...' : editingRecord ? 'Editing...' : '+ Add New Record'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {showForm && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <MaintenanceForm
              record={editingRecord}
              isCopy={isCopying}
              onSuccess={handleFormSubmit}
              onCancel={handleFormCancel}
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
            <MaintenanceTable
              records={paginatedRecords}
              onEdit={handleEdit}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onUpdateChecklist={handleUpdateChecklist}
            />
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && filteredRecords.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{Math.min(filteredRecords.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
                <span className="font-bold text-gray-900">{Math.min(filteredRecords.length, currentPage * itemsPerPage)}</span> of{' '}
                <span className="font-bold text-gray-900">{filteredRecords.length}</span> records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-gray-50 transition-all border border-gray-100"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${currentPage === pageNum
                          ? 'bg-[#dc3545] text-white border-[#dc3545] shadow-lg shadow-[#dc3545]/20'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-[#dc3545] hover:text-[#dc3545]'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-1 text-gray-400">...</span>
                  }
                  return null
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-gray-50 transition-all border border-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 text-center z-40">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
          &copy; {new Date().getFullYear()} Nautilus SIP Pte Ltd.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/masterlist" className="text-[10px] text-[#dc3545] font-bold hover:underline">Customer Masterlist</a>
          <span className="text-gray-200 text-[10px]">|</span>
          <a href="/incident" className="text-[10px] text-[#dc3545] font-bold hover:underline">Incident Report</a>
          <span className="text-gray-200 text-[10px]">|</span>
          <span className="text-[10px] text-gray-400 font-bold">Maintenance Record</span>
        </div>
      </footer>
    </div>
  )
}
