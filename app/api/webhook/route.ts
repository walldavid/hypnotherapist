import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { writeClient } from '@/sanity/lib/client'
import { storeDownloadToken, storeSessionToken } from '@/lib/kv'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    const token = randomBytes(32).toString('hex')
    const expiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    const audioKey = session.metadata?.audioKey || ''

    // Store download token in KV
    await storeDownloadToken(token, { audioKey, expiry })

    // Store session → token mapping for polling
    await storeSessionToken(session.id, token)

    // Create order document in Sanity
    try {
      await writeClient.create({
        _type: 'order',
        stripeSessionId: session.id,
        customerEmail: session.customer_details?.email || '',
        product: session.metadata?.sanityProductId
          ? { _type: 'reference', _ref: session.metadata.sanityProductId }
          : undefined,
        downloadToken: token,
        tokenExpiry: new Date(expiry).toISOString(),
        fulfilled: true,
      })
    } catch (err) {
      console.error('Failed to create order in Sanity:', err)
      // Don't fail the webhook — token is already stored in KV
    }
  }

  return NextResponse.json({ received: true })
}
