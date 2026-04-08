'use server'

import { cookies } from 'next/headers'
import { signToken, SESSION_COOKIE_NAME, SEVEN_DAYS } from '@/lib/auth'
import { timingSafeEqual } from 'crypto'

interface LoginState {
  success: boolean
  error: string | null
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD not configured')
    return { success: false, error: 'Authentication is not configured.' }
  }

  // Timing-safe comparison for both email and password
  const emailMatch =
    email.length === adminEmail.length &&
    timingSafeEqual(Buffer.from(email), Buffer.from(adminEmail))

  const passwordMatch =
    password.length === adminPassword.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword))

  if (!emailMatch || !passwordMatch) {
    return { success: false, error: 'Invalid credentials.' }
  }

  const token = await signToken({ email })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SEVEN_DAYS,
  })

  return { success: true, error: null }
}
