'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface AccessoryType { id: string; name: string; code: string; description: string | null; isActive: boolean }
interface SystemConfig { id: string; key: string; value: unknown; category: string; description: string | null }

export default function AdminPage() {
  const [accessoryTypes, setAccessoryTypes] = React.useState<AccessoryType[]>([])
  const [configs, setConfigs] = React.useState<SystemConfig[]>([])
  const [loadingAcc, setLoadingAcc] = React.useState(true)
  const [loadingCfg, setLoadingCfg] = React.useState(true)
  const [editingAcc, setEditingAcc] = React.useState<AccessoryType | null>(null)
  const [accForm, setAccForm] = React.useState({ name: '', code: '', description: '', isActive: 'true' })
  const [cfgForm, setCfgForm] = React.useState({ high_value_threshold: '100000', approval_reminder_days: '3', email_notifications_enabled: 'true' })
  const [saving, setSaving] = React.useState(false)
  const [msg, setMsg] = React.useState('')

  const fetchAccessories = React.useCallback(async () => {
    setLoadingAcc(true)
    try {
      const res = await fetch('/api/accessories')
      const data = await res.json()
      setAccessoryTypes(data.accessoryTypes || [])
    } catch {} finally { setLoadingAcc(false) }
  }, [])

  const fetchConfigs = React.useCallback(async () => {
    setLoadingCfg(true)
    try {
      const res = await fetch('/api/admin/configs')
      const data = await res.json()
      setConfigs(data.configs || [])
      const map: Record<string, string> = {}
      for (const c of data.configs || []) {
        map[c.key] = String(c.value as unknown)
        if (typeof c.value === 'object') map[c.key] = JSON.stringify(c.value)
      }
      setCfgForm((prev) => ({
        high_value_threshold: map['high_value_threshold'] || prev.high_value_threshold,
        approval_reminder_days: map['approval_reminder_days'] || prev.approval_reminder_days,
        email_notifications_enabled: map['email_notifications_enabled'] || prev.email_notifications_enabled,
      }))
    } catch {} finally { setLoadingCfg(false) }
  }, [])

  React.useEffect(() => { fetchAccessories(); fetchConfigs() }, [fetchAccessories, fetchConfigs])

  const handleEditAcc = (acc: AccessoryType) => {
    setEditingAcc(acc)
    setAccForm({ name: acc.name, code: acc.code, description: acc.description || '', isActive: String(acc.isActive) })
  }

  const handleSaveAcc = async () => {
    if (!editingAcc) return
    setSaving(true)
    try {
      const res = await fetch(`/api/accessories/${editingAcc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accForm.name, code: accForm.code, description: accForm.description, isActive: accForm.isActive === 'true' }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setEditingAcc(null)
      fetchAccessories()
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Update failed') } finally { setSaving(false) }
  }

  const handleDeleteAcc = async (id: string) => {
    if (!confirm('Delete this accessory type?')) return
    await fetch(`/api/accessories/${id}`, { method: 'DELETE' })
    fetchAccessories()
  }

  const handleSaveConfigs = async () => {
    setSaving(true); setMsg('')
    try {
      await Promise.all([
        fetch('/api/admin/configs', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'high_value_threshold', value: parseInt(cfgForm.high_value_threshold), category: 'approval' }) }),
        fetch('/api/admin/configs', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'approval_reminder_days', value: parseInt(cfgForm.approval_reminder_days), category: 'approval' }) }),
        fetch('/api/admin/configs', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'email_notifications_enabled', value: cfgForm.email_notifications_enabled === 'true', category: 'notification' }) }),
      ])
      setMsg('Settings saved successfully')
      fetchConfigs()
    } catch { setMsg('Failed to save settings') } finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administration</h1>
          <p className="text-gray-500 dark:text-gray-400">System configuration and management</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="accessories">Accessory Types</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-6"><p className="text-sm text-gray-500">System Status</p><p className="text-3xl font-bold text-green-600">Operational</p></CardContent></Card>
              <Card><CardContent className="p-6"><p className="text-sm text-gray-500">Database</p><p className="text-3xl font-bold text-blue-600">Connected</p></CardContent></Card>
              <Card><CardContent className="p-6"><p className="text-sm text-gray-500">Version</p><p className="text-3xl font-bold">1.0.0</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button asChild><Link href="/users/new">Invite New User</Link></Button>
                  <Button asChild variant="outline"><Link href="/assets/new">Add Asset</Link></Button>
                  <Button asChild variant="outline"><Link href="/admin/backup">Backup Database</Link></Button>
                  <Button asChild variant="outline"><Link href="/admin/import">Import Assets</Link></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Departments</CardTitle><p className="text-sm text-gray-500">Manage department heads and officers via Users page</p></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {['HR', 'IT', 'COMPLIANCE', 'FINANCE', 'OPERATIONS', 'MARKETING', 'SALES'].map((dept) => (
                    <div key={dept} className="p-4 border rounded-lg">
                      <h3 className="font-medium">{dept}</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage via Users → filter by {dept}</p>
                      <Button variant="ghost" size="sm" className="mt-2" asChild><Link href={`/users?department=${dept}`}>View Users</Link></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Role Definitions</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left p-3">Role</th><th className="text-left p-3">Department</th><th className="text-left p-3">Can Approve</th><th className="text-left p-3">Can Manage Assets</th><th className="text-left p-3">Can Manage Users</th></tr></thead>
                    <tbody className="divide-y">
                      {[
                        { role: 'Super Admin', dept: 'All', approve: 'All', assets: 'All', users: 'All' },
                        { role: 'Admin', dept: 'All', approve: 'All', assets: 'All', users: 'All' },
                        { role: 'HR Head', dept: 'HR', approve: 'Asset Requests, Transfers', assets: 'View', users: 'HR Dept' },
                        { role: 'HR Officer', dept: 'HR', approve: 'Asset Requests', assets: 'View', users: 'HR Dept' },
                        { role: 'IT Head', dept: 'IT', approve: 'Asset Requests, Transfers, Accessories', assets: 'All', users: 'IT Dept' },
                        { role: 'IT Officer', dept: 'IT', approve: 'Accessories', assets: 'All', users: 'IT Dept' },
                        { role: 'Compliance Head', dept: 'Compliance', approve: 'High-value Assets', assets: 'View', users: 'Compliance Dept' },
                        { role: 'Compliance Officer', dept: 'Compliance', approve: 'View', assets: 'View', users: 'Compliance Dept' },
                        { role: 'Employee', dept: 'Assigned', approve: 'Own Returns', assets: 'Own Only', users: 'Self' },
                      ].map((r) => (
                        <tr key={r.role}><td className="p-3 font-medium">{r.role}</td><td className="p-3">{r.dept}</td><td className="p-3">{r.approve}</td><td className="p-3">{r.assets}</td><td className="p-3">{r.users}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-3">Roles are assigned when inviting/editing users.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Accessory Types</CardTitle>
                <Button asChild><Link href="/admin/accessories/new">Add Type</Link></Button>
              </CardHeader>
              <CardContent>
                {loadingAcc ? (
                  <Skeleton className="h-48" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b"><th className="text-left p-3">Name</th><th className="text-left p-3">Code</th><th className="text-left p-3">Description</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr></thead>
                      <tbody className="divide-y">
                        {accessoryTypes.map((a) => (
                          <tr key={a.id}>
                            <td className="p-3 font-medium">{a.name}</td>
                            <td className="p-3 font-mono">{a.code}</td>
                            <td className="p-3 text-gray-500">{a.description || '-'}</td>
                            <td className="p-3"><Badge variant={a.isActive ? 'success' : 'danger'}>{a.isActive ? 'Active' : 'Inactive'}</Badge></td>
                            <td className="p-3 flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditAcc(a)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteAcc(a.id)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {accessoryTypes.length === 0 && <p className="text-center text-gray-500 py-4">No accessory types</p>}
                  </div>
                )}

                {editingAcc && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                      <CardHeader><CardTitle>Edit {editingAcc.name}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <Input label="Name" value={accForm.name} onChange={(e) => setAccForm((p) => ({ ...p, name: e.target.value }))} />
                        <Input label="Code" value={accForm.code} onChange={(e) => setAccForm((p) => ({ ...p, code: e.target.value }))} />
                        <Textarea label="Description" value={accForm.description} onChange={(e) => setAccForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
                        <Select label="Status" value={accForm.isActive} onChange={(e) => setAccForm((p) => ({ ...p, isActive: e.target.value }))} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingAcc(null)}>Cancel</Button>
                          <Button onClick={handleSaveAcc} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>System Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {loadingCfg ? <Skeleton className="h-48" /> : (
                  <>
                    {msg && <div className="p-3 bg-green-50 text-green-700 rounded text-sm">{msg}</div>}
                    <div>
                      <h4 className="font-medium mb-4">Approval Thresholds</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="High Value Threshold (₦)" type="number" value={cfgForm.high_value_threshold} onChange={(e) => setCfgForm((p) => ({ ...p, high_value_threshold: e.target.value }))} />
                        <Select label="Email Notifications" value={cfgForm.email_notifications_enabled} onChange={(e) => setCfgForm((p) => ({ ...p, email_notifications_enabled: e.target.value }))} options={[{ value: 'true', label: 'Enabled' }, { value: 'false', label: 'Disabled' }]} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4">Notifications</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Approval Reminders (days)" type="number" value={cfgForm.approval_reminder_days} onChange={(e) => setCfgForm((p) => ({ ...p, approval_reminder_days: e.target.value }))} />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <Button onClick={handleSaveConfigs} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
