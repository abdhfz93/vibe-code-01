'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MaintenanceRecord, MaintenanceRecordInput, ServerName, ClientName, MaintenanceReason, Approver, PerformBy, Status } from '@/types/maintenance'

interface MaintenanceFormProps {
  record?: MaintenanceRecord | null
  onSuccess: () => void
  onCancel: () => void
}

const SERVER_OPTIONS: ServerName[] = [
  'sip00', 'sip01', 'sip02', 'sip03', 'sip04', 'sip05', 'sip07', 'sip08', 'sip09',
  'sip10', 'sip11', 'sip15', 'sip17', 'sip19', 'sip20', 'sip21', 'sip22', 'sip26',
  'sip27', 'sip28', 'sip29', 'sip30', 'sip32', 'sip33', 'sip35', 'sip37', 'sip45',
  'sip46', 'sip50', 'sip52', 'sip54', 'sip55', 'sip56', 'sip58', 'sip59', 'sip60',
  'sip61', 'sip64', 'sip65', 'sip66', 'sip67', 'sip70', 'sip103', 'sip104',
  'sip205', 'sip206', 'sip207', 'sip208', 'sip209', 'sip210', 'sip212', 'sip213',
  'sip214', 'sip215', 'sip216'
]
const CLIENT_OPTIONS: ClientName[] = ['certis', 'getgo', 'pegasus', 'hisense']
const REASON_OPTIONS: MaintenanceReason[] = ['Reporting Portal Upgrade', 'DB Migration', 'OS Patching']
const APPROVER_OPTIONS: Approver[] = ['john', 'sayem', 'naveed']
const PERFORM_BY_OPTIONS: PerformBy[] = ['hafiz', 'shahid', 'aiman']
const STATUS_OPTIONS: Status[] = ['pending', 'on-hold', 'failed', 'completed']

