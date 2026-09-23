'use client'

import * as React from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, Column } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getApprovalStatusLabel } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { TableSkeleton } from '@/components/ui/skeleton'

interface Approval {
  id: string
  type: string
  status: string
  priority: number
  reason: string | null
  comments: string | null
  requestedAt: string
  decidedAt: string | null
  requester: { firstName: string; lastName: string; email: string; department: string }
  asset: { id: string; assetId: string; name: string; category: string } | null
  currentApprover: { firstName: string; lastName: string; email: string } | null
  _action?: 'approve' | 'reject'
}

function ApprovalsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [approvals, setApprovals] = React.useState<Approval[]>([])
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(() => parseInt(searchParams.get('page') || '1'))
  const [pageSize, setPageSize] = React.useState(() => parseInt(searchParams.get('pageSize') || '25'))
  const [filters, setFilters] = React.useState({
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    page: 1,
  })
  const updateURL = React.useCallback((next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(next).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k) })
    router.replace(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])
  React.useEffect(() => {
    const s = searchParams.get('status') || ''
    const t = searchParams.get('type') || ''
    const p = parseInt(searchParams.get('page') || '1')
    setFilters((prev) => (prev.status === s && prev.type === t ? prev : { status: s, type: t, page: 1 }))
    if (p !== page) setPage(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  const [selectedApproval, setSelectedApproval] = React.useState<Approval | null>(null)
  const [actionLoading, setActionLoading] = React.useState(false)
  
  const fetchApprovals = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      })
      const res = await fetch(`/api/approvals?${params}`)
      const data = await res.json()
      setApprovals(data.approvals || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch approvals:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.status, filters.type])
  
  React.useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])
  
  const handleAction = async (approvalId: string, action: 'approve' | 'reject', comments?: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comments }),
      })
      if (res.ok) {
        fetchApprovals()
        setSelectedApproval(null)
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setActionLoading(false)
    }
  }
  
  const columns: Column<Approval>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (row) => <Badge variant="info">{row.type.replace('_', ' ')}</Badge>,
    },
    {
      key: 'asset',
      header: 'Asset',
      render: (row) => row.asset ? (
        <div>
          <p className="font-medium">{row.asset.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.asset.assetId}</p>
        </div>
      ) : '-',
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (row) => (
        <div>
          <p className="font-medium">{row.requester.firstName} {row.requester.lastName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.requester.department}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          PENDING: 'warning',
          APPROVED: 'success',
          REJECTED: 'danger',
          ESCALATED: 'info',
        }
        return <Badge variant={variants[row.status] || 'gray'}>{getApprovalStatusLabel(row.status)}</Badge>
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => {
        const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' }
        return <span>{labels[row.priority as keyof typeof labels] || row.priority}</span>
      },
    },
    {
      key: 'currentApprover',
      header: 'Current Approver',
      render: (row) => row.currentApprover ? `${row.currentApprover.firstName} ${row.currentApprover.lastName}` : '-',
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      render: (row) => formatDate(row.requestedAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'PENDING' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApproval(row)}
                className="text-green-600 hover:text-green-700"
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApproval({ ...row, _action: 'reject' })}
                className="text-red-600 hover:text-red-700"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approvals</h1>
          <p className="text-gray-500 dark:text-gray-400">Review and manage approval requests</p>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                  { value: 'ESCALATED', label: 'Escalated' },
                ]}
                value={filters.status}
                onChange={(e) => { setFilters((p) => ({ ...p, status: e.target.value })); updateURL({ status: e.target.value, page: '1' }); setPage(1) }}
              />
              <Select
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'ASSET_REQUEST', label: 'Asset Request' },
                  { value: 'ASSET_RETURN', label: 'Asset Return' },
                  { value: 'ASSET_TRANSFER', label: 'Asset Transfer' },
                  { value: 'ACCESSORY_REQUEST', label: 'Accessory Request' },
                ]}
                value={filters.type}
                onChange={(e) => { setFilters((p) => ({ ...p, type: e.target.value })); updateURL({ type: e.target.value, page: '1' }); setPage(1) }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Approvals Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <DataTable
                columns={columns}
                data={approvals}
                keyAccessor={(row) => row.id}
                emptyMessage="No approval requests found"
                pagination={{
                  page,
                  pageSize,
                  total,
                  onPageChange: (p) => { setPage(p); updateURL({ page: String(p) }) },
                }}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Action Modal */}
        {selectedApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Confirm Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Are you sure you want to <strong>{selectedApproval._action === 'reject' ? 'reject' : 'approve'}</strong> this{" "}
                  {selectedApproval.type.replace('_', ' ').toLowerCase()} for{" "}
                  {selectedApproval.asset?.name || 'asset'}?
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1">Comments (required for rejection)</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter comments..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedApproval(null)}>Cancel</Button>
                  <Button
                    variant={selectedApproval._action === 'reject' ? 'destructive' : 'primary'}
                    onClick={() => handleAction(selectedApproval.id, selectedApproval._action === 'reject' ? 'reject' : 'approve')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : selectedApproval._action === 'reject' ? 'Reject' : 'Approve'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function ApprovalsPage() {
  return (
    <React.Suspense fallback={<DashboardLayout><div className="p-8"><TableSkeleton rows={5} cols={6} /></div></DashboardLayout>}>
      <ApprovalsPageContent />
    </React.Suspense>
  )
}