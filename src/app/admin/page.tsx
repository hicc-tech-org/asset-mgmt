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
interface DepartmentItem { id: string; key: string; code: string; name: string; description: string | null; isActive: boolean; source: 'config'|'enum' }
interface RoleItem { id: string; key: string; code: string; label: string; department: string; canApprove: string; canManageAssets: string; canManageUsers: string; description: string | null; isActive: boolean; source: 'config'|'enum' }

export default function AdminPage() {
  const [accessoryTypes, setAccessoryTypes] = React.useState<AccessoryType[]>([])
  const [configs, setConfigs] = React.useState<SystemConfig[]>([])
  const [departments, setDepartments] = React.useState<DepartmentItem[]>([])
  const [roles, setRoles] = React.useState<RoleItem[]>([])
  const [loadingAcc, setLoadingAcc] = React.useState(true)
  const [loadingCfg, setLoadingCfg] = React.useState(true)
  const [loadingDept, setLoadingDept] = React.useState(true)
  const [loadingRoles, setLoadingRoles] = React.useState(true)
  const [editingAcc, setEditingAcc] = React.useState<AccessoryType | null>(null)
  const [accForm, setAccForm] = React.useState({ name: '', code: '', description: '', isActive: 'true' })
  const [cfgForm, setCfgForm] = React.useState({ high_value_threshold: '100000', approval_reminder_days: '3', email_notifications_enabled: 'true' })
  const [deptForm, setDeptForm] = React.useState({ code: '', name: '', description: '', isActive: 'true' })
  const [editingDeptKey, setEditingDeptKey] = React.useState<string | null>(null)
  const [roleForm, setRoleForm] = React.useState({ code: '', label: '', department: 'OTHER', canApprove: '', canManageAssets: '', canManageUsers: '', description: '', isActive: 'true' })
  const [editingRoleKey, setEditingRoleKey] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [previewRole, setPreviewRole] = React.useState<string>('')

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

  const fetchDepartments = React.useCallback(async () => {
    setLoadingDept(true)
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      setDepartments(data.departments || [])
    } catch {} finally { setLoadingDept(false) }
  }, [])
  const fetchRoles = React.useCallback(async () => {
    setLoadingRoles(true)
    try {
      const res = await fetch('/api/admin/roles')
      const data = await res.json()
      setRoles(data.roles || [])
    } catch {} finally { setLoadingRoles(false) }
  }, [])

  React.useEffect(() => { fetchAccessories(); fetchConfigs(); fetchDepartments(); fetchRoles() }, [fetchAccessories, fetchConfigs, fetchDepartments, fetchRoles])

  // preview role cookie
  React.useEffect(() => {
    const match = document.cookie.match(/preview-role=([^;]+)/)
    if (match) setPreviewRole(decodeURIComponent(match[1]))
  }, [])

  const handleSetPreview = async (role: string) => {
    if (!role) {
      await fetch('/api/admin/preview', { method: 'DELETE' })
      setPreviewRole('')
      setMsg('Exited preview mode')
    } else {
      await fetch('/api/admin/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
      setPreviewRole(role)
      setMsg(`Previewing as ${role} — reload to see filtered navigation`)
    }
  }

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

  // Department CRUD
  const handleCreateDept = async () => {
    if (!deptForm.code || !deptForm.name) { setMsg('Code and name required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: deptForm.code, name: deptForm.name, description: deptForm.description, isActive: deptForm.isActive === 'true' }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setDeptForm({ code: '', name: '', description: '', isActive: 'true' })
      fetchDepartments()
      setMsg('Department created')
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }
  const handleEditDept = (d: DepartmentItem) => {
    setEditingDeptKey(d.key)
    setDeptForm({ code: d.code, name: d.name, description: d.description || '', isActive: String(d.isActive) })
  }
  const handleUpdateDept = async () => {
    if (!editingDeptKey) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/departments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: editingDeptKey, name: deptForm.name, description: deptForm.description, isActive: deptForm.isActive === 'true', code: deptForm.code }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setEditingDeptKey(null); setDeptForm({ code: '', name: '', description: '', isActive: 'true' }); fetchDepartments(); setMsg('Department updated')
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }
  const handleDeleteDept = async (key: string) => {
    if (!confirm('Delete department?')) return
    await fetch(`/api/admin/departments?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
    fetchDepartments()
  }

  // Role CRUD
  const handleCreateRole = async () => {
    if (!roleForm.code || !roleForm.label) { setMsg('Code and label required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: roleForm.code, label: roleForm.label, department: roleForm.department, canApprove: roleForm.canApprove, canManageAssets: roleForm.canManageAssets, canManageUsers: roleForm.canManageUsers, description: roleForm.description, isActive: roleForm.isActive === 'true' }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setRoleForm({ code: '', label: '', department: 'OTHER', canApprove: '', canManageAssets: '', canManageUsers: '', description: '', isActive: 'true' })
      fetchRoles(); setMsg('Role created')
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }
  const handleEditRole = (r: RoleItem) => {
    setEditingRoleKey(r.key)
    setRoleForm({ code: r.code, label: r.label, department: r.department, canApprove: r.canApprove, canManageAssets: r.canManageAssets, canManageUsers: r.canManageUsers, description: r.description || '', isActive: String(r.isActive) })
  }
  const handleUpdateRole = async () => {
    if (!editingRoleKey) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/roles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: editingRoleKey, label: roleForm.label, department: roleForm.department, canApprove: roleForm.canApprove, canManageAssets: roleForm.canManageAssets, canManageUsers: roleForm.canManageUsers, description: roleForm.description, isActive: roleForm.isActive === 'true', code: roleForm.code }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setEditingRoleKey(null); setRoleForm({ code: '', label: '', department: 'OTHER', canApprove: '', canManageAssets: '', canManageUsers: '', description: '', isActive: 'true' }); fetchRoles(); setMsg('Role updated')
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }
  const handleDeleteRole = async (key: string) => {
    if (!confirm('Delete role? System roles cannot be deleted.')) return
    const res = await fetch(`/api/admin/roles?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
    const data = await res.json().catch(()=>({}))
    if (!res.ok) setMsg(data.error || 'Delete failed')
    else fetchRoles()
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
            <TabsTrigger value="preview">Preview As</TabsTrigger>
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
            {msg && <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm">{msg}</div>}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Departments — CRUD</CardTitle><Badge variant="info">{departments.length} total</Badge></CardHeader>
              <CardContent className="space-y-4">
                {loadingDept ? <Skeleton className="h-48" /> : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left p-3">Code</th><th className="text-left p-3">Name</th><th className="text-left p-3">Description</th><th className="text-left p-3">Status</th><th className="text-left p-3">Source</th><th className="text-left p-3">Actions</th></tr></thead>
                        <tbody className="divide-y">
                          {departments.map((d) => (
                            <tr key={d.key}><td className="p-3 font-mono">{d.code}</td><td className="p-3 font-medium">{d.name}</td><td className="p-3 text-gray-500">{d.description || '-'}</td><td className="p-3"><Badge variant={d.isActive ? 'success' : 'danger'}>{d.isActive ? 'Active' : 'Inactive'}</Badge></td><td className="p-3"><Badge variant="gray">{d.source}</Badge></td><td className="p-3 flex gap-1"><Button variant="ghost" size="sm" onClick={() => handleEditDept(d)}>Edit</Button><Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteDept(d.key)}>Delete</Button><Button variant="ghost" size="sm" asChild><Link href={`/users?department=${d.code}`}>Users</Link></Button></td></tr>
                          ))}
                        </tbody>
                      </table>
                      {departments.length === 0 && <p className="text-center text-gray-500 py-4">No departments</p>}
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">{editingDeptKey ? `Edit ${editingDeptKey}` : 'Add Department'}</h4>
                      <div className="grid md:grid-cols-4 gap-3">
                        <Input label="Code *" value={deptForm.code} onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. LEGAL" disabled={!!editingDeptKey && editingDeptKey.startsWith('dept_')} />
                        <Input label="Name *" value={deptForm.name} onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))} placeholder="Legal" />
                        <Input label="Description" value={deptForm.description} onChange={(e) => setDeptForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional" />
                        <Select label="Active" value={deptForm.isActive} onChange={(e) => setDeptForm((p) => ({ ...p, isActive: e.target.value }))} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
                      </div>
                      <div className="flex gap-2 mt-3">
                        {editingDeptKey ? (<><Button onClick={handleUpdateDept} disabled={saving}>{saving ? 'Saving...' : 'Update'}</Button><Button variant="outline" onClick={() => { setEditingDeptKey(null); setDeptForm({ code: '', name: '', description: '', isActive: 'true' }) }}>Cancel</Button></>) : (<Button onClick={handleCreateDept} disabled={saving}>{saving ? 'Saving...' : 'Create Department'}</Button>)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Non-breaking: enum departments remain; custom departments stored in SystemConfig. Users select via dropdown.</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            {msg && <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm">{msg}</div>}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Roles & Permissions — CRUD</CardTitle><Badge variant="info">{roles.length} total</Badge></CardHeader>
              <CardContent className="space-y-4">
                {loadingRoles ? <Skeleton className="h-48" /> : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left p-3">Code</th><th className="text-left p-3">Label</th><th className="text-left p-3">Department</th><th className="text-left p-3">Can Approve</th><th className="text-left p-3">Can Manage Assets</th><th className="text-left p-3">Can Manage Users</th><th className="text-left p-3">Actions</th></tr></thead>
                        <tbody className="divide-y">
                          {roles.map((r) => (
                            <tr key={r.key}><td className="p-3 font-mono">{r.code}</td><td className="p-3 font-medium">{r.label}</td><td className="p-3">{r.department}</td><td className="p-3">{r.canApprove || '-'}</td><td className="p-3">{r.canManageAssets || '-'}</td><td className="p-3">{r.canManageUsers || '-'}</td><td className="p-3 flex gap-1"><Button variant="ghost" size="sm" onClick={() => handleEditRole(r)}>Edit</Button><Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteRole(r.key)}>Delete</Button></td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">{editingRoleKey ? `Edit ${editingRoleKey}` : 'Add / Override Role'}</h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        <Input label="Code *" value={roleForm.code} onChange={(e) => setRoleForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. LEGAL_HEAD" disabled={!!editingRoleKey} />
                        <Input label="Label *" value={roleForm.label} onChange={(e) => setRoleForm((p) => ({ ...p, label: e.target.value }))} placeholder="Legal Head" />
                        <Select label="Department" value={roleForm.department} onChange={(e) => setRoleForm((p) => ({ ...p, department: e.target.value }))} options={[{ value: 'HR', label: 'HR' }, { value: 'IT', label: 'IT' }, { value: 'COMPLIANCE', label: 'Compliance' }, { value: 'FINANCE', label: 'Finance' }, { value: 'OPERATIONS', label: 'Operations' }, { value: 'MARKETING', label: 'Marketing' }, { value: 'SALES', label: 'Sales' }, { value: 'OTHER', label: 'Other' }, { value: 'All', label: 'All' }, { value: 'Assigned', label: 'Assigned' }]} />
                        <Input label="Can Approve" value={roleForm.canApprove} onChange={(e) => setRoleForm((p) => ({ ...p, canApprove: e.target.value }))} placeholder="Describe approval scope" />
                        <Input label="Can Manage Assets" value={roleForm.canManageAssets} onChange={(e) => setRoleForm((p) => ({ ...p, canManageAssets: e.target.value }))} />
                        <Input label="Can Manage Users" value={roleForm.canManageUsers} onChange={(e) => setRoleForm((p) => ({ ...p, canManageUsers: e.target.value }))} />
                        <Input label="Description" value={roleForm.description} onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))} />
                        <Select label="Active" value={roleForm.isActive} onChange={(e) => setRoleForm((p) => ({ ...p, isActive: e.target.value }))} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
                      </div>
                      <div className="flex gap-2 mt-3">
                        {editingRoleKey ? (<><Button onClick={handleUpdateRole} disabled={saving}>{saving ? 'Saving...' : 'Update'}</Button><Button variant="outline" onClick={() => { setEditingRoleKey(null); setRoleForm({ code: '', label: '', department: 'OTHER', canApprove: '', canManageAssets: '', canManageUsers: '', description: '', isActive: 'true' }) }}>Cancel</Button></>) : (<Button onClick={handleCreateRole} disabled={saving}>{saving ? 'Saving...' : 'Create Role'}</Button>)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Non-breaking: editing enum roles creates an override config; system roles cannot be deleted. Custom roles can extend permissions.</p>
                    </div>
                  </>
                )}
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
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Preview as Role (Superadmin)</CardTitle><p className="text-sm text-gray-500">Switch UI view without signing out. Data filtering respects preview where supported.</p></CardHeader>
              <CardContent className="space-y-4">
                {msg && <div className="p-3 bg-yellow-50 text-yellow-700 rounded text-sm">{msg}</div>}
                {previewRole && <div className="p-3 bg-purple-50 text-purple-700 rounded text-sm">Currently previewing as <strong>{previewRole}</strong>. APIs include preview header when cookie set.</div>}
                <div className="flex flex-wrap gap-3">
                  <Select label="Select role to preview" value={previewRole} onChange={(e) => handleSetPreview(e.target.value)} options={[{ value: '', label: '— Exit preview (real role) —' }, { value: 'SUPERADMIN', label: 'Super Admin' }, { value: 'ADMIN', label: 'Admin' }, { value: 'HR_HEAD', label: 'HR Head' }, { value: 'HR_OFFICER', label: 'HR Officer' }, { value: 'IT_HEAD', label: 'IT Head' }, { value: 'IT_OFFICER', label: 'IT Officer' }, { value: 'COMPLIANCE_HEAD', label: 'Compliance Head' }, { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' }, { value: 'EMPLOYEE', label: 'Employee' }]} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSetPreview('')}>Exit Preview</Button>
                  <Button variant="outline" asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
                  <Button variant="outline" asChild><Link href="/assets">View Assets</Link></Button>
                </div>
                <p className="text-xs text-gray-500">Preview uses a <code>preview-role</code> cookie; middleware overrides role for SUPERADMIN users. Audit logs record preview sessions separately if needed.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
