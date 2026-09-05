'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import Link from 'next/link'

export default function AdminPage() {
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
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">System Status</p>
                  <p className="text-3xl font-bold text-green-600">Operational</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Database</p>
                  <p className="text-3xl font-bold text-blue-600">Connected</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">1.0.0</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button asChild>
                    <Link href="/users/new">Invite New User</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/assets/new">Add Asset</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/backup">Backup Database</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/import">Import Assets</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {['HR', 'IT', 'COMPLIANCE', 'FINANCE', 'OPERATIONS', 'MARKETING', 'SALES'].map((dept) => (
                    <div key={dept} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-medium">{dept}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure heads and officers</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Definitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-medium">Role</th>
                        <th className="text-left p-3 font-medium">Department</th>
                        <th className="text-left p-3 font-medium">Can Approve</th>
                        <th className="text-left p-3 font-medium">Can Manage Assets</th>
                        <th className="text-left p-3 font-medium">Can Manage Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                        <tr key={r.role}>
                          <td className="p-3 font-medium">{r.role}</td>
                          <td className="p-3">{r.dept}</td>
                          <td className="p-3">{r.approve}</td>
                          <td className="p-3">{r.assets}</td>
                          <td className="p-3">{r.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accessories" className="space-y-4">
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle>Accessory Types</CardTitle>
                <Button asChild>
                  <Link href="/admin/accessories/new">Add Type</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Code</th>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-left p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {[
                        { name: 'Charger', code: 'CHR', desc: 'Power adapter for laptops/devices' },
                        { name: 'Keyboard', code: 'KEY', desc: 'External keyboard' },
                        { name: 'Mouse', code: 'MOU', desc: 'External mouse' },
                        { name: 'Headset', code: 'HED', desc: 'Audio headset with microphone' },
                        { name: 'Carrying Case', code: 'CAS', desc: 'Protective carrying case/bag' },
                        { name: 'Docking Station', code: 'DOC', desc: 'Docking station for laptops' },
                      ].map((a) => (
                        <tr key={a.code}>
                          <td className="p-3 font-medium">{a.name}</td>
                          <td className="p-3 font-mono">{a.code}</td>
                          <td className="p-3 text-gray-500 dark:text-gray-400">{a.desc}</td>
                          <td className="p-3"><Badge variant="success">Active</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Approval Thresholds</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">High Value Threshold (₦)</label>
                      <Input type="number" defaultValue="100000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Auto-approve Low Value</label>
                      <Select
                        options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                        defaultValue="false"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Notifications</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Notifications</label>
                      <Select
                        options={[{ value: 'true', label: 'Enabled' }, { value: 'false', label: 'Disabled' }]}
                        defaultValue="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Approval Reminders (days)</label>
                      <Input type="number" defaultValue="3" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}