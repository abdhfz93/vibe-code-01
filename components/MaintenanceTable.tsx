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
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500">No maintenance records found on this server.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              MNT #
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Submit / Update
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Server / Client
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Schedule
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Reason / Remark
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Team
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Status
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Proof
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm font-semibold text-slate-900">{record.maintenance_number}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-900">{formatDate(record.submit_date)}</span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Update:</span>
                    <span>{formatDateTime(record.updated_at)}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">{record.server_name}</span>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">{record.client_name}</span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-slate-900">{formatDate(record.maintenance_date)}</span>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTime(record.start_time)} - {formatTime(record.end_time)}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 max-w-[400px]">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-slate-600 font-medium leading-tight" title={record.maintenance_reason}>
                    {record.maintenance_reason}
                  </p>
                  {record.remark && (
                    <div>
                      <button
                        onClick={() => setSelectedRemark(record.remark)}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/80 px-2 py-0.5 rounded transition-colors uppercase tracking-tight"
                      >
                        Note
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Approved by</span>
                  <span className="text-sm font-semibold text-slate-900 capitalize leading-none">{record.approver}</span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Performed by:</span>
                    <span className="truncate max-w-[120px]">{record.performed_by}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`px-3 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-full shadow-sm border capitalize ${getStatusColor(
                    record.status
                  )}`}
                >
                  {record.status.replace('-', ' ')}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center text-[11px] text-slate-500 font-medium">
                  {(() => {
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

                    if (proofs.length === 0) return <span>No Proof</span>

                    return (
                      <div className="flex gap-1">
                        {proofs.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-4 h-4 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-[9px] font-bold hover:bg-[#dc3545] hover:text-white transition-all shadow-sm"
                          >
                            {index + 1}
                          </a>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(record)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onCopy(record)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="Copy"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
