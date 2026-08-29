// Audit logging utility
import { prisma } from './prisma'
import { AuditAction, Prisma } from '@prisma/client'

interface AuditLogInput {
  actorId: string
  action: AuditAction
  entityType: string
  entityId: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  description: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

function toJson(value?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined
  return value as Prisma.InputJsonValue
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeState: toJson(input.beforeState),
        afterState: toJson(input.afterState),
        description: input.description,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: toJson(input.metadata),
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(entityType: string, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: { actor: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserAuditLogs(userId: string) {
  return prisma.auditLog.findMany({
    where: { actorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}