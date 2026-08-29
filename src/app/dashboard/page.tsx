'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

export default function DashboardPage() {
  // Mock data - replace with real data fetching
  const stats = [
    { label: 'Total Assets', value: '247', change: '+12%', trend: 'up' },
    { label: 'Assigned', value: '189', change: '+5%', trend: 'up' },
    { label: 'Available', value: '45', change: '-8%', trend: 'down' },
    { label: 'Pending Approvals', value: '7', change: '+3', trend: 'up' },
  ]
  
  const recentAssets = [
    { id: '1', assetId: 'AST-001', name: 'EliteBook 840 G8', category: 'LAPTOP', status: 'ASSIGNED', assignedTo: 'Olubukola Koyenikan' },
    { id: '2', assetId: 'AST-002', name: 'HP 240 G10', category: 'LAPTOP', status: 'AVAILABLE', assignedTo: null },
    { id: '3', assetId: 'AST-003', name: 'Samsung Galaxy S21', category: 'PHONE', status: 'ASSIGNED', assignedTo: 'Timileyin Olaore' },
    { id: '4', assetId: 'AST-004', name: 'HP Charger', category: 'CHARGER', status: 'AVAILABLE', assignedTo: null },
  ]
  
  const pendingApprovals = [
    { id: '1', type: 'ASSET_REQUEST', assetName: 'EliteBook 840 G8', requester: 'John Doe', requestedAt: '2026-08-28' },
    { id: '2', type: 'ASSET_RETURN', assetName: 'HP 240 G10', requester: 'Jane Smith', requestedAt: '2026-08-27' },
  ]
  
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
        
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <Badge variant={stat.trend === 'up' ? 'success' : 'danger'}>
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Recent Assets & Pending Approvals */}
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
                {recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{asset.assetId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={asset.status === 'ASSIGNED' ? 'info' : 'success'}>{asset.status}</Badge>
                      {asset.assignedTo && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">{asset.assignedTo}</span>
                      )}
                    </div>
                  </div>
                ))}
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
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{approval.assetName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Requested by {approval.requester} • {approval.requestedAt}</p>
                    </div>
                    <Badge variant="warning">{approval.type.replace('_', ' ')}</Badge>
                  </div>
                ))}
                {pendingApprovals.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending approvals</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}