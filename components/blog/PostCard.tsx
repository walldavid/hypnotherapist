import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types'
import { urlForImage } from '@/sanity/lib/image'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const imageUrl = post.heroImage
    ? urlForImage(post.heroImage).width(600).height(400).url()
    : 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&h=400&q=80'

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IE', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  return (
    <Link href={`/blog/${post.slug.current}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          {formattedDate && (
            <time className="font-body text-xs text-[var(--color-lavender)] uppercase tracking-wider">
              {formattedDate}
            </time>
          )}
          <h3 className="font-heading text-xl text-[var(--color-indigo-deep)] mt-2 mb-2 group-hover:text-[var(--color-lavender)] transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="font-body text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
          )}
          <span className="inline-block mt-4 font-body text-sm text-[var(--color-lavender)] font-semibold group-hover:underline">
            Read more →
          </span>
        </div>
      </article>
    </Link>
  )
}
