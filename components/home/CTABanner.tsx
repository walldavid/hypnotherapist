import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-[var(--color-indigo-deep)] to-[var(--color-lavender)]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
          Begin Your Journey Today
        </h2>
        <p className="font-body text-lg text-[var(--color-lilac-soft)]/90 mb-10 max-w-2xl mx-auto">
          Thousands of people have already transformed their lives with our self-hypnosis audio sessions.
          Download yours and start experiencing the difference within minutes.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-10 py-4 text-lg font-body font-semibold rounded-full bg-white text-[var(--color-indigo-deep)] hover:bg-[var(--color-lilac-soft)] transition-colors duration-200 shadow-lg"
        >
          Shop All Sessions
        </Link>
      </div>
    </section>
  )
}
