export interface IncidentReport {
    id: number;
    incident_number: string;
    title: string;
    content: string;
    sip_id: string;
    client_name: string;
    incident_date: string;
    follow_up?: { label: string; status: 'pass' | 'fail' | 'not-tested'; link?: string }[] | null;
    created_at: string;
    updated_at?: string;
}

export interface IncidentInput {
    sip_id: string;
    client_name: string;
    incident_date: string;
    context: string;
}
