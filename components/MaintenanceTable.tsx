'use client'

import { useState } from 'react'
import { MaintenanceRecord } from '@/types/maintenance'

interface MaintenanceTableProps {
  records: MaintenanceRecord[]
  onEdit: (record: MaintenanceRecord) => void
  onCopy: (record: MaintenanceRecord) => void
  onDelete: (id: string) => void
}

export default function MaintenanceTable({ records, onEdit, onCopy, onDelete }: MaintenanceTableProps) {
  const [selectedRemark, setSelectedRemark] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    return timeString.substring(0, 5) // Display HH:MM
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'on-hold':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No Nautilus maintenance records found.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MNT #
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submit / Update
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Server
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date / Time
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Approver
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performed By
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proof
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Remark
            </th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                {record.maintenance_number}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                <div className="font-medium text-gray-900">{formatDate(record.submit_date)}</div>
                <div className="text-[10px] text-gray-400">
                  Update: {formatDateTime(record.updated_at)}
                </div>
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {record.server_name}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {record.client_name}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                <div className="font-medium text-gray-900">{formatDate(record.maintenance_date)}</div>
                <div className="text-[10px] text-gray-400">
                  {formatTime(record.start_time)} - {formatTime(record.end_time)}
                </div>
              </td>
              <td className="px-2 py-2 text-xs text-gray-500 max-w-[100px] truncate" title={record.maintenance_reason}>
                {record.maintenance_reason}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 capitalize">
                {record.approver}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {(record.performed_by || (record as any).perform_by || '')
                  .split(', ')
                  .map((name: string) => name.charAt(0).toUpperCase() + name.slice(1))
                  .join(', ')}
              </td>
              <td className="px-2 py-2 whitespace-nowrap">
                <span
                  className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(
                    record.status
                  )}`}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                </span>
              </td>
              <td className="px-2 py-2 text-xs">
                {(() => {
                  // Handle both array and potential string format from Supabase
                  let proofs: string[] = []
                  if (Array.isArray(record.proof_of_maintenance)) {
                    proofs = record.proof_of_maintenance
                  } else if (typeof record.proof_of_maintenance === 'string' && record.proof_of_maintenance) {
                    try {
                      const parsed = JSON.parse(record.proof_of_maintenance)
                      proofs = Array.isArray(parsed) ? parsed : [record.proof_of_maintenance]
                    } catch {
                      proofs = [record.proof_of_maintenance]
                    }
                  }

                  return proofs.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {proofs.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )
                })()}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs">
                {record.remark ? (
                  <button
                    onClick={() => setSelectedRemark(record.remark)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Show
                  </button>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(record)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onCopy(record)}
                      className="text-blue-600 hover:text-blue-900 font-bold"
                    >
                      Copy
                    </button>
                  </div>
                  <button
                    onClick={() => onDelete(record.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remark Modal */}
      {selectedRemark !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedRemark(null)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Remark
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 whitespace-pre-wrap break-words">
                        {selectedRemark || 'No remark added.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedRemark(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
