export interface MasterlistRecord {
    id: string
    sip_id: string | null
    company_name: string
    provider: string | null
    custom_features: string | null
    ip_address: string | null
    server_url: string | null
    subscription_plan: string | null
    office_close: string | null
    trunks_lines: number
    extensions: number
    category: string | null
    endpoint_class_1: string | null
    endpoint_class_2: string | null
    remarks: string | null
    created_at: string
    updated_at: string
}

export interface MasterlistInput {
    sip_id?: string
    company_name: string
    provider?: string
    custom_features?: string
    ip_address?: string
    server_url?: string
    subscription_plan?: string
    office_close?: string
    trunks_lines?: number
    extensions?: number
    category?: string
    endpoint_class_1?: string
    endpoint_class_2?: string
    remarks?: string
}
