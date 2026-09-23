'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()
  React.useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      router.push('/auth/login')
      router.refresh()
    })
  }, [router])
  return <div className="min-h-screen flex items-center justify-center">Signing out...</div>
}
