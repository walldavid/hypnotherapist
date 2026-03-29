import { Suspense } from 'react'
import { client } from '@/sanity/lib/client'
import { allProductsQuery, productsByCategoryQuery } from '@/sanity/lib/queries'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { CategoryFilter } from '@/components/shop/CategoryFilter'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams

  const products = category
    ? await client.fetch(productsByCategoryQuery, { category }).catch(() => [])
    : await client.fetch(allProductsQuery).catch(() => [])

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[var(--color-lilac-pale)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Self-Hypnosis Audio Sessions"
          subtitle="Download professional hypnotherapy sessions and begin your transformation"
        />

        <div className="mt-8 mb-10">
          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>
        </div>

        <ProductGrid products={products} />
      </div>
    </div>
  )
}
