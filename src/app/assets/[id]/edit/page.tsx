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

export default function EditAssetPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [form, setForm] = React.useState<Record<string, string>>({})
  const [users, setUsers] = React.useState<Array<{ id: string; firstName: string; lastName: string; email: string; department: string }>>([])
  const [originalAssigneeId, setOriginalAssigneeId] = React.useState<string>('')

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/assets/${params.id}`).then((r) => r.json()),
      fetch('/api/users?page=1&pageSize=100').then((r) => r.json()).catch(() => ({ users: [] })),
    ])
      .then(([aData, uData]) => {
        const a = aData.asset
        if (a) {
          setForm({
            name: a.name || '',
            category: a.category || '',
            brand: a.brand || '',
            model: a.model || '',
            serialNumber: a.serialNumber || '',
            condition: a.condition || '',
            status: a.status || '',
            location: a.location || '',
            purchasePrice: a.purchasePrice?.toString() || '',
            purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toISOString().split('T')[0] : '',
            warrantyExpiry: a.warrantyExpiry ? new Date(a.warrantyExpiry).toISOString().split('T')[0] : '',
            specifications: a.specifications || '',
            remarks: a.remarks || '',
            assignedToId: a.assignedTo?.id || '',
            expectedReturnDate: a.expectedReturnDate ? new Date(a.expectedReturnDate).toISOString().split('T')[0] : '',
          })
          setOriginalAssigneeId(a.assignedTo?.id || '')
        }
        if (uData.users) setUsers(uData.users)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleChange = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const wantsAssignmentChange = (form.assignedToId || '') !== (originalAssigneeId || '')
      const wantsUnassign = !form.assignedToId && !!originalAssigneeId

      if (wantsAssignmentChange) {
        if (wantsUnassign) {
          // Unassign via return logic with audit: PATCH status to AVAILABLE and clear assignment
          const unassignRes = await fetch(`/api/assets/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignedToId: null, assignedById: null, assignedAt: null, status: 'AVAILABLE', expectedReturnDate: null }),
          })
          const unassignData = await unassignRes.json()
          if (!unassignRes.ok) throw new Error(unassignData.error || 'Failed to unassign')
        } else {
          const assignRes = await fetch('/api/assets/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId: params.id, assigneeId: form.assignedToId, expectedReturnDate: form.expectedReturnDate || undefined, notes: 'Edited via asset edit page' }),
          })
          const assignData = await assignRes.json()
          if (!assignRes.ok) throw new Error(assignData.error || 'Failed to assign')
        }
      }

      const { assignedToId, expectedReturnDate, ...restForm } = form
      const payload: Record<string, unknown> = {
        ...restForm,
        // status/condition etc. are in restForm; avoid sending assignedToId again if already handled
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
        purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
        warrantyExpiry: form.warrantyExpiry ? new Date(form.warrantyExpiry).toISOString() : undefined,
      }
      // If assignment wasn't changed via assign endpoint, allow expectedReturnDate patch
      if (!wantsAssignmentChange && expectedReturnDate !== undefined) {
        payload.expectedReturnDate = expectedReturnDate ? new Date(expectedReturnDate).toISOString() : null
      }
      const res = await fetch(`/api/assets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      router.push(`/assets/${params.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    )

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/assets/${params.id}`}>← Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Asset</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Edit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Name *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
                <Select label="Category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} options={[{ value: 'LAPTOP', label: 'Laptop' }, { value: 'PHONE', label: 'Phone' }, { value: 'TABLET', label: 'Tablet' }, { value: 'MONITOR', label: 'Monitor' }, { value: 'CHARGER', label: 'Charger' }, { value: 'KEYBOARD', label: 'Keyboard' }, { value: 'MOUSE', label: 'Mouse' }, { value: 'HEADSET', label: 'Headset' }, { value: 'CARRYING_CASE', label: 'Carrying Case' }, { value: 'DOCKING_STATION', label: 'Docking Station' }, { value: 'OTHER', label: 'Other' }]} />
                <Input label="Brand" value={form.brand} onChange={(e) => handleChange('brand', e.target.value)} />
                <Input label="Model" value={form.model} onChange={(e) => handleChange('model', e.target.value)} />
                <Input label="Serial Number" value={form.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} />
                <Select label="Condition" value={form.condition} onChange={(e) => handleChange('condition', e.target.value)} options={[{ value: 'New', label: 'New' }, { value: 'Good', label: 'Good' }, { value: 'Fair', label: 'Fair' }, { value: 'Damaged', label: 'Damaged' }]} />
                <Select label="Status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} options={[{ value: 'AVAILABLE', label: 'Available' }, { value: 'ASSIGNED', label: 'Assigned' }, { value: 'MAINTENANCE', label: 'Maintenance' }, { value: 'RETIRED', label: 'Retired' }, { value: 'DAMAGED', label: 'Damaged' }, { value: 'LOST', label: 'Lost' }]} />
                <Input label="Location" value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
                <Input label="Purchase Price" type="number" value={form.purchasePrice} onChange={(e) => handleChange('purchasePrice', e.target.value)} />
                <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} />
                <Input label="Warranty Expiry" type="date" value={form.warrantyExpiry} onChange={(e) => handleChange('warrantyExpiry', e.target.value)} />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Assignment (admin)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Select label="Assigned To" value={form.assignedToId || ''} onChange={(e) => handleChange('assignedToId', e.target.value)} options={[{ value: '', label: '— Unassigned —' }, ...users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.department} • ${u.email})` }))]} />
                  <Input label="Expected Return Date" type="date" value={form.expectedReturnDate || ''} onChange={(e) => handleChange('expectedReturnDate', e.target.value)} />
                </div>
                <p className="text-xs text-gray-500 mt-2">Changing assignee will reassign via audit-logged transfer. Select empty to unassign.</p>
              </div>
              <Textarea label="Specifications" value={form.specifications} onChange={(e) => handleChange('specifications', e.target.value)} rows={3} />
              <Textarea label="Remarks" value={form.remarks} onChange={(e) => handleChange('remarks', e.target.value)} rows={2} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/assets/${params.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
