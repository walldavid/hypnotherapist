import { ContactForm } from '@/components/contact/ContactForm'

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-[var(--color-lilac-pale)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl text-[var(--color-indigo-deep)] mb-4">Get In Touch</h1>
          <p className="font-body text-lg text-[var(--color-lavender)]">
            Have a question about our sessions? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <ContactForm />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-xl text-[var(--color-indigo-deep)] mb-2">Email</h3>
            <p className="font-body text-[var(--color-lavender)]">hello@hypnotherapy.ie</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-xl text-[var(--color-indigo-deep)] mb-2">Response Time</h3>
            <p className="font-body text-gray-600">We aim to respond within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
