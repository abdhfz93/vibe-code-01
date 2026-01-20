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
  }

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record)
    setIsCopying(false)
    setShowForm(true)
  }

  const handleCopy = (record: MaintenanceRecord) => {
    setEditingRecord(record)
    setIsCopying(true)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      // Also delete the proof files if they exist
      const record = records.find(r => r.id === id)
      if (record?.proof_of_maintenance && record.proof_of_maintenance.length > 0) {
        const fileNames = record.proof_of_maintenance.map(url => {
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

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Premium Sticky Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
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
              records={filteredRecords}
              onEdit={handleEdit}
              onCopy={handleCopy}
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
          <span className="text-[10px] text-gray-400 font-bold">Maintenance Record</span>
          <span className="text-gray-200 text-[10px]">|</span>
          <a href="/masterlist" className="text-[10px] text-[#dc3545] font-bold hover:underline">Customer Masterlist</a>
        </div>
      </footer>
    </div>
  )
}
