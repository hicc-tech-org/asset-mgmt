import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const publicPaths = ['/auth/login', '/auth/register', '/api/auth']

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const secretKey = new TextEncoder().encode(JWT_SECRET)

async function verifyTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const payload = await verifyTokenEdge(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Preview-as role: SUPERADMIN can set preview-role cookie to view as other role (server-side filtering)
  let effectiveRole = payload.role as string
  const previewRole = request.cookies.get('preview-role')?.value
  const allowedPreview = ['SUPERADMIN','ADMIN','HR_HEAD','HR_OFFICER','IT_HEAD','IT_OFFICER','COMPLIANCE_HEAD','COMPLIANCE_OFFICER','EMPLOYEE']
  if (previewRole && payload.role === 'SUPERADMIN' && allowedPreview.includes(previewRole)) {
    effectiveRole = previewRole
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.id as string)
  requestHeaders.set('x-user-role', effectiveRole)
  requestHeaders.set('x-user-department', payload.department as string)
  if (previewRole && effectiveRole !== payload.role) {
    requestHeaders.set('x-preview-role', previewRole)
    requestHeaders.set('x-real-role', payload.role as string)
  }
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  // Expose preview header to client via response header (optional)
  if (previewRole && effectiveRole !== payload.role) {
    response.headers.set('x-preview-role', previewRole)
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}