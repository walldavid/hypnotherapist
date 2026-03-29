import { clsx } from 'clsx'

const categoryColors: Record<string, string> = {
  sleep: 'bg-blue-100 text-blue-800',
  anxiety: 'bg-green-100 text-green-800',
  confidence: 'bg-yellow-100 text-yellow-800',
  weight: 'bg-pink-100 text-pink-800',
  stress: 'bg-orange-100 text-orange-800',
  general: 'bg-[var(--color-lilac-soft)] text-[var(--color-indigo-deep)]',
}

interface BadgeProps {
  label: string
  category?: string
  className?: string
}

export function Badge({ label, category, className }: BadgeProps) {
  const colorClass = category
    ? (categoryColors[category] || 'bg-[var(--color-lilac-soft)] text-[var(--color-indigo-deep)]')
    : 'bg-[var(--color-lilac-soft)] text-[var(--color-indigo-deep)]'
  return (
    <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-semibold font-body uppercase tracking-wide', colorClass, className)}>
      {label}
    </span>
  )
}
