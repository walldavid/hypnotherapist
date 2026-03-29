import { Hero } from '@/components/home/Hero'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { TestimonialCarousel } from '@/components/home/TestimonialCarousel'
import { CTABanner } from '@/components/home/CTABanner'
import { client } from '@/sanity/lib/client'
import { featuredProductsQuery, testimonialsQuery } from '@/sanity/lib/queries'

export default async function HomePage() {
  const [products, testimonials] = await Promise.all([
    client.fetch(featuredProductsQuery).catch(() => []),
    client.fetch(testimonialsQuery).catch(() => []),
  ])

  return (
    <>
      <Hero />
      {products.length > 0 && <FeaturedProducts products={products} />}
      {testimonials.length > 0 && <TestimonialCarousel testimonials={testimonials} />}
      <CTABanner />
    </>
  )
}
