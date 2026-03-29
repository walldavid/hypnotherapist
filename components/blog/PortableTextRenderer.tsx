import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'

const components = {
  types: {
    image: ({ value }: any) => {
      const url = urlForImage(value).width(800).url()
      return (
        <figure className="my-8">
          <div className="relative w-full h-80 rounded-xl overflow-hidden">
            <Image src={url} alt={value.alt || ''} fill className="object-cover" />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2 font-body italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h2: ({ children }: any) => <h2 className="font-heading text-3xl text-[var(--color-indigo-deep)] mt-10 mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="font-heading text-2xl text-[var(--color-indigo-deep)] mt-8 mb-3">{children}</h3>,
    normal: ({ children }: any) => <p className="font-body text-gray-700 leading-relaxed mb-4">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[var(--color-lavender)] pl-6 my-6 font-heading text-xl italic text-[var(--color-indigo-deep)]/80">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-semibold text-[var(--color-indigo-deep)]">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    link: ({ value, children }: any) => (
      <a href={value?.href} className="text-[var(--color-lavender)] underline hover:text-[var(--color-indigo-deep)]" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-4 font-body text-gray-700 space-y-1">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 font-body text-gray-700 space-y-1">{children}</ol>,
  },
}

export function PortableTextRenderer({ value }: { value: any[] }) {
  return <PortableText value={value} components={components} />
}
