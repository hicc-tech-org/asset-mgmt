'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import { StatsSkeleton, Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

interface DashboardStats {
  totalAssets: number
  assigned: number
  available: number
  pendingApprovals: number
  maintenance: number
  retired: number
  totalUsers: number
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [recentAssets, setRecentAssets] = React.useState<Array<{ id: string; assetId: string; name: string; category: string; status: string; assignedTo: { firstName: string; lastName: string } | null }>>([])
  const [pendingApprovals, setPendingApprovals] = React.useState<Array<{ id: string; type: string; asset: { name: string } | null; requester: { firstName: string; lastName: string }; requestedAt: string }>>([])
  const [byCategory, setByCategory] = React.useState<Array<{ category: string; _count: number }>>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stats')
        return r.json()
      })
      .then((data) => {
        setStats(data.stats)
        setRecentAssets(data.recentAssets || [])
        setPendingApprovals(data.pendingApprovals || [])
        setByCategory(data.byCategory || [])
        setLoading(false)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard')
        setLoading(false)
      })
  }, [])

  const statCards = stats
    ? [
        { label: 'Total Assets', value: formatNumber(stats.totalAssets) },
        { label: 'Assigned', value: formatNumber(stats.assigned) },
        { label: 'Available', value: formatNumber(stats.available) },
        { label: 'Pending Approvals', value: formatNumber(stats.pendingApprovals) },
      ]
    : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Overview of your asset management system</p>
          </div>
          <Button asChild>
            <Link href="/assets/new">Add Asset</Link>
          </Button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 16h6M9 8h6M9 12h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            {/* Category breakdown */}
            {byCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {byCategory.map((c) => (
                      <span key={c.category} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
                        {c.category} <Badge variant="info">{c._count}</Badge>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Assets</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/assets">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAssets.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No assets yet</p>
                    ) : (
                      recentAssets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{asset.assetId} • {asset.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={asset.status === 'ASSIGNED' ? 'info' : asset.status === 'AVAILABLE' ? 'success' : 'warning'}>{asset.status}</Badge>
                            {asset.assignedTo && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                                {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Pending Approvals</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/approvals">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApprovals.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending approvals</p>
                    ) : (
                      pendingApprovals.map((approval) => (
                        <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{approval.asset?.name || approval.type}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Requested by {approval.requester.firstName} {approval.requester.lastName} • {formatDate(approval.requestedAt)}
                            </p>
                          </div>
                          <Badge variant="warning">{approval.type.replace('_', ' ')}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
