'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { artworks } from '@/lib/artworks'
import { useInView } from '@/lib/hooks'

interface FeaturedWorksProps {
  locale: 'es' | 'en'
}

/* ─── Hero piece — the opening statement ─── */

function HeroPiece({
  artwork,
  locale,
}: {
  artwork: (typeof artworks)[number]
  locale: 'es' | 'en'
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
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const series = locale === 'es' ? artwork.series : artwork.seriesEn
  const title = locale === 'es' ? artwork.title : artwork.titleEn
  const description = locale === 'es' ? artwork.description : artwork.descriptionEn

  return (
    <Link
      ref={ref}
      href={`/obra/${artwork.id}`}
      className="group block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.8s var(--ease-out), transform 0.9s var(--ease-out)',
      }}
    >
      {/* Image — cinematic landscape, crop marks, max 10 columns */}
      <div className="max-w-[1200px]">
        <div className="relative crop-marks">
          <div className="relative overflow-hidden bg-[hsl(var(--muted))] aspect-[3/2] sm:aspect-[16/9]">
            <Image
              src={artwork.imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-[1.02]"
              style={{ transitionDuration: '1.2s', transitionTimingFunction: 'var(--ease-out)' }}
              sizes="(max-width: 1024px) 100vw, 85vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* Placard — below the image, in the reading flow */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 max-w-[1200px]">
        {/* Left: series + counter + title */}
        <div className="sm:col-span-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-body text-xs text-[hsl(var(--foreground-muted))]">01</span>
            <span
              className="w-8 h-px bg-[hsl(var(--accent))] group-hover:w-16"
              style={{ transition: 'width var(--motion-normal) var(--ease-out)' }}
            />
            <span className="font-body text-xs tracking-[0.1em] uppercase text-[hsl(var(--ultra))]">
              {series}
            </span>
          </div>

          <h3
            className="font-display text-2xl sm:text-3xl lg:text-[2.2rem] text-[hsl(var(--foreground))] leading-[1.08] group-hover:text-[hsl(var(--accent))]"
            style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}
          >
            {title}
          </h3>

          <p className="font-body text-sm text-[hsl(var(--foreground-muted))] mt-2">
            {artwork.year} &middot; {locale === 'es' ? artwork.technique : artwork.techniqueEn} &middot; {artwork.dimensions}
          </p>
        </div>

        {/* Right: description — only on hero */}
        <div className="sm:col-span-6 sm:col-start-7">
          <p className="font-body text-sm sm:text-base text-[hsl(var(--foreground-muted))] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* ─── Paired works — two side by side like a magazine spread ─── */

function PairedWorks({
  left,
  right,
  locale,
  startIndex,
}: {
  left: (typeof artworks)[number]
  right?: (typeof artworks)[number]
  locale: 'es' | 'en'
  startIndex: number // overall 1-based index for numbering
}) {
  const ref = useRef<HTMLDivElement>(null)
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
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`grid gap-6 sm:gap-8 lg:gap-12 ${right ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.7s var(--ease-out), transform 0.8s var(--ease-out)',
      }}
    >
      <PairedWorkCard artwork={left} locale={locale} index={startIndex} visible={visible} delay={0} />
      {right && (
        <PairedWorkCard artwork={right} locale={locale} index={startIndex + 1} visible={visible} delay={120} />
      )}
    </div>
  )
}

function PairedWorkCard({
  artwork,
  locale,
  index,
  visible,
  delay,
}: {
  artwork: (typeof artworks)[number]
  locale: 'es' | 'en'
  index: number
  visible: boolean
  delay: number
}) {
  const num = String(index).padStart(2, '0')
  const series = locale === 'es' ? artwork.series : artwork.seriesEn
  const title = locale === 'es' ? artwork.title : artwork.titleEn

  return (
    <Link
      href={`/obra/${artwork.id}`}
      className="group block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
        transition: `opacity 0.6s var(--ease-out) ${delay}ms, transform 0.7s var(--ease-out) ${delay}ms`,
      }}
    >
      {/* Image — consistent portrait aspect, no crop marks */}
      <div className="relative overflow-hidden bg-[hsl(var(--muted))] aspect-[4/5]">
        <Image
          src={artwork.imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-[1.03]"
          style={{ transitionDuration: '0.8s', transitionTimingFunction: 'var(--ease-out)' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
        />
      </div>

      {/* Placard */}
      <div className="mt-4 sm:mt-5">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{num}</span>
          <span
            className="w-6 h-px bg-[hsl(var(--accent))] group-hover:w-12"
            style={{ transition: 'width var(--motion-normal) var(--ease-out)' }}
          />
          <span className="font-body text-xs tracking-[0.1em] uppercase text-[hsl(var(--ultra))]">
            {series}
          </span>
        </div>

        <h3
          className="font-display text-lg sm:text-xl lg:text-2xl text-[hsl(var(--foreground))] leading-[1.1] mb-1.5 group-hover:text-[hsl(var(--accent))]"
          style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}
        >
          {title}
        </h3>

        <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
          {artwork.year} &middot; {locale === 'es' ? artwork.technique : artwork.techniqueEn}
        </p>

        {/* Dimensions — fade in on hover */}
        <p
          className="font-body text-xs text-[hsl(var(--foreground-subtle))] mt-1.5 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0"
          style={{ transition: 'opacity var(--motion-normal) var(--ease-out), transform var(--motion-normal) var(--ease-out)' }}
        >
          {artwork.dimensions}
        </p>
      </div>
    </Link>
  )
}

/* ─── Section wrapper ─── */

export function FeaturedWorks({ locale }: FeaturedWorksProps) {
  const featuredArtworks = useMemo(() => artworks.filter(a => a.featured).slice(0, 5), [])
  const { ref: sectionRef, isVisible } = useInView(0.05)
  const { ref: ctaRef, isVisible: ctaVisible } = useInView(0.3)

  const heroPiece = featuredArtworks[0]
  const remaining = featuredArtworks.slice(1)

  // Group remaining into pairs for the magazine spread
  const pairs: { left: (typeof artworks)[number]; right?: (typeof artworks)[number] }[] = []
  for (let i = 0; i < remaining.length; i += 2) {
    pairs.push({ left: remaining[i], right: remaining[i + 1] })
  }

  const content = {
    es: {
      label: 'Obras seleccionadas',
      viewAll: 'Catálogo completo',
      viewAllSub: '8 obras · 6 series',
    },
    en: {
      label: 'Selected works',
      viewAll: 'Full catalogue',
      viewAllSub: '8 works · 6 series',
    },
  }

  const t = content[locale]

  return (
    <section
      ref={sectionRef}
      className="relative pt-32 sm:pt-40 lg:pt-52"
      style={{ backgroundColor: 'hsl(var(--scroll-bg, var(--background)))' }}
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
          <div className="flex flex-col gap-2">
            <span className="font-body text-sm tracking-[0.08em] uppercase text-[hsl(var(--ultra))]">
              {t.label}
            </span>
            <span className="w-12 h-[3px] bg-[hsl(var(--ultra))]" aria-hidden="true" />
          </div>
        </div>

        {/* Hero piece */}
        {heroPiece && (
          <HeroPiece artwork={heroPiece} locale={locale} />
        )}

        {/* Paired works — magazine spread rhythm */}
        {pairs.map((pair, pairIndex) => {
          // Accelerating spacing between rows
          const spacingClasses = [
            'mt-20 sm:mt-28 lg:mt-36',
            'mt-24 sm:mt-32 lg:mt-44',
          ]
          const spacingClass = spacingClasses[pairIndex] || spacingClasses[spacingClasses.length - 1]

          return (
            <div key={pair.left.id} className={spacingClass}>
              <PairedWorks
                left={pair.left}
                right={pair.right}
                locale={locale}
                startIndex={pairIndex * 2 + 2}
              />
            </div>
          )
        })}

      </div>

      {/* ── Catalogue CTA — full-width dark band ── */}
      <div
        ref={ctaRef}
        className="pt-20 sm:pt-28 lg:pt-36"
        style={{
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'none' : 'translateY(12px)',
          transition: 'opacity 0.7s var(--ease-out), transform 0.8s var(--ease-out)',
        }}
      >
        <Link
          href="/obra"
          className="group/cta block bg-[hsl(var(--background-dark))] py-12 sm:py-16 lg:py-20 relative overflow-hidden"
        >
          {/* Siena accent line — top edge, expands on hover */}
          <div
            className="absolute top-0 left-0 h-[2px] bg-[hsl(var(--accent))] w-16 group-hover/cta:w-full"
            style={{ transition: 'width 0.6s var(--ease-smooth)' }}
          />

          {/* Bottom edge — subtle separator from Quote section */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[hsl(var(--ultra)/0.15)]" />

          <div className="container-gallery flex items-center justify-between">
            <div>
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-[hsl(var(--foreground-light))] leading-[1.1] group-hover/cta:text-[hsl(var(--accent))]"
                style={{ transition: 'color var(--motion-normal) var(--ease-out)' }}
              >
                {t.viewAll}
              </p>
              <p className="font-body text-sm text-[hsl(var(--foreground-light-muted))] mt-2">
                {t.viewAllSub}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="hidden sm:block w-12 h-px bg-[hsl(var(--accent))] group-hover/cta:w-20"
                style={{ transition: 'width var(--motion-normal) var(--ease-out)' }}
              />
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--foreground-light-muted))] group-hover/cta:text-[hsl(var(--accent))] group-hover/cta:translate-x-1"
                style={{ transition: 'color var(--motion-normal) var(--ease-out), transform var(--motion-normal) var(--ease-out)' }}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M5 12H19M19 12L12 5M19 12L12 19" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
