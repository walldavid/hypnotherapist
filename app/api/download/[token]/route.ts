import { NextRequest, NextResponse } from 'next/server'
import { getDownloadToken, markTokenUsed } from '@/lib/kv'
import { generatePresignedDownloadUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const data = await getDownloadToken(token)

  if (!data) {
    return new NextResponse('Download link has expired or is invalid.', { status: 410 })
  }

  if (data.used) {
    return new NextResponse('This download link has already been used.', { status: 410 })
  }

  if (Date.now() > data.expiry) {
    return new NextResponse('This download link has expired.', { status: 410 })
  }

  // Mark used BEFORE generating URL
  await markTokenUsed(token)

  try {
    const presignedUrl = await generatePresignedDownloadUrl(data.audioKey, 60)
    return NextResponse.redirect(presignedUrl, 302)
  } catch (err) {
    console.error('Failed to generate presigned URL:', err)
    return new NextResponse('Failed to generate download URL. Please contact support.', { status: 500 })
  }
}
