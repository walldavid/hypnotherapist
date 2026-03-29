import { NextRequest, NextResponse } from 'next/server'
import { getTokenBySession } from '@/lib/kv'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  const token = await getTokenBySession(sessionId)

  if (token) {
    return NextResponse.json({ token })
  }

  return NextResponse.json({ token: null })
}
