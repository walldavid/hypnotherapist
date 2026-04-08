import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
