import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { postBySlugQuery, allPostSlugsQuery } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'
import { EditButton } from '@/components/ui/EditButton'

export async function generateStaticParams() {
  try {
    const posts = await client.fetch(allPostSlugsQuery)
    return posts.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch(postBySlugQuery, { slug })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch(postBySlugQuery, { slug })
  if (!post) notFound()

  const imageUrl = post.heroImage
    ? urlForImage(post.heroImage).width(1200).height(600).url()
    : 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&h=600&q=80'

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IE', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  return (
    <article className="pt-16 pb-20 min-h-screen">
      {/* Hero */}
      <div className="relative h-72 md:h-[500px] overflow-hidden">
        <Image src={imageUrl} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
          {formattedDate && (
            <time className="font-body text-sm text-white/70 uppercase tracking-wider">{formattedDate}</time>
          )}
          <div className="flex items-center gap-3 mt-2">
            <h1 className="font-heading text-4xl md:text-6xl text-white">{post.title}</h1>
            <EditButton schemaType="post" documentId={post._id} />
          </div>
          {post.author && (
            <p className="font-body text-white/80 mt-2">By {post.author}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {post.body && <PortableTextRenderer value={post.body} />}
      </div>
    </article>
  )
}
