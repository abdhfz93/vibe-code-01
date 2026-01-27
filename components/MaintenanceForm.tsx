'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MaintenanceRecord, MaintenanceRecordInput, ServerName, ClientName, MaintenanceReason, Approver, PerformedBy, Status, ProofOfMaintenance } from '@/types/maintenance'

interface MaintenanceFormProps {
  record?: MaintenanceRecord | null
  isCopy?: boolean
  onSuccess: () => void
  onCancel: () => void
}

const REASON_OPTIONS: MaintenanceReason[] = ['Asterisk Upgrade', 'DB Migration', 'Key Rotation', 'OS Patching', 'Other Reasons', 'Portal Upgrade', 'SSL Renewal', 'WAF Implementation']
const APPROVER_OPTIONS: Approver[] = ['john']
const PERFORMED_BY_OPTIONS: PerformedBy[] = ['aiman', 'hafiz', 'shahid', 'sayem', 'naveed', 'mostafijur', 'maaruf']
const STATUS_OPTIONS: Status[] = ['completed', 'failed', 'on-hold', 'pending']

export default function MaintenanceForm({ record, isCopy, onSuccess, onCancel }: MaintenanceFormProps) {
  const [formData, setFormData] = useState<MaintenanceRecordInput>({
    server_name: '',
    client_name: '',
    maintenance_date: '',
    start_time: '',
    end_time: '',
    maintenance_reason: 'Portal Upgrade',
    approver: 'john',
    performed_by: 'aiman',
    status: 'pending',
    remark: '',
    checklist: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<ProofOfMaintenance[]>(
    record?.proof_of_maintenance
      ? record.proof_of_maintenance.map(p => typeof p === 'string' ? { url: p } : p)
      : []
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (record) {
      setFormData({
        server_name: record.server_name,
        client_name: record.client_name,
        maintenance_date: record.maintenance_date,
        start_time: record.start_time?.substring(0, 5) || '', // Handle HH:MM:SS format from Postgres
        end_time: record.end_time?.substring(0, 5) || '',
        maintenance_reason: record.maintenance_reason,
        approver: record.approver,
        performed_by: record.performed_by || (record as any).perform_by || 'hafiz',
        status: record.status,
        remark: isCopy ? '' : (record.remark || ''),
        checklist: record.checklist || [],
      })

      if (isCopy) {
        setUploadedFiles([])
        return
      }

      // Handle both array and legacy single string format, and JSONB string from Supabase
      let proofFiles: (string | ProofOfMaintenance)[] = []
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

      const normalizedProofs = proofFiles.map(p => typeof p === 'string' ? { url: p } : p)
      setUploadedFiles(normalizedProofs)
    } else {
      setUploadedFiles([])
    }
  }, [record])


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
      const newProofs = newUrls.map(url => ({ url }))
      setUploadedFiles([...uploadedFiles, ...newProofs])
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

  const handleCommentChange = (index: number, comment: string) => {
    const updated = [...uploadedFiles]
    updated[index] = { ...updated[index], comment }
    setUploadedFiles(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const dataToSubmit = {
        ...formData,
        performed_by: formData.performed_by || 'aiman', // Fallback to avoid not-null constraint error
        proof_of_maintenance: uploadedFiles.length > 0 ? uploadedFiles : null,
      }

      if (!dataToSubmit.performed_by) {
        alert('Please select at least one person in "Performed By"')
        setSubmitting(false)
        return
      }

      if (record && !isCopy) {
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
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // Return original if not a valid date
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
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-inner">
      <h2 className="text-xl font-semibold mb-4">
        {isCopy ? 'Copy Nautilus Record' : record ? 'Edit Nautilus Record' : 'Add New Maintenance Record'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="server_name" className="block text-sm font-medium text-gray-700 mb-1">
              Server Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="server_name"
              required
              placeholder="Enter server name"
              value={formData.server_name}
              onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="client_name"
              required
              placeholder="Enter client name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all"
            />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] transition-all"
          />
          {formData.maintenance_date && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {formatDateForDisplay(formData.maintenance_date)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="start_time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] transition-all"
            />
          </div>
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="end_time"
              required
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] transition-all"
            />
          </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] transition-all"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] transition-all"
            >
              {APPROVER_OPTIONS.map((approver) => (
                <option key={approver} value={approver}>
                  {approver.charAt(0).toUpperCase() + approver.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Performed By <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3 p-2 border border-gray-300 rounded-lg bg-white">
              {PERFORMED_BY_OPTIONS.map((person) => {
                const selected = formData.performed_by.split(', ').includes(person)
                return (
                  <label key={person} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const current = formData.performed_by ? formData.performed_by.split(', ') : []
                        const updated = e.target.checked
                          ? [...current, person]
                          : current.filter(p => p !== person)
                        setFormData({ ...formData, performed_by: updated.join(', ') })
                      }}
                      className="rounded border-gray-300 text-[#dc3545] focus:ring-[#dc3545] h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">
                      {person.charAt(0).toUpperCase() + person.slice(1)}
                    </span>
                  </label>
                )
              })}
            </div>
            {formData.performed_by === '' && (
              <p className="mt-1 text-xs text-red-500">Please select at least one person</p>
            )}
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
            <div className="mt-3 space-y-3">
              <p className="text-sm font-medium text-gray-700">Uploaded files with descriptions:</p>
              <div className="grid grid-cols-1 gap-3">
                {uploadedFiles.map((proof, index) => (
                  <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex-1 truncate"
                      >
                        Proof {index + 1}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="ml-2 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-all uppercase tracking-tight"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Add a description (e.g. Before maintenance)"
                      value={proof.comment || ''}
                      onChange={(e) => handleCommentChange(index, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">
            Remark (Max 1000 characters)
          </label>
          <textarea
            id="remark"
            rows={3}
            maxLength={1000}
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] transition-all"
            placeholder="Add any additional notes here..."
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {formData.remark?.length || 0} / 1000
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="premium-bg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : isCopy ? 'Copy' : record ? 'Update' : 'Create'}
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
