'use client'

import { Status } from '@/types/maintenance'

interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: Status | 'all'
  onStatusFilterChange: (status: Status | 'all') => void
}

const STATUS_OPTIONS: Status[] = ['pending', 'on-hold', 'failed', 'completed']

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
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
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as Status | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#dc3545] focus:border-[#dc3545] outline-none transition-all capitalize"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
