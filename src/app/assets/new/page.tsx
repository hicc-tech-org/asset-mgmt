'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  brand: z.string().min(1, 'Required'),
  model: z.string().min(1, 'Required'),
  serialNumber: z.string().optional(),
  assetId: z.string().optional(),
  condition: z.string().optional(),
  status: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  location: z.string().optional(),
  specifications: z.string().optional(),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NewAssetPage() {
  const router = useRouter()
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'AVAILABLE', condition: 'New', category: 'LAPTOP' },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        ...data,
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : undefined,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry).toISOString() : undefined,
      }
      const res = await fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to create asset')
      router.push(`/assets/${result.asset.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild><Link href="/assets">← Back</Link></Button>
          <div>
            <h1 className="text-2xl font-bold">Add Asset</h1>
            <p className="text-gray-500">Create a new asset record</p>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Asset Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Asset ID (auto if blank)" {...register('assetId')} error={errors.assetId?.message} />
                <Select label="Category" value={watch('category')} onChange={(e) => setValue('category', e.target.value)} options={[
                  { value: 'LAPTOP', label: 'Laptop' }, { value: 'PHONE', label: 'Phone' }, { value: 'TABLET', label: 'Tablet' }, { value: 'MONITOR', label: 'Monitor' }, { value: 'CHARGER', label: 'Charger' }, { value: 'KEYBOARD', label: 'Keyboard' }, { value: 'MOUSE', label: 'Mouse' }, { value: 'HEADSET', label: 'Headset' }, { value: 'CARRYING_CASE', label: 'Carrying Case' }, { value: 'DOCKING_STATION', label: 'Docking Station' }, { value: 'OTHER', label: 'Other' },
                ]} />
                <Input label="Name *" {...register('name')} error={errors.name?.message} />
                <Input label="Brand *" {...register('brand')} error={errors.brand?.message} />
                <Input label="Model *" {...register('model')} error={errors.model?.message} />
                <Input label="Serial Number" {...register('serialNumber')} />
                <Select label="Condition" value={watch('condition') || ''} onChange={(e) => setValue('condition', e.target.value)} options={[{ value: 'New', label: 'New' }, { value: 'Good', label: 'Good' }, { value: 'Fair', label: 'Fair' }, { value: 'Damaged', label: 'Damaged' }]} />
                <Select label="Status" value={watch('status') || ''} onChange={(e) => setValue('status', e.target.value)} options={[{ value: 'AVAILABLE', label: 'Available' }, { value: 'MAINTENANCE', label: 'Maintenance' }, { value: 'RETIRED', label: 'Retired' }]} />
                <Input label="Purchase Date" type="date" {...register('purchaseDate')} />
                <Input label="Purchase Price (₦)" type="number" {...register('purchasePrice')} />
                <Input label="Warranty Expiry" type="date" {...register('warrantyExpiry')} />
                <Input label="Location / Campus" {...register('location')} />
              </div>
              <Textarea label="Specifications (JSON or text)" {...register('specifications')} rows={3} />
              <Textarea label="Remarks" {...register('remarks')} rows={2} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild><Link href="/assets">Cancel</Link></Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Asset'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
