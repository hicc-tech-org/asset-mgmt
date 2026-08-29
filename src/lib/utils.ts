// Utility functions
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateAssetId(): string {
  const prefix = 'AST'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function generateAccessoryId(code: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `ACC-${code}-${timestamp}${random}`
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPERADMIN: 'Super Admin',
    ADMIN: 'Admin',
    HR_OFFICER: 'HR Officer',
    HR_HEAD: 'HR Head',
    IT_OFFICER: 'IT Officer',
    IT_HEAD: 'IT Head',
    COMPLIANCE_OFFICER: 'Compliance Officer',
    COMPLIANCE_HEAD: 'Compliance Head',
    EMPLOYEE: 'Employee',
  }
  return labels[role] || role
}

export function getDepartmentLabel(dept: string): string {
  const labels: Record<string, string> = {
    HR: 'Human Resources',
    IT: 'Information Technology',
    COMPLIANCE: 'Compliance',
    FINANCE: 'Finance',
    OPERATIONS: 'Operations',
    MARKETING: 'Marketing',
    SALES: 'Sales',
    OTHER: 'Other',
  }
  return labels[dept] || dept
}

export function getAssetStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Available',
    ASSIGNED: 'Assigned',
    MAINTENANCE: 'Maintenance',
    RETIRED: 'Retired',
    DAMAGED: 'Damaged',
    LOST: 'Lost',
  }
  return labels[status] || status
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-GB').format(num)
}

export function getApprovalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ESCALATED: 'Escalated',
  }
  return labels[status] || status
}