'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface BuyButtonProps {
  slug: string
  price: number
}

export function BuyButton({ slug, price }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBuy = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start checkout')
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleBuy}
        disabled={loading}
        size="lg"
        className="w-full sm:w-auto"
      >
        {loading ? 'Redirecting to checkout…' : `Buy Now — €${(price / 100).toFixed(2)}`}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-body">{error}</p>
      )}
    </div>
  )
}
