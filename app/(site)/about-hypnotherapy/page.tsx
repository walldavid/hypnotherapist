import Image from 'next/image'
import { client } from '@/sanity/lib/client'
import { pageBySlugQuery } from '@/sanity/lib/queries'
import { FAQAccordion } from '@/components/about-hypnotherapy/FAQAccordion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EditButton } from '@/components/ui/EditButton'

const defaultFaqs = [
  {
    question: 'What is hypnotherapy?',
    answer: 'Hypnotherapy is a form of complementary therapy that uses hypnosis — a natural state of focused relaxation — to help people make positive changes in their lives. During hypnosis, you are always in control and fully aware.',
  },
  {
    question: 'Is hypnotherapy safe?',
    answer: 'Yes, hypnotherapy is completely safe when practised responsibly. You cannot be made to do anything against your will. The hypnotic state is simply a natural, focused state of relaxation.',
  },
  {
    question: 'What can self-hypnosis help with?',
    answer: 'Self-hypnosis has been shown to be effective for sleep improvement, anxiety reduction, confidence building, weight management, stress relief, phobias, and habit change among many other applications.',
  },
  {
    question: 'How quickly will I see results?',
    answer: 'Many people notice positive changes after just a few sessions. Like any skill, self-hypnosis improves with regular practice. Most people experience significant benefits within 2–4 weeks of consistent use.',
  },
  {
    question: 'Do I need any experience to use self-hypnosis audios?',
    answer: 'No experience is needed. Our audio sessions guide you step-by-step into a relaxed hypnotic state. Simply find a comfortable, quiet place, put on headphones, and follow the voice guidance.',
  },
  {
    question: 'Can I use these audios every day?',
    answer: 'Absolutely — in fact, daily use is encouraged for best results. Regular practice reinforces positive changes and helps build new neural pathways in the brain.',
  },
]

export default async function AboutHypnotherapyPage() {
  const page = await client.fetch(pageBySlugQuery, { slug: 'about-hypnotherapy' }).catch(() => null)
  const faqs = page?.faqs?.length > 0 ? page.faqs : defaultFaqs

  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&q=80"
          alt="Calm water meditation"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-indigo-deep)]/80 to-[var(--color-lavender)]/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="font-heading text-5xl md:text-7xl">About Hypnotherapy</h1>
              {page?._id && <EditButton schemaType="page" documentId={page._id} />}
            </div>
            <p className="font-body text-lg text-[var(--color-lilac-soft)]/90 max-w-2xl">
              Discover the science and art of hypnotherapy and how it can transform your life
            </p>
          </div>
        </div>
      </section>

      {/* What is hypnotherapy */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-4xl text-[var(--color-indigo-deep)] mb-6">What is Hypnotherapy?</h2>
            <p className="font-body text-gray-600 leading-relaxed mb-4">
              Hypnotherapy combines the power of hypnosis with therapeutic techniques to help you achieve positive change.
              It works by accessing the subconscious mind — the part that drives our habits, emotions, and behaviours.
            </p>
            <p className="font-body text-gray-600 leading-relaxed mb-4">
              During hypnosis, you enter a natural state of focused relaxation where the conscious mind becomes quieter,
              allowing positive suggestions to be absorbed more readily. You remain fully aware and in complete control at all times.
            </p>
            <p className="font-body text-gray-600 leading-relaxed">
              Self-hypnosis takes this one step further — giving you the tools to guide yourself into this beneficial
              state whenever you choose, from the comfort of your own home.
            </p>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&q=80"
              alt="Peaceful meditation"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[var(--color-lilac-pale)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="What Can Hypnotherapy Help With?" />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '😴', title: 'Better Sleep', desc: 'Quieten a racing mind and drift into deep, restorative sleep.' },
              { icon: '🧘', title: 'Reduced Anxiety', desc: 'Retrain your nervous system to respond calmly to stress.' },
              { icon: '💪', title: 'Greater Confidence', desc: 'Build unshakeable self-belief from the inside out.' },
              { icon: '⚖️', title: 'Weight Management', desc: 'Change your relationship with food and your body.' },
              { icon: '🌊', title: 'Stress Relief', desc: 'Find your inner calm no matter what life throws at you.' },
              { icon: '🎯', title: 'Focus & Performance', desc: 'Unlock peak mental performance for work, sport, or study.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-heading text-xl text-[var(--color-indigo-deep)] mb-2">{item.title}</h3>
                <p className="font-body text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading title="Frequently Asked Questions" />
        <div className="mt-10">
          <FAQAccordion faqs={faqs} />
        </div>
      </section>
    </div>
  )
}
