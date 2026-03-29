'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { clsx } from 'clsx'

const categories = [
  { value: '', label: 'All' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'weight', label: 'Weight Management' },
  { value: 'stress', label: 'Stress' },
  { value: 'general', label: 'General Wellbeing' },
]

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') || ''

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleSelect(cat.value)}
          className={clsx(
            'px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-200',
            current === cat.value
              ? 'bg-[var(--color-lavender)] text-white shadow-md'
              : 'bg-[var(--color-lilac-soft)] text-[var(--color-indigo-deep)] hover:bg-[var(--color-lavender)]/20'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
