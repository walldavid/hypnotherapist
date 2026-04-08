import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { client } from '@/sanity/lib/client'
import { productBySlugQuery } from '@/sanity/lib/queries'

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json()

    if (!slug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 })
    }

    const product = await client.fetch(productBySlugQuery, { slug })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.stripePriceId) {
      return NextResponse.json({ error: 'Product not configured for purchase' }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        sanityProductId: product._id,
        audioKey: product.audioFile || '',
        productTitle: product.title,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${slug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
