import Link from 'next/link'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductCard } from '@/components/shop/ProductCard'
import { Product } from '@/types'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-20 bg-[var(--color-lilac-pale)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Featured Sessions"
          subtitle="Carefully crafted hypnotherapy audios to support your journey to wellbeing"
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 font-body font-semibold rounded-full bg-[var(--color-indigo-deep)] text-white hover:bg-[var(--color-lavender)] transition-colors duration-200"
          >
            View All Sessions →
          </Link>
        </div>
      </div>
    </section>
  )
}
