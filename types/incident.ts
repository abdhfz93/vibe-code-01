export interface IncidentReport {
    id: number;
    incident_number: string;
    title: string;
    content: string;
    sip_id: string;
    client_name: string;
    incident_date: string;
    created_at: string;
}

export interface IncidentInput {
    sip_id: string;
    client_name: string;
    incident_date: string;
    context: string;
}
