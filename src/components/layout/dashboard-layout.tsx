'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Persist collapsed state
  React.useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) setCollapsed(saved === 'true')
  }, [])
  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={cn('transition-all duration-300', collapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <Header collapsed={collapsed} onHamburger={() => setMobileOpen((v) => !v)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
