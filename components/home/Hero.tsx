'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
        alt="Calm misty mountains"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69]/70 via-[#7B5EA7]/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="font-heading text-5xl md:text-7xl text-white mb-6 leading-tight"
        >
          Transform Your Mind,
          <br />
          <span className="text-[var(--color-lilac-soft)]">Transform Your Life</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="font-body text-lg md:text-xl text-[var(--color-lilac-soft)]/90 mb-10 max-w-2xl mx-auto"
        >
          Professional self-hypnosis audio sessions to help you sleep better, reduce anxiety,
          and unlock your true potential — from the comfort of your home.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-body font-semibold rounded-full bg-[var(--color-lavender)] text-white hover:bg-[var(--color-lavender-light)] shadow-md hover:shadow-lg transition-all duration-200"
          >
            Browse Sessions
          </Link>
          <Link
            href="/about-hypnotherapy"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-body font-semibold rounded-full border-2 border-white text-white hover:bg-white/10 transition-all duration-200"
          >
            Learn More
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-white/70 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
