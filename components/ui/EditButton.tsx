'use client'

import { useAdmin } from '@/lib/admin-context'

export function EditButton({
  schemaType,
  documentId,
}: {
  schemaType: string
  documentId: string
}) {
  const { isAdmin } = useAdmin()
  if (!isAdmin) return null

  return (
    <a
      href={`/studio/structure/${schemaType};${documentId}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-lavender)] px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-indigo-deep)]"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
      Edit
    </a>
  )
}
