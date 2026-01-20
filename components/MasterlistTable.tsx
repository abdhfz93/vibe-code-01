'use client'

import { MasterlistRecord } from '@/types/masterlist'

interface MasterlistTableProps {
    records: MasterlistRecord[]
    onEdit: (record: MasterlistRecord) => void
    onDelete: (id: string) => void
}

export default function MasterlistTable({ records, onEdit, onDelete }: MasterlistTableProps) {
    const getCategoryColor = (category: string | null) => {
        if (!category) return 'bg-gray-100 text-gray-800'
        const cat = category.toLowerCase()
        if (cat.includes('high')) return 'bg-red-100 text-red-800'
        if (cat.includes('grow')) return 'bg-blue-100 text-blue-800'
        if (cat.includes('medium')) return 'bg-yellow-100 text-yellow-800'
        return 'bg-gray-100 text-gray-800'
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
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            SIP / Company
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Connectivity
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Plan / Provider
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Specs
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Endpoints
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Category
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {records.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-4">
                                <div className="text-xs font-bold text-[#dc3545]"># {record.sip_id || '-'}</div>
                                <div className="text-sm font-bold text-gray-900 line-clamp-1">{record.company_name}</div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="text-xs text-blue-600 font-semibold truncate max-w-[150px]" title={record.server_url || ''}>
                                    {record.server_url || '-'}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">{record.ip_address || '-'}</div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="text-xs font-semibold text-gray-800">{record.subscription_plan || '-'}</div>
                                <div className="text-[10px] text-gray-500 uppercase">{record.provider || '-'}</div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex gap-2">
                                    <div className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        <span className="text-gray-400">T/L:</span> <span className="font-bold text-gray-700">{record.trunks_lines}</span>
                                    </div>
                                    <div className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        <span className="text-gray-400">EXT:</span> <span className="font-bold text-gray-700">{record.extensions}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="text-[10px] text-gray-600 truncate max-w-[120px]">{record.endpoint_class_1 || '-'}</div>
                                <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{record.endpoint_class_2 || '-'}</div>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getCategoryColor(record.category)}`}>
                                    {record.category || 'Standard'}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(record)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Edit Customer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(record.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
        </div>
    )
}
