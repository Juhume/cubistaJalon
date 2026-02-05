'use client'

import Link from 'next/link'
import Image from 'next/image'
import { artworks } from '@/lib/artworks'
import { useInView } from '@/lib/hooks'

interface FeaturedWorksProps {
  locale: 'es' | 'en'
}

export function FeaturedWorks({ locale }: FeaturedWorksProps) {
  const featuredArtworks = artworks.filter(a => a.featured).slice(0, 5)
  const { ref: sectionRef, isVisible } = useInView(0.05)

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
          {featuredArtworks.map((artwork, index) => {
            const isEven = index % 2 === 0
            const num = String(index + 1).padStart(2, '0')

            return (
              <Link
                key={artwork.id}
                href={`/obra/${artwork.id}`}
                className="group block"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'none' : 'translateY(24px)',
                  transition: `opacity var(--motion-slow) var(--ease-out) ${index * 120}ms, transform var(--motion-slow) var(--ease-out) ${index * 120}ms`,
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
          })}
        </div>

        {/* View all */}
        <div
          className="mt-20 sm:mt-28 pt-8 border-t border-[hsl(var(--border))]"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity var(--motion-slow) var(--ease-out) 600ms`,
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
