'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatDateTime, getAssetStatusLabel } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface Asset {
  id: string
  assetId: string
  name: string
  category: string
  brand: string
  model: string
  serialNumber: string | null
  specifications: string | null
  condition: string | null
  status: string
  purchaseDate: string | null
  purchasePrice: number | null
  warrantyExpiry: string | null
  location: string | null
  remarks: string | null
  assignedTo: { id: string; firstName: string; lastName: string; email: string; department: string; employeeId: string | null; jobTitle: string | null } | null
  assignedBy: { firstName: string; lastName: string } | null
  assignedAt: string | null
  expectedReturnDate: string | null
  accessories: Array<{ id: string; assetId: string; name: string; accessoryId: string; status: string; assignedTo: { firstName: string; lastName: string } | null }>
  auditLogs: Array<{ id: string; action: string; description: string; createdAt: string; actor: { firstName: string; lastName: string; email: string } }>
  acknowledgements: Array<{ id: string; type: string; statement: string; agreed: boolean; agreedAt: string | null; signedStatement: string | null; user: { firstName: string; lastName: string } }>
}

export default function AssetDetailPage() {
  const params = useParams()
  const [asset, setAsset] = React.useState<Asset | null>(null)
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => {
    fetch(`/api/assets/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setAsset(data.asset)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])
  
  if (loading) return <DashboardLayout><div className="p-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /><Skeleton className="h-32" /></div></DashboardLayout>
  if (!asset) return <DashboardLayout><div className="p-8 text-center">Asset not found</div></DashboardLayout>
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{asset.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{asset.assetId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={asset.status === 'ASSIGNED' ? 'info' : asset.status === 'AVAILABLE' ? 'success' : 'warning'}>
              {getAssetStatusLabel(asset.status)}
            </Badge>
            <Button variant="outline" asChild>
              <Link href={`/assets/${asset.id}/edit`}>Edit</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Category</label>
                  <p className="font-medium">{asset.category}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Brand</label>
                  <p className="font-medium">{asset.brand}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Model</label>
                  <p className="font-medium">{asset.model}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Serial Number</label>
                  <p className="font-medium font-mono">{asset.serialNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Condition</label>
                  <p className="font-medium">{asset.condition || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Location</label>
                  <p className="font-medium">{asset.location || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Purchase Date</label>
                  <p className="font-medium">{asset.purchaseDate ? formatDate(asset.purchaseDate) : '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</label>
                  <p className="font-medium">{asset.purchasePrice ? `₦${asset.purchasePrice.toLocaleString()}` : '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Warranty Expiry</label>
                  <p className="font-medium">{asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : '-'}</p>
                </div>
                {asset.specifications && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Specifications</label>
                    <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">{asset.specifications}</pre>
                  </div>
                )}
                {asset.remarks && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Remarks</label>
                    <p className="text-sm">{asset.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Assignment Info */}
            {asset.assignedTo && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Assignment</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Assigned To</label>
                    <p className="font-medium">{asset.assignedTo.firstName} {asset.assignedTo.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                    <p className="font-medium">{asset.assignedTo.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Department</label>
                    <p className="font-medium">{asset.assignedTo.department}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Employee ID</label>
                    <p className="font-medium">{asset.assignedTo.employeeId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Assigned By</label>
                    <p className="font-medium">{asset.assignedBy ? `${asset.assignedBy.firstName} ${asset.assignedBy.lastName}` : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Assigned Date</label>
                    <p className="font-medium">{asset.assignedAt ? formatDateTime(asset.assignedAt) : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Expected Return</label>
                    <p className="font-medium">{asset.expectedReturnDate ? formatDate(asset.expectedReturnDate) : '-'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Accessories */}
            {asset.accessories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Accessories ({asset.accessories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {asset.accessories.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{acc.accessoryId}</span>
                          <span>{acc.name}</span>
                        </div>
                        <Badge variant={acc.status === 'ASSIGNED' ? 'info' : 'success'}>{acc.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {asset.auditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.action} by {log.actor.firstName} {log.actor.lastName} • {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  ))}
                  {asset.auditLogs.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No audit logs</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Acknowledgements */}
            {asset.acknowledgements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Acknowledgements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {asset.acknowledgements.map((ack) => (
                      <div key={ack.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{ack.type.toLowerCase()}</span>
                          <Badge variant={ack.agreed ? 'success' : 'warning'}>
                            {ack.agreed ? 'Signed' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {ack.agreed ? `Signed by ${ack.user.firstName} ${ack.user.lastName} on ${ack.agreedAt ? formatDateTime(ack.agreedAt) : ''}` : 'Awaiting signature'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}