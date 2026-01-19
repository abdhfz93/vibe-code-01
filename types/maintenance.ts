export type ServerName = 'sip00' | 'sip01' | 'sip02' | 'sip03' | 'sip04' | 'sip05' | 'sip07' | 'sip08' | 'sip09' | 'sip10' | 'sip11' | 'sip15' | 'sip17' | 'sip19' | 'sip20' | 'sip21' | 'sip22' | 'sip26' | 'sip27' | 'sip28' | 'sip29' | 'sip30' | 'sip32' | 'sip33' | 'sip35' | 'sip37' | 'sip45' | 'sip46' | 'sip50' | 'sip52' | 'sip54' | 'sip55' | 'sip56' | 'sip58' | 'sip59' | 'sip60' | 'sip61' | 'sip64' | 'sip65' | 'sip66' | 'sip67' | 'sip70' | 'sip103' | 'sip104' | 'sip205' | 'sip206' | 'sip207' | 'sip208' | 'sip209' | 'sip210' | 'sip212' | 'sip213' | 'sip214' | 'sip215' | 'sip216'
export type ClientName = 'certis' | 'getgo' | 'pegasus' | 'hisense'
export type MaintenanceReason = 'Reporting Portal Upgrade' | 'DB Migration' | 'OS Patching'
export type Approver = 'john' | 'sayem' | 'naveed'
export type PerformBy = 'hafiz' | 'shahid' | 'aiman'
export type Status = 'pending' | 'on-hold' | 'failed' | 'completed'

export interface MaintenanceRecord {
  id: string
  maintenance_number: string
  submit_date: string
  server_name: ServerName
  client_name: ClientName
  maintenance_date: string
  maintenance_reason: MaintenanceReason
  approver: Approver
  perform_by: PerformBy
  status: Status
  proof_of_maintenance: string[] | null
  created_at: string
  updated_at: string
}

export interface MaintenanceRecordInput {
  server_name: ServerName
  client_name: ClientName
  maintenance_date: string
  maintenance_reason: MaintenanceReason
  approver: Approver
  perform_by: PerformBy
  status: Status
  proof_of_maintenance?: string[]
}
