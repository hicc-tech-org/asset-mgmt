'use client'
import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ImportPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ successCount: number; total: number; results: Array<{ assetId: string; success: boolean; error?: string }> } | null>(null)
  const [error, setError] = React.useState('')

  const handleUpload = async () => {
    if (!file) { setError('Select a file'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const text = await file.text()
      let assets: Array<Record<string, unknown>>
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text)
        assets = Array.isArray(parsed) ? parsed : parsed.assets || []
      } else {
        // CSV parse simple
        const lines = text.split('\n').filter(Boolean)
        const headers = lines[0].split(',').map((h) => h.trim())
        assets = lines.slice(1).map((line) => {
          const vals = line.split(',').map((v) => v.trim())
          const obj: Record<string, unknown> = {}
          headers.forEach((h, i) => obj[h] = vals[i])
          return obj
        })
      }
      const res = await fetch('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Import failed') } finally { setLoading(false) }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href="/admin">← Back</Link></Button>
          <h1 className="text-2xl font-bold">Import Assets</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Bulk Import</CardTitle><p className="text-sm text-gray-500">Upload CSV or JSON with asset rows. Columns: name, category, brand, model, serialNumber, condition, purchaseDate, purchasePrice, location</p></CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
            <input type="file" accept=".csv,.json" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm border rounded p-2" />
            <Button onClick={handleUpload} disabled={loading || !file}>{loading ? 'Importing...' : 'Import'}</Button>
            {result && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded space-y-2">
                <p className="font-medium">Imported {result.successCount} / {result.total}</p>
                <ul className="text-sm max-h-64 overflow-auto">
                  {result.results.map((r, i) => (
                    <li key={i} className={r.success ? 'text-green-600' : 'text-red-600'}>{r.assetId}: {r.success ? 'OK' : r.error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm text-gray-500">
              <p>Sample JSON:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">{`[{"name":"HP Laptop","category":"LAPTOP","brand":"HP","model":"EliteBook 840","serialNumber":"SN123"}]`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