export default function MaintenanceForm({ record, onSuccess, onCancel }: MaintenanceFormProps) {
  const [formData, setFormData] = useState<MaintenanceRecordInput>({
    server_name: 'sip11',
    client_name: 'certis',
    maintenance_date: '',
    maintenance_reason: 'Reporting Portal Upgrade',
    approver: 'john',
    perform_by: 'hafiz',
    status: 'pending',
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(record?.proof_of_maintenance || [])
  const [serverSearch, setServerSearch] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [showServerDropdown, setShowServerDropdown] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const serverDropdownRef = useRef<HTMLDivElement>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (record) {
      setFormData({
        server_name: record.server_name,
        client_name: record.client_name,
        maintenance_date: record.maintenance_date,
        maintenance_reason: record.maintenance_reason,
        approver: record.approver,
        perform_by: record.perform_by,
        status: record.status,
      })
      // Handle both array and legacy single string format, and JSONB string from Supabase
      let proofFiles: string[] = []
      if (Array.isArray(record.proof_of_maintenance)) {
        proofFiles = record.proof_of_maintenance
      } else if (typeof record.proof_of_maintenance === 'string' && record.proof_of_maintenance) {
        try {
          const parsed = JSON.parse(record.proof_of_maintenance)
          proofFiles = Array.isArray(parsed) ? parsed : [record.proof_of_maintenance]
        } catch {
          // If it's not JSON, treat as single URL string
          proofFiles = [record.proof_of_maintenance]
        }
      }
      setUploadedFiles(proofFiles)
    } else {
      setUploadedFiles([])
    }
  }, [record])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(event.target as Node)) {
        setShowServerDropdown(false)
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      alert('Please upload image files (PNG, JPG, etc.)')
      return
    }

    if (uploadedFiles.length + imageFiles.length > 5) {
      alert(`You can only upload up to 5 proof files. Currently have ${uploadedFiles.length}, trying to add ${imageFiles.length}.`)
      return
    }

    try {
      setUploading(true)

      // Upload directly - bucket should already exist
      // If bucket doesn't exist, upload will fail with a clear error
      const uploadPromises = imageFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`

        const { data, error } = await supabase.storage
          .from('maintenance-proofs')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('maintenance-proofs')
          .getPublicUrl(fileName)

        return publicUrl
      })

      const newUrls = await Promise.all(uploadPromises)
      setUploadedFiles([...uploadedFiles, ...newUrls])
    } catch (error: any) {
      console.error('Error uploading files:', error)
      const errorMessage = error?.message || 'Failed to upload files'
      if (errorMessage.includes('Bucket not found') || errorMessage.includes('does not exist')) {
        alert('Storage bucket "maintenance-proofs" not found. Please ensure it exists in Supabase Storage settings.')
      } else {
        alert(`Upload failed: ${errorMessage}`)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (indexToRemove: number) => {
    setUploadedFiles(uploadedFiles.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const dataToSubmit = {
        ...formData,
        proof_of_maintenance: uploadedFiles.length > 0 ? uploadedFiles : null,
      }

      if (record) {
        // Update existing record
        const { error } = await supabase
          .from('maintenance_records')
          .update({
            ...dataToSubmit,
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id)

        if (error) throw error
      } else {
        // Create new record (maintenance_number and submit_date are auto-generated)
        const { error } = await supabase
          .from('maintenance_records')
          .insert([dataToSubmit])

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving record:', error)
      alert('Failed to save record')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredServers = SERVER_OPTIONS.filter(server =>
    server.toLowerCase().includes(serverSearch.toLowerCase())
  )

  const filteredClients = CLIENT_OPTIONS.filter(client =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    // Convert DD/MM/YYYY to YYYY-MM-DD for input
    const parts = dateString.split('/')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateString
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ''
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Store as YYYY-MM-DD internally, but display as DD/MM/YYYY
    setFormData({ ...formData, maintenance_date: value })
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {record ? 'Edit Record' : 'Add New Record'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={serverDropdownRef}>
            <label htmlFor="server_name" className="block text-sm font-medium text-gray-700 mb-1">
              Server Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="server_name"
                required
                value={showServerDropdown ? serverSearch : formData.server_name}
                onChange={(e) => {
                  setServerSearch(e.target.value)
                  setShowServerDropdown(true)
                }}
                onFocus={() => {
                  setServerSearch('')
                  setShowServerDropdown(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showServerDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredServers.map((server) => (
                    <button
                      key={server}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, server_name: server })
                        setShowServerDropdown(false)
                        setServerSearch('')
                      }}
                      className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {server}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative" ref={clientDropdownRef}>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="client_name"
                required
                value={showClientDropdown ? clientSearch : formData.client_name}
                onChange={(e) => {
                  setClientSearch(e.target.value)
                  setShowClientDropdown(true)
                }}
                onFocus={() => {
                  setClientSearch('')
                  setShowClientDropdown(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showClientDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredClients.map((client) => (
                    <button
                      key={client}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, client_name: client })
                        setShowClientDropdown(false)
                        setClientSearch('')
                      }}
                      className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {client}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="maintenance_date" className="block text-sm font-medium text-gray-700 mb-1">
            Maintenance Date (DD/MM/YYYY) <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="maintenance_date"
            required
            value={formData.maintenance_date}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formData.maintenance_date && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {formatDateForDisplay(formData.maintenance_date)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="maintenance_reason" className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="maintenance_reason"
              required
              value={formData.maintenance_reason}
              onChange={(e) => setFormData({ ...formData, maintenance_reason: e.target.value as MaintenanceReason })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {REASON_OPTIONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="approver" className="block text-sm font-medium text-gray-700 mb-1">
              Approver <span className="text-red-500">*</span>
            </label>
            <select
              id="approver"
              required
              value={formData.approver}
              onChange={(e) => setFormData({ ...formData, approver: e.target.value as Approver })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {APPROVER_OPTIONS.map((approver) => (
                <option key={approver} value={approver}>
                  {approver.charAt(0).toUpperCase() + approver.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="perform_by" className="block text-sm font-medium text-gray-700 mb-1">
              Perform By <span className="text-red-500">*</span>
            </label>
            <select
              id="perform_by"
              required
              value={formData.perform_by}
              onChange={(e) => setFormData({ ...formData, perform_by: e.target.value as PerformBy })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PERFORM_BY_OPTIONS.map((person) => (
                <option key={person} value={person}>
                  {person.charAt(0).toUpperCase() + person.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="proof_of_maintenance" className="block text-sm font-medium text-gray-700 mb-1">
            Proof of Maintenance (Images) - Up to 5 files
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="proof_of_maintenance"
            accept="image/*"
            multiple
            disabled={uploadedFiles.length >= 5}
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files)
                // Reset input
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            {uploadedFiles.length} / 5 files uploaded
          </p>
          {uploading && (
            <p className="mt-1 text-sm text-blue-600">Uploading...</p>
          )}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex-1 truncate"
                    >
                      Proof {index + 1}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : record ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
