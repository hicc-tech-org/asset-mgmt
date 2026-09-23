import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function getUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  return prisma.user.findUnique({ where: { id: payload.id as string } })
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const configs = await prisma.systemConfig.findMany()
  return NextResponse.json({ configs })
}

export async function PATCH(request: NextRequest) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPERADMIN', 'ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { key, value, category, description } = await request.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  const updated = await prisma.systemConfig.upsert({
    where: { key },
    update: { value, category, description },
    create: { key, value, category: category || 'general', description },
  })
  return NextResponse.json({ config: updated })
}
