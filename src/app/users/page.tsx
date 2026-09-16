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
import { formatDate, getRoleLabel, getDepartmentLabel } from '@/lib/utils'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  employeeId: string | null
  jobTitle: string | null
  department: string
  role: string
  campus: string | null
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  _count: { assignedAssets: number }
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(25)
  const [filters, setFilters] = React.useState({
    department: '',
    role: '',
    search: '',
    page: 1,
  })
  
  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.department && { department: filters.department }),
        ...(filters.role && { role: filters.role }),
        ...(filters.search && { search: filters.search }),
      })
      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.department, filters.role, filters.search])
  
  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium">{row.firstName} {row.lastName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (row) => row.employeeId || '-',
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <Badge variant="info">{getDepartmentLabel(row.department)}</Badge>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge variant="gray">{getRoleLabel(row.role)}</Badge>,
    },
    {
      key: 'campus',
      header: 'Campus',
      render: (row) => row.campus || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'assets',
      header: 'Assets',
      render: (row) => row._count.assignedAssets.toString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/users/${row.id}`}>View</Link>
        </Button>
      ),
    },
  ]
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage system users and their roles</p>
          </div>
          <Button asChild>
            <Link href="/users/new">Invite User</Link>
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="max-w-xs"
              />
              <Select
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'HR', label: 'Human Resources' },
                  { value: 'IT', label: 'Information Technology' },
                  { value: 'COMPLIANCE', label: 'Compliance' },
                  { value: 'FINANCE', label: 'Finance' },
                  { value: 'OPERATIONS', label: 'Operations' },
                  { value: 'MARKETING', label: 'Marketing' },
                  { value: 'SALES', label: 'Sales' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
              />
              <Select
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'SUPERADMIN', label: 'Super Admin' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'HR_HEAD', label: 'HR Head' },
                  { value: 'HR_OFFICER', label: 'HR Officer' },
                  { value: 'IT_HEAD', label: 'IT Head' },
                  { value: 'IT_OFFICER', label: 'IT Officer' },
                  { value: 'COMPLIANCE_HEAD', label: 'Compliance Head' },
                  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
                  { value: 'EMPLOYEE', label: 'Employee' },
                ]}
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={users}
              keyAccessor={(row) => row.id}
              emptyMessage="No users found"
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