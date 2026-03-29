'use client'

import { useActionState } from 'react'
import { submitContact } from '@/app/(site)/contact/actions'
import { Button } from '@/components/ui/Button'

const initialState = { success: false, error: null as string | null }

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState)

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-heading text-2xl text-green-800 mb-2">Message Sent!</h3>
        <p className="font-body text-green-600">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-body text-red-600 text-sm">{state.error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block font-body text-sm font-semibold text-[var(--color-indigo-deep)] mb-2">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-lilac-soft)] bg-[var(--color-lilac-pale)] focus:outline-none focus:ring-2 focus:ring-[var(--color-lavender)] font-body text-gray-700"
          placeholder="Jane Smith"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-body text-sm font-semibold text-[var(--color-indigo-deep)] mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-lilac-soft)] bg-[var(--color-lilac-pale)] focus:outline-none focus:ring-2 focus:ring-[var(--color-lavender)] font-body text-gray-700"
          placeholder="jane@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block font-body text-sm font-semibold text-[var(--color-indigo-deep)] mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-lilac-soft)] bg-[var(--color-lilac-pale)] focus:outline-none focus:ring-2 focus:ring-[var(--color-lavender)] font-body text-gray-700 resize-none"
          placeholder="How can we help you?"
        />
      </div>

      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
