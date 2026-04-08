import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'admin-session'
const SEVEN_DAYS = 7 * 24 * 60 * 60

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SEVEN_DAYS}s`)
    .sign(getSecret())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export { SESSION_COOKIE_NAME, SEVEN_DAYS }
