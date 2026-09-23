'use client'
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default function AssignAssetPage() {
  const params = useParams()
  const router = useRouter()
  const [asset, setAsset] = React.useState<{ id: string; assetId: string; name: string; status: string } | null>(null)
  const [users, setUsers] = React.useState<Array<{ id: string; firstName: string; lastName: string; email: string }>>([])
  const [assigneeId, setAssigneeId] = React.useState('')
  const [expectedReturnDate, setExpectedReturnDate] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/assets/${params.id}`).then((r) => r.json()),
      fetch('/api/users?page=1&pageSize=100').then((r) => r.json()).catch(() => ({ users: [] })),
    ])
      .then(([aData, uData]) => {
        if (aData.asset) setAsset(aData.asset)
        if (uData.users) setUsers(uData.users)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigneeId) { setError('Select a user'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/assets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: params.id, assigneeId, expectedReturnDate: expectedReturnDate || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Assign failed')
      router.push(`/assets/${params.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assign failed')
    } finally { setSaving(false) }
  }

  if (loading) return <DashboardLayout><div className="max-w-xl mx-auto"><Skeleton className="h-64" /></div></DashboardLayout>
  if (!asset) return <DashboardLayout><div className="text-center p-8">Asset not found</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href={`/assets/${params.id}`}>← Back</Link></Button>
          <h1 className="text-2xl font-bold">Assign Asset</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>{asset.name} — {asset.assetId}</CardTitle></CardHeader>
          <CardContent>
            {asset.status === 'ASSIGNED' && <div className="p-3 bg-yellow-50 text-yellow-700 rounded text-sm mb-4">This asset is already assigned</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
              <Select label="Assign to *" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} options={users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.email})` }))} placeholder="Select user" />
              <Input label="Expected Return Date" type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
              <p className="text-sm text-gray-500">An acknowledgement statement will be created for the assignee to sign.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild><Link href={`/assets/${params.id}`}>Cancel</Link></Button>
                <Button type="submit" disabled={saving}>{saving ? 'Assigning...' : 'Assign Asset'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
