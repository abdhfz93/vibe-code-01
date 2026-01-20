'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MaintenanceRecord, ServerName, ClientName, Status } from '@/types/maintenance'
import MaintenanceForm from '@/components/MaintenanceForm'
import MaintenanceTable from '@/components/MaintenanceTable'
import SearchAndFilter from '@/components/SearchAndFilter'

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [serverFilter, setServerFilter] = useState<ServerName | 'all'>('all')
  const [clientFilter, setClientFilter] = useState<ClientName | 'all'>('all')
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

  // Filter records based on search, server, and client
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.server_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.maintenance_reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.performed_by.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServer = serverFilter === 'all' || record.server_name === serverFilter
    const matchesClient = clientFilter === 'all' || record.client_name === clientFilter
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    return matchesSearch && matchesServer && matchesClient && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header with Brand Gradient */}
      <div className="premium-bg h-32 sm:h-48 w-full absolute top-0 left-0 z-0"></div>

      <div className="relative z-10 w-full mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-10">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-100 bg-white/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Nautilus Maintenance Record
                </h1>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {showForm && (
                  <button
                    onClick={handleFormCancel}
                    className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleAdd}
                  disabled={showForm}
                  className="flex-1 sm:flex-none premium-bg text-white px-6 py-2 rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-[#dc3545]/20 text-sm disabled:grayscale disabled:opacity-50"
                >
                  {isCopying ? 'Copying...' : editingRecord ? 'Editing...' : 'Add New Record'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              serverFilter={serverFilter}
              onServerFilterChange={setServerFilter}
              clientFilter={clientFilter}
              onClientFilterChange={setClientFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

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

            <div className="relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dc3545] mb-4"></div>
                  <p className="text-gray-400 font-medium">Refreshing Data...</p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <MaintenanceTable
                    records={filteredRecords}
                    onEdit={handleEdit}
                    onCopy={handleCopy}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-400 text-xs font-medium">
          &copy; {new Date().getFullYear()} Nautilus SIP Pte Ltd.
        </footer>
      </div>
    </div>
  )
}
