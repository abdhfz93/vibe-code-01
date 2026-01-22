'use client'

import { useState, useEffect } from 'react'
import { MasterlistRecord } from '@/types/masterlist'

interface MasterlistViewProps {
    record: MasterlistRecord
    onClose: () => void
}

export default function MasterlistView({ record, onClose }: MasterlistViewProps) {
    const [copied, setCopied] = useState(false)

    const dataItems = [
        { label: 'SIP # (Server ID)', value: record.sip_id || 'N/A' },
        { label: 'Client Name', value: record.company_name },
        { label: 'Provider', value: record.provider || 'N/A' },
        { label: 'Category', value: record.category || 'N/A' },
        { label: 'Server URL (CNAME)', value: record.server_url || 'N/A' },
        { label: 'IP Address', value: record.ip_address || 'N/A' },
        { label: 'Subscription Plan', value: record.subscription_plan || 'N/A' },
        { label: 'Endpoint Classification', value: record.endpoint_classification || 'N/A' },
        { label: 'Trunks / Lines', value: record.trunks_lines.toString() },
        { label: 'Extensions', value: record.extensions.toString() },
        { label: 'Office Hours', value: record.office_hours || 'N/A' },
        { label: 'Client PIC', value: record.client_contact || 'N/A' },
        { label: 'Client Contact No.', value: record.client_address || 'N/A' },
        { label: 'Custom Features', value: record.custom_features || 'N/A' },
        { label: 'Remarks', value: record.remarks || 'None' },
    ]

    const copyAll = () => {
        const text = dataItems.map(item => `${item.label}: ${item.value}`).join('\n')
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    const copySingle = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-150">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Customer Details</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyAll}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${copied
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-800 text-white hover:bg-slate-700'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                    COPIED!
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    COPY ALL DATA
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-white overflow-y-auto max-h-[70vh]">
                    <div className="space-y-1 font-mono text-sm">
                        {dataItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex group hover:bg-slate-50 p-1.5 rounded-lg transition-colors border-b border-transparent hover:border-slate-100"
                            >
                                <div className="w-1/3 text-slate-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                    {item.label}:
                                </div>
                                <div className="flex-1 text-slate-900 font-semibold break-all flex justify-between items-start gap-4">
                                    <span>{item.value}</span>
                                    <button
                                        onClick={() => copySingle(item.value)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-all shrink-0"
                                        title="Copy value"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
