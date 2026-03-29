import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({ name: 'stripeSessionId', title: 'Stripe Session ID', type: 'string' }),
    defineField({ name: 'customerEmail', title: 'Customer Email', type: 'string' }),
    defineField({ name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }] }),
    defineField({ name: 'downloadToken', title: 'Download Token', type: 'string' }),
    defineField({ name: 'tokenExpiry', title: 'Token Expiry', type: 'datetime' }),
    defineField({ name: 'downloadedAt', title: 'Downloaded At', type: 'datetime' }),
    defineField({ name: 'fulfilled', title: 'Fulfilled', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { email: 'customerEmail', session: 'stripeSessionId', fulfilled: 'fulfilled' },
    prepare({ email, session, fulfilled }: any) {
      return { title: email || 'Unknown', subtitle: `${session} — ${fulfilled ? '✓ Fulfilled' : 'Pending'}` }
    },
  },
})
