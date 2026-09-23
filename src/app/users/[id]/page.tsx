'use client'
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = React.useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState('')

  const fetchUser = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${params.id}`)
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        setForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          jobTitle: data.user.jobTitle || '',
          department: data.user.department || '',
          role: data.user.role || '',
          campus: data.user.campus || '',
          employeeId: data.user.employeeId || '',
          isActive: String(data.user.isActive),
        })
      }
    } catch {}
    setLoading(false)
  }, [params.id])

  React.useEffect(() => { fetchUser() }, [fetchUser])

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form, isActive: form.isActive === 'true' }
      const res = await fetch(`/api/users/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setUser((prev) => ({ ...prev, ...data.user }))
      setEditing(false)
    } catch (e) { setError(e instanceof Error ? e.message : 'Update failed') } finally { setSaving(false) }
  }

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this user?')) return
    const res = await fetch(`/api/users/${params.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/users')
  }

  if (loading) return <DashboardLayout><div className="max-w-2xl mx-auto"><Skeleton className="h-96" /></div></DashboardLayout>
  if (!user) return <DashboardLayout><div className="text-center p-8">User not found</div></DashboardLayout>

  const u = user as { firstName: string; lastName: string; email: string; employeeId: string | null; jobTitle: string | null; department: string; role: string; campus: string | null; isActive: boolean; createdAt: string; assignedAssets?: Array<{ id: string; assetId: string; name: string; status: string }> }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild><Link href="/users">← Back</Link></Button>
            <h1 className="text-2xl font-bold">{u.firstName} {u.lastName}</h1>
            <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="destructive" onClick={handleDeactivate}>Deactivate</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </>
            )}
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

        <Card>
          <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!editing ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Email</label><p className="font-medium">{u.email}</p></div>
                <div><label className="text-sm text-gray-500">Employee ID</label><p className="font-medium">{u.employeeId || '-'}</p></div>
                <div><label className="text-sm text-gray-500">Job Title</label><p className="font-medium">{u.jobTitle || '-'}</p></div>
                <div><label className="text-sm text-gray-500">Department</label><p className="font-medium">{u.department}</p></div>
                <div><label className="text-sm text-gray-500">Role</label><p className="font-medium">{u.role}</p></div>
                <div><label className="text-sm text-gray-500">Campus</label><p className="font-medium">{u.campus || '-'}</p></div>
                <div><label className="text-sm text-gray-500">Created</label><p className="font-medium">{formatDate(u.createdAt)}</p></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="First Name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                <Input label="Job Title" value={form.jobTitle} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} />
                <Input label="Employee ID" value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} />
                <Select label="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} options={[{ value: 'HR', label: 'HR' }, { value: 'IT', label: 'IT' }, { value: 'COMPLIANCE', label: 'Compliance' }, { value: 'FINANCE', label: 'Finance' }, { value: 'OPERATIONS', label: 'Operations' }, { value: 'MARKETING', label: 'Marketing' }, { value: 'SALES', label: 'Sales' }, { value: 'OTHER', label: 'Other' }]} />
                <Select label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} options={[{ value: 'SUPERADMIN', label: 'Super Admin' }, { value: 'ADMIN', label: 'Admin' }, { value: 'HR_HEAD', label: 'HR Head' }, { value: 'HR_OFFICER', label: 'HR Officer' }, { value: 'IT_HEAD', label: 'IT Head' }, { value: 'IT_OFFICER', label: 'IT Officer' }, { value: 'COMPLIANCE_HEAD', label: 'Compliance Head' }, { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' }, { value: 'EMPLOYEE', label: 'Employee' }]} />
                <Input label="Campus" value={form.campus} onChange={(e) => setForm((p) => ({ ...p, campus: e.target.value }))} />
                <Select label="Active" value={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value }))} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
              </div>
            )}
          </CardContent>
        </Card>

        {(u.assignedAssets && u.assignedAssets.length > 0) && (
          <Card>
            <CardHeader><CardTitle>Assigned Assets ({u.assignedAssets.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {u.assignedAssets.map((a) => (
                  <Link key={a.id} href={`/assets/${a.id}`} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100">
                    <span>{a.assetId} — {a.name}</span><Badge variant="info">{a.status}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
