import { client } from '@/sanity/lib/client'
import { allPostsQuery } from '@/sanity/lib/queries'
import { PostCard } from '@/components/blog/PostCard'
import { SectionHeading } from '@/components/ui/SectionHeading'

export default async function BlogPage() {
  const posts = await client.fetch(allPostsQuery).catch(() => [])

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[var(--color-lilac-pale)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Hypnotherapy Blog"
          subtitle="Insights, tips, and research on the power of hypnotherapy and self-hypnosis"
        />

        {posts.length === 0 ? (
          <div className="mt-12 text-center py-20">
            <p className="font-body text-lg text-gray-500">No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
