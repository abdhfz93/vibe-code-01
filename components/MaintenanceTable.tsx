'use client'

import { MaintenanceRecord } from '@/types/maintenance'

interface MaintenanceTableProps {
  records: MaintenanceRecord[]
  onEdit: (record: MaintenanceRecord) => void
  onDelete: (id: string) => void
}

export default function MaintenanceTable({ records, onEdit, onDelete }: MaintenanceTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'on-hold':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No maintenance records found.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <table className="w-full divide-y divide-gray-200 table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MNT #
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submit
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Server
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Maint. Date
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Approver
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performed By
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proof
            </th>
            <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                {record.maintenance_number}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {formatDate(record.submit_date)}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {record.server_name}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 capitalize">
                {record.client_name}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                {formatDate(record.maintenance_date)}
              </td>
              <td className="px-2 py-2 text-xs text-gray-500 max-w-[100px] truncate" title={record.maintenance_reason}>
                {record.maintenance_reason}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 capitalize">
                {record.approver}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 capitalize">
                {record.perform_by}
              </td>
              <td className="px-2 py-2 whitespace-nowrap">
                <span
                  className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(
                    record.status
                  )}`}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                </span>
              </td>
              <td className="px-2 py-2 text-xs">
                {(() => {
                  // Handle both array and potential string format from Supabase
                  let proofs: string[] = []
                  if (Array.isArray(record.proof_of_maintenance)) {
                    proofs = record.proof_of_maintenance
                  } else if (typeof record.proof_of_maintenance === 'string' && record.proof_of_maintenance) {
                    try {
                      const parsed = JSON.parse(record.proof_of_maintenance)
                      proofs = Array.isArray(parsed) ? parsed : [record.proof_of_maintenance]
                    } catch {
                      proofs = [record.proof_of_maintenance]
                    }
                  }
                  
                  return proofs.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {proofs.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )
                })()}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                <button
                  onClick={() => onEdit(record)}
                  className="text-blue-600 hover:text-blue-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
