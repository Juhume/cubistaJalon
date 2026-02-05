'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { artworks } from '@/lib/artworks'

interface HeroSectionProps {
  locale: 'es' | 'en'
}

export function HeroSection({ locale }: HeroSectionProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const heroWork = artworks.find(a => a.featured) || artworks[0]

  const content = {
    es: {
      cta: 'Explorar catálogo',
    },
    en: {
      cta: 'Explore catalogue',
    },
  }

  const t = content[locale]

  return (
    <section className="relative w-full overflow-hidden bg-[hsl(var(--background-dark))]" style={{ height: '100svh' }}>

      {/* Background image — full bleed, darkened */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src={heroWork.imageUrl || "/placeholder.svg"}
          alt={locale === 'es' ? heroWork.title : heroWork.titleEn}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{
            opacity: phase >= 1 ? 0.35 : 0,
            transform: phase >= 1 ? 'scale(1.02)' : 'scale(1.06)',
            transition: 'opacity 1.4s var(--ease-out), transform 2s var(--ease-out)',
          }}
        />
      </div>

      {/* Siena horizontal rule — the structural anchor */}
      <div
        className="absolute z-[3] left-0 right-0"
        style={{
          top: '62%',
          height: '2px',
          background: 'hsl(var(--accent))',
          opacity: phase >= 1 ? 0.7 : 0,
          transform: phase >= 1 ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 1s var(--ease-smooth) 200ms, opacity 0.6s var(--ease-out) 200ms',
        }}
      />

      {/* Content */}
      <div className="relative z-[10] container-gallery h-full flex flex-col justify-end pb-12 sm:pb-16 lg:pb-20">

        {/* Artist name — monumental typography */}
        <h1 className="mb-6 sm:mb-8">
          <span
            className="block font-display text-[clamp(3.5rem,12vw,11rem)] leading-[0.85] tracking-[-0.02em] text-[hsl(var(--foreground-light))]"
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'none' : 'translateY(40px)',
              transition: 'opacity 0.8s var(--ease-out), transform 1s var(--ease-out)',
            }}
          >
            Cubista
          </span>
          <span
            className="block font-display text-[clamp(3.5rem,12vw,11rem)] leading-[0.85] tracking-[-0.02em] text-[hsl(var(--foreground-light))]"
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'none' : 'translateY(40px)',
              transition: 'opacity 0.8s var(--ease-out) 100ms, transform 1s var(--ease-out) 100ms',
            }}
          >
            Jalón
          </span>
        </h1>

        {/* Bottom row: metadata + CTA */}
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'none' : 'translateY(12px)',
            transition: 'opacity var(--motion-slow) var(--ease-out), transform var(--motion-slow) var(--ease-out)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="w-6 h-px bg-[hsl(var(--accent))]" aria-hidden="true" />
            <span className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-light-muted))]">
              Madrid, 1953
            </span>
          </div>

          <Link
            href="/obra"
            className="inline-flex items-center gap-3 py-2.5 px-5 bg-[hsl(var(--foreground-light))] text-[hsl(var(--background-dark))] font-body text-sm hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground-light))]"
            style={{ transition: 'background-color var(--motion-normal) var(--ease-out), color var(--motion-normal) var(--ease-out)' }}
          >
            {t.cta}
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
