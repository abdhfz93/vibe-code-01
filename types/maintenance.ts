export type ServerName = 'sip00' | 'sip01' | 'sip02' | 'sip03' | 'sip04' | 'sip05' | 'sip07' | 'sip08' | 'sip09' | 'sip10' | 'sip11' | 'sip15' | 'sip17' | 'sip19' | 'sip20' | 'sip21' | 'sip22' | 'sip26' | 'sip27' | 'sip28' | 'sip29' | 'sip30' | 'sip32' | 'sip33' | 'sip35' | 'sip37' | 'sip45' | 'sip46' | 'sip50' | 'sip52' | 'sip54' | 'sip55' | 'sip56' | 'sip58' | 'sip59' | 'sip60' | 'sip61' | 'sip64' | 'sip65' | 'sip66' | 'sip67' | 'sip70' | 'sip103' | 'sip104' | 'sip205' | 'sip206' | 'sip207' | 'sip208' | 'sip209' | 'sip210' | 'sip212' | 'sip213' | 'sip214' | 'sip215' | 'sip216' | 'All Servers' | 'Other Server' | 'Multiple Servers'
export type ClientName = 'Asmara' | 'At Sunrise' | 'Best Home' | 'Busy Bees SG' | 'CBRE' | 'Certis' | 'Challenger' | 'Chan Brothers' | 'City State' | 'DHL Malaysia' | 'Dr Anywhere' | 'Envac' | 'Eversafe' | 'Getgo' | 'hisense' | 'HSC Cancer' | 'Interwell' | 'iSetan' | 'KFCPH' | 'LHN Parking' | 'Nippon Paint' | 'NTUC Fairprice' | 'Nuffield Dental' | 'Origin' | 'Other Client' | 'pegasus' | 'PLE' | 'PMG Asia' | 'Scania' | 'Skool4Kidz' | 'SMG Group/LSI' | 'SMG IP' | 'SMRT' | 'Sysmex Malaysia' | 'Touch Community' | 'Vertex' | 'Vistek' | 'Webull' | 'Wong Fong' | 'Woosa'
export type MaintenanceReason = 'Portal Upgrade' | 'DB Migration' | 'OS Patching' | 'Key Rotation' | 'Asterisk Upgrade' | 'WAF Implementation' | 'SSL Renewal' | 'Other Reasons'
export type Approver = 'john' | 'sayem' | 'naveed'
export type PerformedBy = 'aiman' | 'hafiz' | 'shahid'
export type Status = 'pending' | 'on-hold' | 'failed' | 'completed'
export type ChecklistStatus = 'pass' | 'fail' | 'not-tested'

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
  proof_of_maintenance: string[] | null
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
  proof_of_maintenance?: string[]
  remark?: string
  checklist?: ChecklistItem[]
}
