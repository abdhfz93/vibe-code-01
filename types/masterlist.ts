export interface MasterlistRecord {
    id: string
    sip_id: string | null
    company_name: string
    provider: string | null
    custom_features: string | null
    ip_address: string | null
    server_url: string | null
    subscription_plan: string | null
    office_hours: string | null
    trunks_lines: number
    extensions: number
    category: string | null
    endpoint_classification: string | null
    remarks: string | null
    client_contact: string | null
    client_address: string | null
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
    office_hours?: string
    trunks_lines?: number
    extensions?: number
    category?: string
    endpoint_classification?: string
    remarks?: string
    client_contact?: string
    client_address?: string
}
