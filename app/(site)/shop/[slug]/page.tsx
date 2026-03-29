import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { productBySlugQuery, allProductSlugsQuery } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import { Badge } from '@/components/ui/Badge'
import { AudioPlayer } from '@/components/shop/AudioPlayer'
import { BuyButton } from '@/components/shop/BuyButton'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'

export async function generateStaticParams() {
  try {
    const products = await client.fetch(allProductSlugsQuery)
    return products.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await client.fetch(productBySlugQuery, { slug })
  if (!product) return {}
  return {
    title: product.title,
    description: `Download "${product.title}" self-hypnosis audio — €${(product.price / 100).toFixed(2)}`,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await client.fetch(productBySlugQuery, { slug })
  if (!product) notFound()

  const imageUrl = product.thumbnailImage
    ? urlForImage(product.thumbnailImage).width(800).height(500).url()
    : 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=500&q=80'

  return (
    <div className="pt-24 pb-20 bg-[var(--color-lilac-pale)] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          {/* Hero image */}
          <div className="relative h-72 md:h-96">
            <Image src={imageUrl} alt={product.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 flex gap-2">
              <Badge label={product.category} category={product.category} />
              {product.duration && (
                <span className="bg-white/90 text-[var(--color-indigo-deep)] font-body text-xs font-semibold px-3 py-1 rounded-full">
                  {product.duration}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-indigo-deep)] mb-3">
                  {product.title}
                </h1>
                {product.benefitTags && product.benefitTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.benefitTags.map((tag: string) => (
                      <span key={tag} className="font-body text-xs text-[var(--color-lavender)] bg-[var(--color-lilac-soft)] px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <p className="font-heading text-4xl text-[var(--color-lavender)] font-bold mb-4">
                  €{(product.price / 100).toFixed(2)}
                </p>
                <BuyButton slug={product.slug.current} price={product.price} />
              </div>
            </div>

            {/* Sample audio player */}
            {product.sampleAudio && (
              <div className="mb-8">
                <AudioPlayer src={product.sampleAudio} title="Listen to a 30-second preview" />
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="prose-custom">
                <PortableTextRenderer value={product.description} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
