'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, Column } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  description: string
  createdAt: string
  actor: { firstName: string; lastName: string; email: string; department: string }
  beforeState: Record<string, unknown> | null
  afterState: Record<string, unknown> | null
}

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(50)
  const [filters, setFilters] = React.useState({
    entityType: '',
    action: '',
    actorId: '',
    page: 1,
  })
  
  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.action && { action: filters.action }),
        ...(filters.actorId && { actorId: filters.actorId }),
      })
      const res = await fetch(`/api/audit-logs?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.entityType, filters.action, filters.actorId])
  
  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])
  
  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (row) => <Badge variant="gray">{row.action}</Badge>,
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (row) => <span className="capitalize">{row.entityType.toLowerCase()}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="max-w-xs truncate block">{row.description}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (row) => (
        <div>
          <p className="font-medium">{row.actor.firstName} {row.actor.lastName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.actor.department}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (row) => formatDateTime(row.createdAt),
    },
  ]
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-500 dark:text-gray-400">System audit trail for compliance and tracking</p>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Select
                options={[
                  { value: '', label: 'All Entity Types' },
                  { value: 'Asset', label: 'Asset' },
                  { value: 'User', label: 'User' },
                  { value: 'Approval', label: 'Approval' },
                  { value: 'Acknowledgement', label: 'Acknowledgement' },
                  { value: 'AssetTransfer', label: 'Asset Transfer' },
                ]}
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value, page: 1 })}
              />
              <Select
                options={[
                  { value: '', label: 'All Actions' },
                  { value: 'CREATE', label: 'Create' },
                  { value: 'UPDATE', label: 'Update' },
                  { value: 'DELETE', label: 'Delete' },
                  { value: 'ASSIGN', label: 'Assign' },
                  { value: 'UNASSIGN', label: 'Unassign' },
                  { value: 'TRANSFER', label: 'Transfer' },
                  { value: 'RETURN', label: 'Return' },
                  { value: 'APPROVE', label: 'Approve' },
                  { value: 'REJECT', label: 'Reject' },
                  { value: 'ACKNOWLEDGE', label: 'Acknowledge' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'RETIRE', label: 'Retire' },
                ]}
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              />
              <Input
                placeholder="Actor ID..."
                value={filters.actorId}
                onChange={(e) => setFilters({ ...filters, actorId: e.target.value, page: 1 })}
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={logs}
              keyAccessor={(row) => row.id}
              emptyMessage="No audit logs found"
              pagination={{
                page,
                pageSize,
                total,
                onPageChange: setPage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}