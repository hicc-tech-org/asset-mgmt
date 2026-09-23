'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function NewAccessoryTypePage() {
  const router = useRouter()
  const [form, setForm] = React.useState({ name: '', code: '', description: '' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/accessories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      router.push('/admin')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setLoading(false) }
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href="/admin">← Back</Link></Button>
          <h1 className="text-2xl font-bold">Add Accessory Type</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Type Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
              <Input label="Name *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Charger" />
              <Input label="Code *" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required placeholder="CHR" maxLength={10} />
              <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild><Link href="/admin">Cancel</Link></Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
