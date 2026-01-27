export type ServerName = string
export type ClientName = string
export type MaintenanceReason = 'Portal Upgrade' | 'DB Migration' | 'OS Patching' | 'Key Rotation' | 'Asterisk Upgrade' | 'WAF Implementation' | 'SSL Renewal' | 'Other Reasons'
export type Approver = 'john'
export type PerformedBy = 'aiman' | 'hafiz' | 'shahid' | 'sayem' | 'naveed' | 'mostafijur' | 'maaruf'
export type Status = 'pending' | 'on-hold' | 'failed' | 'completed'
export type ChecklistStatus = 'pass' | 'fail' | 'not-tested'

export interface ProofOfMaintenance {
  url: string
  comment?: string
}

export interface ChecklistItem {
  label: string
  status: ChecklistStatus
}

export interface MaintenanceRecord {
  id: string
  maintenance_number: string
  submit_date: string
  server_name: ServerName
  client_name: ClientName
  maintenance_date: string
  start_time: string
  end_time: string
  maintenance_reason: MaintenanceReason
  approver: Approver
  performed_by: string
  status: Status
  proof_of_maintenance: (string | ProofOfMaintenance)[] | null
  remark: string | null
  checklist?: ChecklistItem[] | null
  created_at: string
  updated_at: string
}

export interface MaintenanceRecordInput {
  server_name: ServerName
  client_name: ClientName
  maintenance_date: string
  start_time: string
  end_time: string
  maintenance_reason: MaintenanceReason
  approver: Approver
  performed_by: string
  status: Status
  proof_of_maintenance?: (string | ProofOfMaintenance)[]
  remark?: string
  checklist?: ChecklistItem[]
}
