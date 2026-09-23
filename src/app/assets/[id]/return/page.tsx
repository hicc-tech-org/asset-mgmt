'use client'
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReturnAssetPage() {
  const params = useParams()
  const router = useRouter()
  const [asset, setAsset] = React.useState<{ id: string; assetId: string; name: string } | null>(null)
  const [condition, setCondition] = React.useState('Good')
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    fetch(`/api/assets/${params.id}`).then((r) => r.json()).then((d) => { if (d.asset) setAsset(d.asset); setLoading(false) }).catch(() => setLoading(false))
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/assets/return', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: params.id, condition, notes }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Return failed')
      router.push(`/assets/${params.id}`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Return failed') } finally { setSaving(false) }
  }

  if (loading) return <DashboardLayout><div className="max-w-xl mx-auto"><Skeleton className="h-64" /></div></DashboardLayout>
  if (!asset) return <DashboardLayout><div className="text-center p-8">Asset not found</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href={`/assets/${params.id}`}>← Back</Link></Button>
          <h1 className="text-2xl font-bold">Return Asset</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>{asset.name} — {asset.assetId}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
              <Select label="Return Condition" value={condition} onChange={(e) => setCondition(e.target.value)} options={[{ value: 'Good', label: 'Good' }, { value: 'Fair', label: 'Fair' }, { value: 'Damaged', label: 'Damaged' }, { value: 'New', label: 'New' }]} />
              <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Describe condition, missing accessories, etc." />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild><Link href={`/assets/${params.id}`}>Cancel</Link></Button>
                <Button type="submit" disabled={saving}>{saving ? 'Processing...' : 'Confirm Return'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
