'use client'
import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BackupPage() {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)

  const handleBackup = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/backup')
      const json = await res.json()
      setData(json)
    } catch {} finally { setLoading(false) }
  }

  const handleDownload = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href="/admin">← Back</Link></Button>
          <h1 className="text-2xl font-bold">Backup Database</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Export Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleBackup} disabled={loading}>{loading ? 'Exporting...' : 'Generate Backup'}</Button>
            {data && (
              <>
                <div className="p-3 bg-green-50 text-green-700 rounded text-sm">Backup ready — {(data as { assets: unknown[] }).assets?.length} assets, {(data as { users: unknown[] }).users?.length} users</div>
                <Button variant="outline" onClick={handleDownload}>Download JSON</Button>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs max-h-96 overflow-auto">{JSON.stringify(data, null, 2).slice(0, 5000)}...</pre>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
