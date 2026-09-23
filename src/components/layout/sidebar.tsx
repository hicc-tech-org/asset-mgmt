'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard', roles: ['SUPERADMIN','ADMIN','HR_HEAD','HR_OFFICER','IT_HEAD','IT_OFFICER','COMPLIANCE_HEAD','COMPLIANCE_OFFICER','EMPLOYEE'] },
  { name: 'Assets', href: '/assets', icon: 'monitor', roles: ['SUPERADMIN','ADMIN','HR_HEAD','HR_OFFICER','IT_HEAD','IT_OFFICER','COMPLIANCE_HEAD','COMPLIANCE_OFFICER','EMPLOYEE'] },
  { name: 'Users', href: '/users', icon: 'users', roles: ['SUPERADMIN','ADMIN','HR_HEAD','HR_OFFICER','IT_HEAD','COMPLIANCE_HEAD'] },
  { name: 'Approvals', href: '/approvals', icon: 'clipboard-check', roles: ['SUPERADMIN','ADMIN','HR_HEAD','HR_OFFICER','IT_HEAD','IT_OFFICER','COMPLIANCE_HEAD','COMPLIANCE_OFFICER'] },
  { name: 'Audit Logs', href: '/audit-logs', icon: 'file-text', roles: ['SUPERADMIN','ADMIN','HR_HEAD','IT_HEAD','COMPLIANCE_HEAD','COMPLIANCE_OFFICER'] },
  { name: 'Admin', href: '/admin', icon: 'settings', roles: ['SUPERADMIN','ADMIN'] },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState(false)
  const [previewRole, setPreviewRole] = React.useState<string | null>(null)
  React.useEffect(() => {
    const match = document.cookie.match(/preview-role=([^;]+)/)
    if (match) setPreviewRole(decodeURIComponent(match[1]))
    else setPreviewRole(null)
    const handler = () => {
      const m = document.cookie.match(/preview-role=([^;]+)/)
      setPreviewRole(m ? decodeURIComponent(m[1]) : null)
    }
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [pathname])

  const navigation = React.useMemo(() => {
    if (!previewRole) return baseNavigation
    return baseNavigation.filter(item => item.roles.includes(previewRole))
  }, [previewRole])

  const exitPreview = async () => {
    await fetch('/api/admin/preview', { method: 'DELETE' })
    setPreviewRole(null)
    router.refresh()
  }

  // Close mobile on route change
  React.useEffect(() => {
    onMobileClose()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {previewRole && !collapsed && (
          <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-purple-700 dark:text-purple-300">Preview: {previewRole}</span>
              <button onClick={exitPreview} className="text-purple-600 hover:text-purple-800 underline">Exit</button>
            </div>
          </div>
        )}
        <div className="flex h-16 items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className={cn('flex items-center gap-2 text-xl font-bold text-primary-600', collapsed && 'justify-center w-full')}>
            <svg className="h-8 w-8 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            {!collapsed && <span>AssetFlow</span>}
          </Link>
          <button
            onClick={onToggle}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M21 19l-7-7 7-7" />
              )}
            </svg>
          </button>
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                {!collapsed && item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300 shrink-0">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Super Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@company.com</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50',
              collapsed && 'justify-center px-2'
            )}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && (signingOut ? 'Signing out...' : 'Sign out')}
          </button>
        </div>
      </aside>
    </>
  )
}

function Icon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    'layout-dashboard': (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    monitor: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    users: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    'clipboard-check': (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    'file-text': (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    settings: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }
  return <span className={className}>{icons[name]}</span>
}
