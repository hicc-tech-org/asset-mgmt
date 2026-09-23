'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  collapsed: boolean
  onHamburger: () => void
}

export function Header({ onHamburger }: HeaderProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onHamburger}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Mobile logo when sidebar hidden */}
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-primary-600 lg:hidden">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>AssetFlow</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm dark:bg-primary-900/30 dark:text-primary-300">
              SA
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Super Admin</span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 disabled:opacity-50"
          >
            {signingOut ? '...' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  )
}
