'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MasterlistRecord, MasterlistInput } from '@/types/masterlist'

interface MasterlistFormProps {
    record: MasterlistRecord | null
    onSuccess: () => void
    onCancel: () => void
}

export default function MasterlistForm({ record, onSuccess, onCancel }: MasterlistFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<MasterlistInput>({
        sip_id: '',
        company_name: '',
        provider: '',
        custom_features: '',
        ip_address: '',
        server_url: '',
        subscription_plan: '',
        office_close: '',
        trunks_lines: 0,
        extensions: 0,
        category: '',
        endpoint_class_1: '',
        endpoint_class_2: '',
        remarks: ''
    })

    useEffect(() => {
        if (record) {
            setFormData({
                sip_id: record.sip_id || '',
                company_name: record.company_name,
                provider: record.provider || '',
                custom_features: record.custom_features || '',
                ip_address: record.ip_address || '',
                server_url: record.server_url || '',
                subscription_plan: record.subscription_plan || '',
                office_close: record.office_close || '',
                trunks_lines: record.trunks_lines,
                extensions: record.extensions,
                category: record.category || '',
                endpoint_class_1: record.endpoint_class_1 || '',
                endpoint_class_2: record.endpoint_class_2 || '',
                remarks: record.remarks || ''
            })
        }
    }, [record])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (record) {
                const { error } = await supabase
                    .from('customer_masterlist')
                    .update(formData)
                    .eq('id', record.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('customer_masterlist')
                    .insert([formData])
                if (error) throw error
            }
            onSuccess()
        } catch (error) {
            console.error('Error saving masterlist record:', error)
            alert('Failed to save customer record')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {record ? 'Edit Masterlist Entry' : 'Add New Customer to Masterlist'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Nautilus Customer Database</p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">SIP ID</label>
                    <input
                        type="text"
                        name="sip_id"
                        value={formData.sip_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                        placeholder="e.g. 3"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Company Name *</label>
                    <input
                        type="text"
                        name="company_name"
                        required
                        value={formData.company_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm font-bold"
                        placeholder="Name as per Registrar"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Server URL</label>
                    <input
                        type="text"
                        name="server_url"
                        value={formData.server_url}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm text-blue-600 font-semibold"
                        placeholder="[name].nautilus.zone"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">IP Address</label>
                    <input
                        type="text"
                        name="ip_address"
                        value={formData.ip_address}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm font-mono"
                        placeholder="0.0.0.0"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Provider</label>
                    <input
                        type="text"
                        name="provider"
                        value={formData.provider}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                        placeholder="Singtel / MyRepublic"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Subscription Plan</label>
                    <input
                        type="text"
                        name="subscription_plan"
                        value={formData.subscription_plan}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                        placeholder="XCally / IP Phone"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Categorize</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                    >
                        <option value="">Select Profile</option>
                        <option value="High Profile">High Profile</option>
                        <option value="Grow Profile">Grow Profile</option>
                        <option value="Medium Profile">Medium Profile</option>
                        <option value="Standard">Standard</option>
                    </select>
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Office Close</label>
                    <input
                        type="text"
                        name="office_close"
                        value={formData.office_close}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                        placeholder="e.g. 22:00"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Trunks/Lines</label>
                    <input
                        type="number"
                        name="trunks_lines"
                        value={formData.trunks_lines}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Extensions</label>
                    <input
                        type="number"
                        name="extensions"
                        value={formData.extensions}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Endpoint Class 1</label>
                    <input
                        type="text"
                        name="endpoint_class_1"
                        value={formData.endpoint_class_1}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                        placeholder="Webphone / Zoiper"
                    />
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Custom / Features</label>
                    <input
                        type="text"
                        name="custom_features"
                        value={formData.custom_features}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm"
                        placeholder="Any special configurations..."
                    />
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-tight">Remarks</label>
                    <textarea
                        name="remarks"
                        rows={3}
                        value={formData.remarks}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#dc3545] focus:bg-white outline-none transition-all text-sm resize-none"
                        placeholder="Internal notes..."
                    />
                </div>
            </div>

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 bg-gradient-to-r from-[#dc3545] to-[#a71d2a] text-white rounded-xl font-bold shadow-lg shadow-[#dc3545]/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm"
                >
                    {loading ? 'Saving to Cloud...' : record ? 'Update Masterlist' : 'Add to Masterlist'}
                </button>
            </div>
        </form>
    )
}
