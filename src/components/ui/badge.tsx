'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'gray', ...props }, ref) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    }
    
    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }