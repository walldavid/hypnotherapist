import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="relative h-72 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80"
          alt="Professional therapist"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-indigo-deep)]/80 to-[var(--color-lavender)]/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-heading text-5xl md:text-7xl text-white">About Us</h1>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
              alt="Hypnotherapist"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-4xl text-[var(--color-indigo-deep)] mb-6">Your Guide to Inner Peace</h2>
            <p className="font-body text-gray-600 leading-relaxed mb-4">
              Welcome to Hypnotherapy.ie. With over a decade of experience in clinical hypnotherapy,
              I&apos;ve helped thousands of clients transform their lives using the remarkable power of
              the subconscious mind.
            </p>
            <p className="font-body text-gray-600 leading-relaxed mb-4">
              My approach combines evidence-based hypnotherapy techniques with a deep understanding of
              how the mind works. Each audio session I create is carefully crafted to guide you into
              a deeply relaxed state where real, lasting change becomes possible.
            </p>
            <p className="font-body text-gray-600 leading-relaxed mb-6">
              Whether you&apos;re struggling with sleep, anxiety, or confidence, my mission is to give you
              the tools to transform your own mind — anytime, anywhere.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center font-body font-semibold text-[var(--color-lavender)] hover:text-[var(--color-indigo-deep)] transition-colors"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[var(--color-lilac-pale)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl text-[var(--color-indigo-deep)] text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Evidence-Based', desc: 'Every technique we use is backed by scientific research and clinical practice.' },
              { title: 'Empowering', desc: 'We give you the tools to be your own healer, creating lasting independence.' },
              { title: 'Accessible', desc: 'Professional hypnotherapy quality at a fraction of in-person session costs.' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <h3 className="font-heading text-2xl text-[var(--color-indigo-deep)] mb-3">{v.title}</h3>
                <p className="font-body text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
