import { groq } from 'next-sanity'

export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id, title, slug, price, category, thumbnailImage, duration, benefitTags, featured, sampleAudio
  }
`

export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true][0...3] {
    _id, title, slug, price, category, thumbnailImage, duration, benefitTags, sampleAudio
  }
`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id, title, slug, description, price, category, audioFile, sampleAudio,
    thumbnailImage, duration, benefitTags, stripePriceId, stripeProductId, featured
  }
`

export const productsByCategoryQuery = groq`
  *[_type == "product" && category == $category] | order(_createdAt desc) {
    _id, title, slug, price, category, thumbnailImage, duration, benefitTags, sampleAudio
  }
`

export const allPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, excerpt, heroImage, publishedAt, author
  }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, excerpt, heroImage, publishedAt, author, body
  }
`

export const allPostSlugsQuery = groq`
  *[_type == "post"] { "slug": slug.current }
`

export const allProductSlugsQuery = groq`
  *[_type == "product"] { "slug": slug.current }
`

export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(_createdAt asc) {
    _id, name, quote, rating
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    siteTitle, tagline, heroImage, socialLinks
  }
`

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id, title, slug, heroImage, body, faqs
  }
`
