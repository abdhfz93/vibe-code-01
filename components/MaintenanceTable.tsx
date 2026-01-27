'use client'

import { useState, useEffect } from 'react'
import { MaintenanceRecord, ChecklistItem, ProofOfMaintenance } from '@/types/maintenance'
import MaintenanceSummaryView from './MaintenanceSummaryView'

interface MaintenanceTableProps {
  records: MaintenanceRecord[]
  onEdit: (record: MaintenanceRecord) => void
  onCopy: (record: MaintenanceRecord) => void
  onDelete: (id: string) => void
  onUpdateChecklist: (recordId: string, checklist: ChecklistItem[]) => Promise<void>
}

export default function MaintenanceTable({ records, onEdit, onCopy, onDelete, onUpdateChecklist }: MaintenanceTableProps) {
  const [selectedRemark, setSelectedRemark] = useState<string | null>(null)
  const [selectedChecklistRecord, setSelectedChecklistRecord] = useState<MaintenanceRecord | null>(null)
  const [selectedSummaryRecord, setSelectedSummaryRecord] = useState<MaintenanceRecord | null>(null)
  const [activeProofList, setActiveProofList] = useState<ProofOfMaintenance[]>([])
  const [activeProofIndex, setActiveProofIndex] = useState<number>(-1)
  const [localChecklists, setLocalChecklists] = useState<Record<string, ChecklistItem[]>>({})
  const [tempChecklist, setTempChecklist] = useState<ChecklistItem[] | null>(null)
  const [newItemLabel, setNewItemLabel] = useState('')

  const defaultChecklistItems = [
    "Able to make outgoing calls",
    "Able to receive incoming calls"
  ]

  const handleStatusChange = (itemLabel: string, newStatus: 'pass' | 'fail' | 'not-tested') => {
    if (!tempChecklist) return

    const updatedChecklist = tempChecklist.map(item => {
      if (item.label === itemLabel) {
        return { ...item, status: newStatus }
      }
      return item
    })

    setTempChecklist(updatedChecklist)
  }

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemLabel.trim() || !tempChecklist) return
    if (tempChecklist.some(i => i.label.toLowerCase() === newItemLabel.trim().toLowerCase())) {
      alert('This item already exists')
      return
    }
    setTempChecklist([...tempChecklist, { label: newItemLabel.trim(), status: 'not-tested' }])
    setNewItemLabel('')
  }

  const handleDeleteChecklistItem = (label: string) => {
    if (!tempChecklist) return
    if (defaultChecklistItems.includes(label)) {
      alert("You cannot delete default checklist items")
      return
    }
    setTempChecklist(tempChecklist.filter(item => item.label !== label))
  }

  const handleSaveChecklist = async () => {
    if (!selectedChecklistRecord || !tempChecklist) return

    setLocalChecklists(prev => ({ ...prev, [selectedChecklistRecord.id]: tempChecklist }))

    try {
      await onUpdateChecklist(selectedChecklistRecord.id, tempChecklist)
      setSelectedChecklistRecord(null)
      setTempChecklist(null)
    } catch (error) {
      console.error('Failed to update checklist:', error)
      alert('Failed to save checklist state. Please try again.')
    }
  }

  const closeChecklist = () => {
    setSelectedChecklistRecord(null)
    setTempChecklist(null)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRemark(null)
        closeChecklist()
        setSelectedSummaryRecord(null)
        setActiveProofIndex(-1)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeProofIndex === -1) return

      if (e.key === 'ArrowRight' && activeProofIndex < activeProofList.length - 1) {
        setActiveProofIndex(prev => prev + 1)
      } else if (e.key === 'ArrowLeft' && activeProofIndex > 0) {
        setActiveProofIndex(prev => prev - 1)
      }
    }

    window.addEventListener('keydown', handleEsc)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleEsc)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeProofIndex, activeProofList.length])

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
              Proof / Checklist
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
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">Approved by:</span>
                    <span className="text-[11px] font-semibold text-slate-700 capitalize">{record.approver}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Performed by:</span>
                    <span className="text-[11px] font-medium text-slate-600 leading-snug">{record.performed_by}</span>
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
                    let proofs: ProofOfMaintenance[] = []
                    if (Array.isArray(record.proof_of_maintenance)) {
                      proofs = record.proof_of_maintenance.map(p => typeof p === 'string' ? { url: p } : p)
                    } else if (typeof record.proof_of_maintenance === 'string' && record.proof_of_maintenance) {
                      try {
                        const parsed = JSON.parse(record.proof_of_maintenance)
                        proofs = (Array.isArray(parsed) ? parsed : [record.proof_of_maintenance]).map(p => typeof p === 'string' ? { url: p } : p)
                      } catch {
                        proofs = [{ url: record.proof_of_maintenance }]
                      }
                    }

                    const checklistButton = (
                      <button
                        onClick={() => {
                          setSelectedChecklistRecord(record)
                          const initialChecklist = localChecklists[record.id] || record.checklist || []
                          // Ensure all default items are present
                          const baseChecklist = defaultChecklistItems.map(label => {
                            const existing = initialChecklist.find((i: ChecklistItem) => i.label === label)
                            return existing || { label, status: 'not-tested' as const }
                          })
                          // Add any custom items that were previously saved
                          const customItems = initialChecklist.filter((i: ChecklistItem) => !defaultChecklistItems.includes(i.label))
                          setTempChecklist([...baseChecklist, ...customItems])
                        }}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/80 px-2 py-0.5 rounded transition-colors uppercase tracking-tight flex items-center gap-1 w-fit mt-1"
                      >
                        Checklist
                      </button>
                    );

                    if (proofs.length === 0) {
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-400">No Proof</span>
                          {checklistButton}
                        </div>
                      )
                    }

                    return (
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {proofs.map((proof, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setActiveProofList(proofs)
                                setActiveProofIndex(index)
                              }}
                              className="w-4 h-4 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-[9px] font-bold hover:bg-[#dc3545] hover:text-white transition-all shadow-sm"
                              title={proof.comment || `Proof ${index + 1}`}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>
                        {checklistButton}
                      </div>
                    )
                  })()}
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedSummaryRecord(record)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="Summary"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
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

      {/* Checklist Modal */}
      {selectedChecklistRecord !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={closeChecklist}
            >
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Maintenance Checklist
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                      {selectedChecklistRecord.maintenance_number} &bull; {selectedChecklistRecord.server_name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedChecklistRecord(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                  {tempChecklist?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors group relative">
                      <div className="flex flex-col flex-1 pr-2">
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1 min-w-[120px] justify-center">
                          {(['pass', 'fail', 'not-tested'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(item.label, s)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-tighter transition-all flex-1 min-w-[32px] ${item.status === s
                                ? s === 'pass'
                                  ? 'bg-green-500 text-white shadow-sm'
                                  : s === 'fail'
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : 'bg-slate-500 text-white shadow-sm'
                                : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              {s === 'not-tested' ? 'N/A' : s}
                            </button>
                          ))}
                        </div>
                        <div className="w-8 flex justify-center">
                          {!defaultChecklistItems.includes(item.label) ? (
                            <button
                              onClick={() => handleDeleteChecklistItem(item.label)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          ) : (
                            <div className="w-8 h-8" /> // Invisible placeholder
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!tempChecklist || tempChecklist.length === 0) && (
                    <p className="text-center text-slate-400 text-sm py-4">No checklist items.</p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Add Custom Item</h4>
                  <form onSubmit={handleAddCustomItem} className="flex gap-2">
                    <input
                      type="text"
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      placeholder="e.g. Server patched successfully"
                      className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newItemLabel.trim()}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-[#dc3545] text-white text-sm font-bold rounded-xl hover:bg-[#bb2d3b] transition-colors shadow-md shadow-red-100"
                  onClick={handleSaveChecklist}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Proof Viewer Modal */}
      {activeProofIndex !== -1 && activeProofList[activeProofIndex] && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/95 backdrop-blur-md transition-opacity"
            onClick={() => setActiveProofIndex(-1)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-[#dc3545] bg-[#dc3545]/5 px-2 py-0.5 rounded tracking-[0.2em] uppercase">Proof {activeProofIndex + 1}/{activeProofList.length}</span>
                </div>
                {activeProofList[activeProofIndex].comment ? (
                  <p className="text-lg font-bold text-slate-900 leading-tight">{activeProofList[activeProofIndex].comment}</p>
                ) : (
                  <p className="text-lg font-bold text-slate-400 italic">No description</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activeProofList[activeProofIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-slate-400 hover:text-[#dc3545] hover:bg-slate-50 rounded-2xl transition-all group"
                  title="Open full resolution"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => setActiveProofIndex(-1)}
                  className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all group"
                >
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-4 min-h-[400px] group/stage">
              {/* Previous Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setActiveProofIndex(prev => Math.max(0, prev - 1)); }}
                disabled={activeProofIndex === 0}
                className={`absolute left-4 z-20 p-4 rounded-full bg-white/90 shadow-xl border border-slate-200 text-slate-400 hover:text-[#dc3545] hover:scale-110 active:scale-95 transition-all disabled:opacity-0 disabled:pointer-events-none md:flex hidden`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setActiveProofIndex(prev => Math.min(activeProofList.length - 1, prev + 1)); }}
                disabled={activeProofIndex === activeProofList.length - 1}
                className={`absolute right-4 z-20 p-4 rounded-full bg-white/90 shadow-xl border border-slate-200 text-slate-400 hover:text-[#dc3545] hover:scale-110 active:scale-95 transition-all disabled:opacity-0 disabled:pointer-events-none md:flex hidden`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={activeProofList[activeProofIndex].url}
                  alt={activeProofList[activeProofIndex].comment || "Proof"}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                />
              </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
              <button
                onClick={() => setActiveProofIndex(prev => Math.max(0, prev - 1))}
                disabled={activeProofIndex === 0}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#dc3545] disabled:text-slate-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <button
                onClick={() => setActiveProofIndex(prev => Math.min(activeProofList.length - 1, prev + 1))}
                disabled={activeProofIndex === activeProofList.length - 1}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#dc3545] disabled:text-slate-300"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remark Modal */}
      {selectedRemark !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedRemark(null)}
            >
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
              <div className="bg-white px-6 pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Maintenance Remark
                  </h3>
                  <button
                    onClick={() => setSelectedRemark(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap break-words">
                    {selectedRemark || 'No remark added.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {selectedSummaryRecord && (
        <MaintenanceSummaryView
          record={selectedSummaryRecord}
          onClose={() => setSelectedSummaryRecord(null)}
        />
      )}
    </div>
  )
}
