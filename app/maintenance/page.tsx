'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MaintenanceRecord, ServerName, ClientName } from '@/types/maintenance'
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
    setShowForm(true)
  }

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record)
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
    fetchRecords()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingRecord(null)
  }

  // Filter records based on search, server, and client
  const filteredRecords = records.filter((record) => {
    const matchesSearch = 
      record.maintenance_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.server_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServer = serverFilter === 'all' || record.server_name === serverFilter
    const matchesClient = clientFilter === 'all' || record.client_name === clientFilter
    return matchesSearch && matchesServer && matchesClient
  })

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Maintenance Records
              </h1>
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Add New Record
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              serverFilter={serverFilter}
              onServerFilterChange={setServerFilter}
              clientFilter={clientFilter}
              onClientFilterChange={setClientFilter}
            />

            {showForm && (
              <div className="mb-6">
                <MaintenanceForm
                  record={editingRecord}
                  onSuccess={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading records...</p>
              </div>
            ) : (
              <MaintenanceTable
                records={filteredRecords}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
