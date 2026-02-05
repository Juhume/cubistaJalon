'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { artworks } from '@/lib/artworks'
import { useInView } from '@/lib/hooks'

interface FeaturedWorksProps {
  locale: 'es' | 'en'
}

/* Each featured work observes its own visibility for per-item scroll reveal */
function FeaturedWorkItem({
  artwork,
  locale,
  index,
}: {
  artwork: (typeof artworks)[number]
  locale: 'es' | 'en'
  index: number
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isEven = index % 2 === 0
  const num = String(index + 1).padStart(2, '0')

  return (
    <Link
      ref={ref}
      key={artwork.id}
      href={`/obra/${artwork.id}`}
      className="group block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s var(--ease-out), transform 0.7s var(--ease-out)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 items-end">
        {/* Image */}
        <div className={`${
          isEven
            ? 'lg:col-span-7 lg:col-start-1'
            : 'lg:col-span-7 lg:col-start-6'
        }`}>
          <div className="relative crop-marks">
            <div className={`relative overflow-hidden bg-[hsl(var(--muted))] ${
              index === 0 ? 'aspect-[4/5]' : index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[5/4]'
            }`}>
              <Image
                src={artwork.imageUrl}
                alt={locale === 'es' ? artwork.title : artwork.titleEn}
                fill
                className="object-cover transition-transform group-hover:scale-[1.02]"
                style={{ transitionDuration: '0.8s', transitionTimingFunction: 'var(--ease-out)' }}
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            </div>
          </div>
        </div>

        {/* Text — offset on the opposite side */}
        <div className={`${
          isEven
            ? 'lg:col-span-4 lg:col-start-9 lg:pl-8'
            : 'lg:col-span-4 lg:col-start-1 lg:pr-8'
        }`}>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-body text-xs text-[hsl(var(--foreground-muted))]">
              {num}
            </span>
            <span className="w-8 h-px bg-[hsl(var(--accent))]" />
          </div>

          <h3 className="font-display text-xl sm:text-2xl text-[hsl(var(--foreground))] leading-[1.1] mb-2 group-hover:text-[hsl(var(--accent))]"
            style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}
          >
            {locale === 'es' ? artwork.title : artwork.titleEn}
          </h3>

          <p className="font-body text-sm text-[hsl(var(--foreground))]">
            {artwork.year} &middot; {locale === 'es' ? artwork.technique : artwork.techniqueEn}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function FeaturedWorks({ locale }: FeaturedWorksProps) {
  const featuredArtworks = useMemo(() => artworks.filter(a => a.featured).slice(0, 5), [])
  const { ref: sectionRef, isVisible } = useInView(0.05)
  const { ref: ctaRef, isVisible: ctaVisible } = useInView(0.3)

  const content = {
    es: { label: 'Obras seleccionadas', viewAll: 'Catálogo completo' },
    en: { label: 'Selected works', viewAll: 'Full catalogue' },
  }

  const t = content[locale]

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <div className="container-gallery">
        {/* Section label */}
        <div
          className="mb-16 sm:mb-20 flex items-center gap-3"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity var(--motion-slow) var(--ease-out)`,
          }}
        >
          <span className="w-2 h-2 bg-[hsl(var(--accent))]" aria-hidden="true" />
          <span className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground))]">
            {t.label}
          </span>
        </div>

        {/* Editorial staggered layout */}
        <div className="space-y-20 sm:space-y-28 lg:space-y-36">
          {featuredArtworks.map((artwork, index) => (
            <FeaturedWorkItem
              key={artwork.id}
              artwork={artwork}
              locale={locale}
              index={index}
            />
          ))}
        </div>

        {/* View all */}
        <div
          ref={ctaRef}
          className="mt-20 sm:mt-28 pt-8 border-t border-[hsl(var(--border))]"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity var(--motion-slow) var(--ease-out), transform var(--motion-slow) var(--ease-out)`,
          }}
        >
          <Link
            href="/obra"
            className="inline-flex items-center gap-3 py-2.5 px-5 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent))]"
            style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}
          >
            {t.viewAll}
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
