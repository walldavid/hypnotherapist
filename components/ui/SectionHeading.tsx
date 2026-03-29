interface SectionHeadingProps {
  title: string
  subtitle?: string
  centered?: boolean
}

export function SectionHeading({ title, subtitle, centered = true }: SectionHeadingProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      <h2 className="font-heading text-4xl md:text-5xl text-[var(--color-indigo-deep)] mb-4">{title}</h2>
      {subtitle && (
        <p className="font-body text-lg text-[var(--color-lavender)] max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  )
}
