'use client'

import Link from 'next/link'
import { MainLayout, useLocale } from '@/components/layout/main-layout'

function NotFoundContent() {
  const { locale } = useLocale()
  const t = {
    es: {
      subtitle: 'Fragmento perdido',
      message: 'Esta perspectiva no existe en el catálogo. Quizás el plano que buscas se descompuso en otros.',
      cta: 'Volver al inicio',
      catalogue: 'Explorar catálogo',
    },
    en: {
      subtitle: 'Lost fragment',
      message: 'This perspective does not exist in the catalogue. Perhaps the plane you seek has decomposed into others.',
      cta: 'Back to home',
      catalogue: 'Explore catalogue',
    },
  }[locale]

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-24 sm:pt-28">
      <div className="relative px-6 max-w-lg">
        {/* Cubist-inspired geometric composition */}
        <div className="relative mb-12">
          {/* Large ghost number */}
          <p
            className="font-display text-[10rem] sm:text-[14rem] leading-none select-none text-[hsl(var(--foreground))]"
            style={{ opacity: 0.04 }}
            aria-hidden="true"
          >
            404
          </p>

          {/* Geometric fragments overlaid — like cubist facets */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {/* Siena rectangle — tilted */}
            <div
              className="absolute w-16 h-24 bg-[hsl(var(--accent))]"
              style={{ opacity: 0.12, transform: 'rotate(-12deg) translate(-30px, -10px)' }}
            />
            {/* Ultramarino square */}
            <div
              className="absolute w-20 h-20 border-2 border-[hsl(var(--ultra))]"
              style={{ opacity: 0.2, transform: 'rotate(8deg) translate(20px, 5px)' }}
            />
            {/* Small dark accent */}
            <div
              className="absolute w-3 h-3 bg-[hsl(var(--foreground))]"
              style={{ opacity: 0.15, transform: 'translate(45px, -35px)' }}
            />
          </div>

          {/* Subtitle floats over the composition */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="font-annotation text-sm text-[hsl(var(--foreground-muted))] italic">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Siena accent line */}
        <div className="w-8 h-[2px] bg-[hsl(var(--accent))] mx-auto mb-6" />

        {/* Message */}
        <p className="font-body text-sm text-[hsl(var(--foreground-muted))] text-center leading-relaxed mb-10 max-w-xs mx-auto">
          {t.message}
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/"
            className="inline-flex items-center gap-2 py-2.5 px-5 font-body text-sm
              bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]"
            style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </svg>
            {t.cta}
          </Link>
          <Link href="/obra"
            className="inline-flex items-center gap-2 py-2.5 px-5 font-body text-sm
              text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))]"
            style={{ transition: 'all var(--motion-normal) var(--ease-out)' }}>
            {t.catalogue}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function NotFound() {
  return <MainLayout><NotFoundContent /></MainLayout>
}
