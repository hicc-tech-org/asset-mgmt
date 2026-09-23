'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, Column } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { getAssetStatusLabel } from '@/lib/utils'
import { TableSkeleton, Skeleton } from '@/components/ui/skeleton'

interface Asset {
  id: string
  assetId: string
  name: string
  category: string
  brand: string
  model: string
  serialNumber: string | null
  status: string
  condition: string | null
  assignedTo: { firstName: string; lastName: string; email: string } | null
  assignedAt: string | null
  accessories: Array<{ id: string; name: string; accessoryId: string; status: string }>
}

export default function AssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(25)
  const [filters, setFilters] = React.useState({
    status: '',
    category: '',
    search: '',
    page: 1,
  })
  
  const fetchAssets = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      })
      const res = await fetch(`/api/assets?${params}`)
      const data = await res.json()
      setAssets(data.assets || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.status, filters.category, filters.search])
  
  React.useEffect(() => {
    fetchAssets()
  }, [fetchAssets])
  
  const columns: Column<Asset>[] = [
    { key: 'assetId', header: 'Asset ID' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'brand', header: 'Brand' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'ASSIGNED' ? 'info' : row.status === 'AVAILABLE' ? 'success' : 'warning'}>{getAssetStatusLabel(row.status)}</Badge>,
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (row) => row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/assets/${row.id}`}>View</Link>
          </Button>
          {row.status === 'AVAILABLE' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/assets/${row.id}/assign`}>Assign</Link>
            </Button>
          )}
          {row.status === 'ASSIGNED' && row.assignedTo && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/assets/${row.id}/return`}>Return</Link>
            </Button>
          )}
        </div>
      ),
    },
  ]
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assets</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage and track all assets</p>
          </div>
          <Button asChild>
            <Link href="/assets/new">Add Asset</Link>
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="max-w-xs"
              />
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'ASSIGNED', label: 'Assigned' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'RETIRED', label: 'Retired' },
                  { value: 'DAMAGED', label: 'Damaged' },
                  { value: 'LOST', label: 'Lost' },
                ]}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              />
              <Select
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'LAPTOP', label: 'Laptop' },
                  { value: 'PHONE', label: 'Phone' },
                  { value: 'TABLET', label: 'Tablet' },
                  { value: 'MONITOR', label: 'Monitor' },
                  { value: 'CHARGER', label: 'Charger' },
                  { value: 'KEYBOARD', label: 'Keyboard' },
                  { value: 'MOUSE', label: 'Mouse' },
                  { value: 'HEADSET', label: 'Headset' },
                  { value: 'CARRYING_CASE', label: 'Carrying Case' },
                  { value: 'DOCKING_STATION', label: 'Docking Station' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Assets Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              <DataTable
                columns={columns}
                data={assets}
                keyAccessor={(row) => row.id}
                emptyMessage="No assets found — seed data may be loading or filters exclude results"
                pagination={{
                  page,
                  pageSize,
                  total,
                  onPageChange: setPage,
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}