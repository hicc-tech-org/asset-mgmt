'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4 lg:hidden">
          <button className="btn btn-ghost p-2" aria-label="Open menu">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-primary-600">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>AssetFlow</span>
          </Link>
        </div>
        
        <div className="flex-1 lg:flex lg:items-center lg:justify-end lg:gap-4">
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {[
              { name: 'Dashboard', href: '/dashboard' },
              { name: 'Assets', href: '/assets' },
              { name: 'Users', href: '/users' },
              { name: 'Approvals', href: '/approvals' },
              { name: 'Audit Logs', href: '/audit-logs' },
              { name: 'Admin', href: '/admin' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm dark:bg-primary-900/30 dark:text-primary-300">
                SA
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Super Admin</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/logout">Sign out</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}