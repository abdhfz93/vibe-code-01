'use client'

import { ServerName, ClientName } from '@/types/maintenance'

interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  serverFilter: ServerName | 'all'
  onServerFilterChange: (server: ServerName | 'all') => void
  clientFilter: ClientName | 'all'
  onClientFilterChange: (client: ClientName | 'all') => void
}

const SERVER_OPTIONS: ServerName[] = [
  'All Servers', 'Multiple Servers', 'Other Server',
  'sip00', 'sip01', 'sip02', 'sip03', 'sip04', 'sip05', 'sip07', 'sip08', 'sip09',
  'sip10', 'sip11', 'sip15', 'sip17', 'sip19', 'sip20', 'sip21', 'sip22', 'sip26',
  'sip27', 'sip28', 'sip29', 'sip30', 'sip32', 'sip33', 'sip35', 'sip37', 'sip45',
  'sip46', 'sip50', 'sip52', 'sip54', 'sip55', 'sip56', 'sip58', 'sip59', 'sip60',
  'sip61', 'sip64', 'sip65', 'sip66', 'sip67', 'sip70', 'sip103', 'sip104',
  'sip205', 'sip206', 'sip207', 'sip208', 'sip209', 'sip210', 'sip212', 'sip213',
  'sip214', 'sip215', 'sip216'
]
const CLIENT_OPTIONS: ClientName[] = [
  'Asmara', 'At Sunrise', 'Best Home', 'Busy Bees SG', 'CBRE', 'Certis', 'Challenger',
  'Chan Brothers', 'City State', 'DHL Malaysia', 'Dr Anywhere', 'Envac', 'Eversafe',
  'Getgo', 'hisense', 'HSC Cancer', 'Interwell', 'iSetan', 'KFCPH', 'LHN Parking',
  'Nippon Paint', 'NTUC Fairprice', 'Nuffield Dental', 'Origin', 'Other Client',
  'pegasus', 'PLE', 'PMG Asia', 'Scania', 'Skool4Kidz', 'SMG Group/LSI', 'SMG IP',
  'SMRT', 'Sysmex Malaysia', 'Touch Community', 'Vertex', 'Vistek', 'Webull',
  'Wong Fong', 'Woosa'
]

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  serverFilter,
  onServerFilterChange,
  clientFilter,
  onClientFilterChange,
}: SearchAndFilterProps) {
  return (
    <div className="mb-6 flex gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          id="search"
          placeholder="Search by server, client, or reason..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all"
        />
      </div>
      <div className="min-w-[150px]">
        <label htmlFor="server-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Server
        </label>
        <select
          id="server-filter"
          value={serverFilter}
          onChange={(e) => onServerFilterChange(e.target.value as ServerName | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all"
        >
          <option value="all">All Servers</option>
          {SERVER_OPTIONS.map((server) => (
            <option key={server} value={server}>
              {server}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[150px]">
        <label htmlFor="client-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Client
        </label>
        <select
          id="client-filter"
          value={clientFilter}
          onChange={(e) => onClientFilterChange(e.target.value as ClientName | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all"
        >
          <option value="all">All Clients</option>
          {CLIENT_OPTIONS.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
