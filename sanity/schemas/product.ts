import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'price', title: 'Price (pence)', type: 'number', validation: (R) => R.required().min(0) }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Sleep', value: 'sleep' },
          { title: 'Anxiety', value: 'anxiety' },
          { title: 'Confidence', value: 'confidence' },
          { title: 'Weight Management', value: 'weight' },
          { title: 'Stress', value: 'stress' },
          { title: 'General Wellbeing', value: 'general' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'audioFile', title: 'Audio File (S3 Key)', type: 'string' }),
    defineField({ name: 'sampleAudio', title: 'Sample Audio URL (public, 30s)', type: 'url' }),
    defineField({ name: 'thumbnailImage', title: 'Thumbnail Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'duration', title: 'Duration', type: 'string', description: 'e.g. "25 minutes"' }),
    defineField({ name: 'benefitTags', title: 'Benefit Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'stripePriceId', title: 'Stripe Price ID', type: 'string' }),
    defineField({ name: 'stripeProductId', title: 'Stripe Product ID', type: 'string' }),
    defineField({ name: 'featured', title: 'Featured on Homepage', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', media: 'thumbnailImage', price: 'price' },
    prepare({ title, media, price }: any) {
      return { title, media, subtitle: price ? `€${(price / 100).toFixed(2)}` : 'No price set' }
    },
  },
})
