'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MasterlistRecord, MasterlistInput } from '@/types/masterlist'

interface MasterlistFormProps {
    record: MasterlistRecord | null
    onSuccess: () => void
    onCancel: () => void
}

const PROVIDERS = ['MyRepublic', 'Singtel']
const SUBSCRIPTION_PLANS = [
    'IP Phone / Softphone',
    'MS Teams',
    'Nautilus Talk Basic',
    'Nautilus Talk CC',
    'Salesforce',
    'Webphone',
    'XCally'
]
const ENDPOINT_CLASSIFICATIONS = [
    'ATA (Gateway)',
    'Call Forwarding',
    'Door phone',
    'GS Wave (Mobile App)',
    'IP phone (Hardphone)',
    'Nautilus Connect (Mobile App)',
    'Nautilus Desk (Softphone)',
    'Nautilus Go (Mobile App)',
    'SIP Trunk',
    'UCM - Grandstream PBX',
    'Webphone',
    'Zoiper (Softphone)'
]
const CUSTOM_FEATURES_OPTIONS = [
    'Call Rating',
    'Call Tagging',
    'Call Transcription',
    'Chat',
    'CSAT IVR'
]

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
        office_hours: '',
        trunks_lines: 0,
        extensions: 0,
        category: '',
        endpoint_classification: '',
        remarks: '',
        client_contact: '',
        client_address: ''
    })

    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([])

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
                office_hours: record.office_hours || '',
                trunks_lines: record.trunks_lines,
                extensions: record.extensions,
                category: record.category || '',
                endpoint_classification: record.endpoint_classification || '',
                remarks: record.remarks || '',
                client_contact: record.client_contact || '',
                client_address: record.client_address || ''
            })
            if (record.custom_features) {
                setSelectedFeatures(record.custom_features.split(', ').filter(Boolean))
            }
            if (record.endpoint_classification) {
                setSelectedEndpoints(record.endpoint_classification.split(', ').filter(Boolean))
            }
        }
    }, [record])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }))
    }

    const toggleFeature = (feature: string) => {
        const updated = selectedFeatures.includes(feature)
            ? selectedFeatures.filter(f => f !== feature)
            : [...selectedFeatures, feature]
        setSelectedFeatures(updated)
        setFormData(prev => ({
            ...prev,
            custom_features: updated.join(', ')
        }))
    }

    const toggleEndpoint = (endpoint: string) => {
        const updated = selectedEndpoints.includes(endpoint)
            ? selectedEndpoints.filter(e => e !== endpoint)
            : [...selectedEndpoints, endpoint]
        setSelectedEndpoints(updated)
        setFormData(prev => ({
            ...prev,
            endpoint_classification: updated.join(', ')
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

    // Shared input className to match MaintenanceForm
    const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all text-sm"

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-inner">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {record ? 'Edit Masterlist Entry' : 'Add New Customer to Masterlist'}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-400"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Basic Info */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            SIP # (Server ID)
                        </label>
                        <input
                            type="text"
                            name="sip_id"
                            value={formData.sip_id}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="e.g. sip11"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="company_name"
                            required
                            value={formData.company_name}
                            onChange={handleChange}
                            className={inputClasses + " font-bold"}
                            placeholder="Name of Client"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categorize
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">Select Priority</option>
                            <option value="Grow Profile">Grow Profile</option>
                            <option value="High Profile">High Profile</option>
                            <option value="Medium Profile">Medium Profile</option>
                        </select>
                    </div>

                    {/* Technical Details */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            IP Address
                        </label>
                        <input
                            type="text"
                            name="ip_address"
                            value={formData.ip_address}
                            onChange={handleChange}
                            className={inputClasses + " font-mono"}
                            placeholder="8.8.8.8"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Server URL (CNAME)
                        </label>
                        <input
                            type="text"
                            name="server_url"
                            value={formData.server_url}
                            onChange={handleChange}
                            className={inputClasses + " text-blue-600 font-semibold"}
                            placeholder="certissg-corp.nautilus.com"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Provider
                        </label>
                        <select
                            name="provider"
                            value={formData.provider}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">Select Provider</option>
                            {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subscription Plan
                        </label>
                        <select
                            name="subscription_plan"
                            value={formData.subscription_plan}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="">Select Plan</option>
                            {SUBSCRIPTION_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Office Hours
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="time"
                                name="office_hours_start"
                                onChange={(e) => {
                                    const end = formData.office_hours?.split(' - ')[1] || '18:00'
                                    setFormData(prev => ({ ...prev, office_hours: `${e.target.value} - ${end}` }))
                                }}
                                value={formData.office_hours?.split(' - ')[0] || '09:00'}
                                className={inputClasses + " flex-1"}
                            />
                            <span className="text-gray-400 font-bold">to</span>
                            <input
                                type="time"
                                name="office_hours_end"
                                onChange={(e) => {
                                    const start = formData.office_hours?.split(' - ')[0] || '09:00'
                                    setFormData(prev => ({ ...prev, office_hours: `${start} - ${e.target.value}` }))
                                }}
                                value={formData.office_hours?.split(' - ')[1] || '18:00'}
                                className={inputClasses + " flex-1"}
                            />
                        </div>
                    </div>

                    {/* Capacity Info */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trunks / Lines
                        </label>
                        <input
                            type="number"
                            name="trunks_lines"
                            value={formData.trunks_lines}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Extensions
                        </label>
                        <input
                            type="number"
                            name="extensions"
                            value={formData.extensions}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client PIC
                        </label>
                        <input
                            type="text"
                            name="client_contact"
                            value={formData.client_contact}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Person in Charge"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Contact No.
                        </label>
                        <input
                            type="text"
                            name="client_address"
                            value={formData.client_address}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="e.g. +65 1234 5678"
                        />
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endpoint Classification (Multi-select)
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {ENDPOINT_CLASSIFICATIONS.map(endpoint => (
                                <button
                                    key={endpoint}
                                    type="button"
                                    onClick={() => toggleEndpoint(endpoint)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedEndpoints.includes(endpoint)
                                        ? 'bg-slate-700 text-white border-slate-700 shadow-md'
                                        : 'bg-white text-slate-500 border-gray-200 hover:border-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    {endpoint}
                                    {selectedEndpoints.includes(endpoint) && (
                                        <span className="ml-2 font-bold">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Features (Multi-select)
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {CUSTOM_FEATURES_OPTIONS.map(feature => (
                                <button
                                    key={feature}
                                    type="button"
                                    onClick={() => toggleFeature(feature)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedFeatures.includes(feature)
                                        ? 'bg-[#dc3545] text-white border-[#dc3545] shadow-md shadow-[#dc3545]/20'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#dc3545] hover:text-[#dc3545]'
                                        }`}
                                >
                                    {feature}
                                    {selectedFeatures.includes(feature) && (
                                        <span className="ml-2 font-bold">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            rows={4}
                            value={formData.remarks}
                            onChange={handleChange}
                            className={inputClasses + " resize-none h-32"}
                            placeholder="Internal notes and history..."
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-bg text-white px-8 py-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                    >
                        {loading ? 'Saving...' : record ? 'Update' : 'Create'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
