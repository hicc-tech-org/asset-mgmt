'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import Link from 'next/link'

export default function InviteUserPage() {
  const router = useRouter()
  const [form, setForm] = React.useState({ email: '', password: '', firstName: '', lastName: '', employeeId: '', jobTitle: '', department: 'OTHER', role: 'EMPLOYEE', campus: 'Central' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  const handleChange = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to invite user')
      setSuccess(`User ${data.user.email} invited successfully`)
      setTimeout(() => router.push('/users'), 1000)
    } catch (e) { setError(e instanceof Error ? e.message : 'Invite failed') } finally { setLoading(false) }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href="/users">← Back</Link></Button>
          <h1 className="text-2xl font-bold">Invite User</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-50 text-green-700 rounded text-sm">{success}</div>}
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="First Name *" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
                <Input label="Last Name *" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
                <Input label="Email *" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
                <Input label="Password *" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required />
                <Input label="Employee ID" value={form.employeeId} onChange={(e) => handleChange('employeeId', e.target.value)} />
                <Input label="Job Title" value={form.jobTitle} onChange={(e) => handleChange('jobTitle', e.target.value)} />
                <Select label="Department" value={form.department} onChange={(e) => handleChange('department', e.target.value)} options={[{ value: 'HR', label: 'HR' }, { value: 'IT', label: 'IT' }, { value: 'COMPLIANCE', label: 'Compliance' }, { value: 'FINANCE', label: 'Finance' }, { value: 'OPERATIONS', label: 'Operations' }, { value: 'MARKETING', label: 'Marketing' }, { value: 'SALES', label: 'Sales' }, { value: 'OTHER', label: 'Other' }]} />
                <Select label="Role" value={form.role} onChange={(e) => handleChange('role', e.target.value)} options={[{ value: 'SUPERADMIN', label: 'Super Admin' }, { value: 'ADMIN', label: 'Admin' }, { value: 'HR_HEAD', label: 'HR Head' }, { value: 'HR_OFFICER', label: 'HR Officer' }, { value: 'IT_HEAD', label: 'IT Head' }, { value: 'IT_OFFICER', label: 'IT Officer' }, { value: 'COMPLIANCE_HEAD', label: 'Compliance Head' }, { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' }, { value: 'EMPLOYEE', label: 'Employee' }]} />
                <Input label="Campus" value={form.campus} onChange={(e) => handleChange('campus', e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild><Link href="/users">Cancel</Link></Button>
                <Button type="submit" disabled={loading}>{loading ? 'Inviting...' : 'Invite User'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
