'use client'

import { useState } from 'react'
import { MasterlistRecord } from '@/types/masterlist'

interface MasterlistTableProps {
    records: MasterlistRecord[]
    onEdit: (record: MasterlistRecord) => void
    onView: (record: MasterlistRecord) => void
    onDelete: (id: string) => void
}

export default function MasterlistTable({ records, onEdit, onView, onDelete }: MasterlistTableProps) {
    const [selectedRemark, setSelectedRemark] = useState<string | null>(null)

    const getCategoryColor = (category: string | null) => {
        if (!category) return 'bg-slate-100 text-slate-800'
        const cat = category.toLowerCase()
        if (cat.includes('high')) return 'bg-red-100 text-red-800'
        if (cat.includes('grow')) return 'bg-blue-100 text-blue-800'
        if (cat.includes('medium')) return 'bg-amber-100 text-amber-800'
        return 'bg-slate-100 text-slate-800'
    }

    if (records.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">No customer records found in the masterlist.</p>
            </div>
        )
    }

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            SIP# / Client Name
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Connectivity (URL/IP)
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Subs Plan & Endpoint
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Trunk & Extension
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Features & Remarks
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Contact & Schedule
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {records.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{record.sip_id || 'N/A'}</span>
                                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${getCategoryColor(record.category)}`}>
                                            {record.category || 'Standard'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{record.company_name}</span>
                                    <span className="text-[11px] font-medium text-slate-500">{record.provider || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-blue-600 truncate max-w-[180px]" title={record.server_url || ''}>
                                        {record.server_url || 'N/A'}
                                    </span>
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">IP:</span>
                                        <span className="font-mono">{record.ip_address || 'N/A'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-slate-900">{record.subscription_plan || 'No Plan'}</span>
                                    <span className="text-[11px] font-medium text-slate-500 italic truncate max-w-[200px]" title={record.endpoint_classification || ''}>
                                        {record.endpoint_classification || 'No Endpoint'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center px-2 py-1 bg-slate-50 rounded-lg min-w-[50px]">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Trunks</span>
                                        <span className="text-sm font-bold text-slate-700">{record.trunks_lines}</span>
                                    </div>
                                    <div className="flex flex-col items-center px-2 py-1 bg-slate-50 rounded-lg min-w-[50px]">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Exts</span>
                                        <span className="text-sm font-bold text-slate-700">{record.extensions}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 max-w-[300px]">
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-sm text-slate-600 font-medium leading-tight" title={record.custom_features || ''}>
                                        {record.custom_features || <span className="text-slate-300 italic">No custom features</span>}
                                    </p>
                                    {record.remarks && (
                                        <button
                                            onClick={() => setSelectedRemark(record.remarks)}
                                            className="inline-flex text-[10px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/80 px-2 py-0.5 rounded transition-colors uppercase tracking-tight w-fit"
                                        >
                                            Note
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-4 max-w-[220px]">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-bold text-slate-700 truncate">{record.client_contact || 'No PIC'}</span>
                                    <span className="text-[10px] text-slate-400 truncate tracking-tight" title={record.client_address || ''}>
                                        {record.client_address || 'No Contact No.'}
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-[10px] text-slate-500 font-medium">{record.office_hours || 'N/A'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onView(record)}
                                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                        title="View Details"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onEdit(record)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Edit Customer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(record.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Customer"
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
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-slate-200 animate-in fade-in zoom-in duration-200">
                            {/* Header */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Internal Remarks</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedRemark(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 bg-white overflow-y-auto max-h-[60vh]">
                                <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                                    <p className="text-sm font-medium text-slate-600 whitespace-pre-wrap break-words leading-relaxed italic">
                                        {selectedRemark || 'No additional remarks.'}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
                                    onClick={() => setSelectedRemark(null)}
                                >
                                    Close Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
