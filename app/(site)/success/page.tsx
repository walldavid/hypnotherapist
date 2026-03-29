'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'polling' | 'ready' | 'error'>('polling')
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/order-status?session_id=${sessionId}`)
        const data = await res.json()

        if (data.token) {
          setDownloadToken(data.token)
          setStatus('ready')
          return true
        }
      } catch {
        // continue polling
      }
      return false
    }

    const interval = setInterval(async () => {
      setAttempts((a) => {
        if (a >= 10) {
          setStatus('error')
          clearInterval(interval)
          return a
        }
        return a + 1
      })

      const done = await poll()
      if (done) clearInterval(interval)
    }, 2000)

    // Initial check
    poll()

    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <div className="min-h-screen bg-[var(--color-lilac-pale)] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        {status === 'polling' && (
          <>
            <div className="w-16 h-16 border-4 border-[var(--color-lavender)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="font-heading text-3xl text-[var(--color-indigo-deep)] mb-3">Payment Successful!</h1>
            <p className="font-body text-gray-600">Preparing your download&hellip;</p>
            <p className="font-body text-sm text-gray-400 mt-2">(This usually takes a few seconds)</p>
          </>
        )}

        {status === 'ready' && downloadToken && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl text-[var(--color-indigo-deep)] mb-3">Your Audio is Ready!</h1>
            <p className="font-body text-gray-600 mb-8">
              Thank you for your purchase. Click below to download your self-hypnosis session.
            </p>
            <a
              href={`/api/download/${downloadToken}`}
              className="inline-flex items-center justify-center w-full px-8 py-4 font-body font-semibold rounded-full bg-[var(--color-lavender)] text-white hover:bg-[var(--color-lavender-light)] transition-colors shadow-lg text-lg"
            >
              ⬇ Download Your Audio
            </a>
            <p className="font-body text-xs text-gray-400 mt-4">
              This link is single-use and expires in 24 hours. Please download now.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl text-[var(--color-indigo-deep)] mb-3">Taking Longer Than Expected</h1>
            <p className="font-body text-gray-600 mb-6">
              Your payment was received. Please check your email for your download link, or contact us if you need assistance.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 font-body font-semibold rounded-full bg-[var(--color-lavender)] text-white hover:bg-[var(--color-lavender-light)] transition-colors"
            >
              Contact Support
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-lilac-pale)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--color-lavender)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
