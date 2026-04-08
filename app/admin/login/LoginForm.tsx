'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'

const initialState = { success: false, error: null as string | null }

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      router.push('/studio')
    }
  }, [state.success, router])

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-body text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-body text-sm font-semibold text-[var(--color-indigo-deep)]"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-xl border border-[var(--color-lilac-soft)] bg-[var(--color-lilac-pale)] px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-lavender)]"
          placeholder="admin@hypnotherapy.ie"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-body text-sm font-semibold text-[var(--color-indigo-deep)]"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="w-full rounded-xl border border-[var(--color-lilac-soft)] bg-[var(--color-lilac-pale)] px-4 py-3 font-body text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-lavender)]"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--color-indigo-deep)] px-6 py-3 font-body font-semibold text-white transition-colors hover:bg-[var(--color-lavender)] disabled:opacity-50"
      >
        {pending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
