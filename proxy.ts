import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE_NAME = 'admin-session'

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the login page through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const secret = getSecret()

  if (!token || !secret) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/studio/:path*', '/admin/:path*'],
}
