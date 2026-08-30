import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      jobTitle: true,
      campus: true,
      employeeId: true,
      isActive: true,
      createdAt: true,
    },
  })
  
  if (!user || !user.isActive) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  
  return NextResponse.json({ user })
}