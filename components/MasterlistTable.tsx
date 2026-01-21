'use client'

import { MasterlistRecord } from '@/types/masterlist'

interface MasterlistTableProps {
    records: MasterlistRecord[]
    onEdit: (record: MasterlistRecord) => void
    onDelete: (id: string) => void
}

export default function MasterlistTable({ records, onEdit, onDelete }: MasterlistTableProps) {
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
                            SIP # / Client Name
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Connectivity (URL/IP)
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Product & Specs
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Configuration & Features
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Contact & Address
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Category
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
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">#{record.sip_id || 'N/A'}</span>
                                    <span className="text-sm font-semibold text-slate-900">{record.company_name}</span>
                                    <span className="text-[11px] font-medium text-slate-500">{record.provider || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-blue-600 truncate max-w-[200px]" title={record.server_url || ''}>
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
                                    <span className="text-sm font-semibold text-slate-900">{record.subscription_plan || 'N/A'}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">T/L:</span>
                                            <span>{record.trunks_lines}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">EXT:</span>
                                            <span>{record.extensions}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 max-w-[250px]">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-medium text-slate-900 line-clamp-1" title={record.custom_features || ''}>
                                        {record.custom_features || 'N/A'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 italic truncate" title={record.endpoint_classification || ''}>
                                        {record.endpoint_classification || 'N/A'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-4 max-w-[200px]">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-bold text-slate-700">{record.client_contact || 'No Contact'}</span>
                                    <span className="text-[10px] text-slate-400 truncate tracking-tight">{record.client_address || 'No Address'}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Schedule: {record.office_hours || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full shadow-sm border uppercase tracking-wider ${getCategoryColor(record.category)}`}>
                                    {record.category || 'Standard'}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
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
        </div>
    )
}
