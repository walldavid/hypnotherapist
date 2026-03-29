import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { urlForImage } from '@/sanity/lib/image'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.thumbnailImage
    ? urlForImage(product.thumbnailImage).width(400).height(300).url()
    : 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&q=80'

  const price = (product.price / 100).toFixed(2)

  return (
    <Link href={`/shop/${product.slug.current}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.featured && (
            <div className="absolute top-3 right-3">
              <Badge label="Featured" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge label={product.category} category={product.category} />
            {product.duration && (
              <span className="font-body text-xs text-gray-500">{product.duration}</span>
            )}
          </div>

          <h3 className="font-heading text-xl text-[var(--color-indigo-deep)] mb-2 group-hover:text-[var(--color-lavender)] transition-colors">
            {product.title}
          </h3>

          <div className="flex items-center justify-between mt-4">
            <span className="font-body font-bold text-xl text-[var(--color-lavender)]">€{price}</span>
            <span className="font-body text-sm text-white bg-[var(--color-lavender)] px-4 py-1.5 rounded-full group-hover:bg-[var(--color-indigo-deep)] transition-colors">
              Listen &amp; Buy
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
