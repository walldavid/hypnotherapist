export interface Product {
  _id: string
  title: string
  slug: { current: string }
  description: any[] // Portable text
  price: number // in pence
  category: 'sleep' | 'anxiety' | 'confidence' | 'weight' | 'stress' | 'general'
  audioFile: string // S3 key
  sampleAudio: string // public URL
  thumbnailImage: any // Sanity image
  duration: string
  benefitTags: string[]
  stripePriceId: string
  stripeProductId: string
  featured: boolean
}

export interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  heroImage: any
  publishedAt: string
  author: string
  body: any[]
}

export interface Testimonial {
  _id: string
  name: string
  quote: string
  rating: number
}

export interface SiteSettings {
  siteTitle: string
  tagline: string
  heroImage: any
  socialLinks: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
}

export interface Order {
  _id: string
  stripeSessionId: string
  customerEmail: string
  product: { _ref: string }
  downloadToken: string
  tokenExpiry: string
  downloadedAt?: string
  fulfilled: boolean
}

export interface FAQ {
  question: string
  answer: string
}

export interface Page {
  _id: string
  title: string
  slug: { current: string }
  heroImage: any
  body: any[]
  faqs?: FAQ[]
}
