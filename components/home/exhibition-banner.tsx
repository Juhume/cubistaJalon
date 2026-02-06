'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { exhibitions } from '@/lib/artworks'
import { useInView } from '@/lib/hooks'

interface ExhibitionBannerProps {
  locale: 'es' | 'en'
}

export function ExhibitionBanner({ locale }: ExhibitionBannerProps) {
  const { ref: sectionRef, isVisible } = useInView(0.1)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const currentExhibition = exhibitions.find(e => e.isCurrent)
  if (!currentExhibition) return null

  const content = {
    es: {
      label: 'Exposición actual',
      moreInfo: 'Más información',
    },
    en: {
      label: 'Current exhibition',
      moreInfo: 'More information',
    },
  }

  const t = content[locale]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Directional reveals: text slides from left, image from right (desktop only)
  const textHidden = isDesktop ? 'translateX(-14px)' : 'translateY(14px)'
  const imageHidden = isDesktop ? 'translateX(14px)' : 'translateY(12px)'

  return (
    <section
      ref={sectionRef}
      className="relative bg-[hsl(var(--card))]"
    >
      <div className="container-gallery py-20 sm:py-28 lg:py-36" style={{ maxWidth: '1520px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* Image — cinematic aspect ratio (inverted: image first on desktop) */}
          <div
            className="lg:col-span-7 order-1 lg:order-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translate(0, 0)' : imageHidden,
              transition: 'opacity 0.7s var(--ease-out) 150ms, transform 0.7s var(--ease-out) 150ms',
            }}
          >
            <div className="relative crop-marks">
              <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
                <Image
                  src={currentExhibition.imageUrl || "/placeholder.svg"}
                  alt={locale === 'es' ? currentExhibition.title : currentExhibition.titleEn}
                  fill
                  className="object-cover animate-ken-burns"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </div>
            </div>

            {/* Siena accent line below image */}
            <div
              className="h-[2px] bg-[hsl(var(--accent))] mt-3"
              style={{
                opacity: isVisible ? 0.6 : 0,
                transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.8s var(--ease-smooth) 400ms, opacity 0.6s var(--ease-out) 400ms',
              }}
            />
          </div>

          {/* Text content (inverted: text after image on desktop, col 9-12) */}
          <div
            className="lg:col-span-5 lg:col-start-8 flex flex-col justify-center order-2 lg:order-2"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translate(0, 0)' : textHidden,
              transition: 'opacity 0.6s var(--ease-out), transform 0.7s var(--ease-out)',
            }}
          >
            <p className="font-annotation text-sm text-[hsl(var(--accent))] mb-5">
              {t.label}
            </p>

            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[hsl(var(--foreground))] leading-[1.1] mb-5">
              {locale === 'es' ? currentExhibition.title : currentExhibition.titleEn}
            </h3>

            <div className="space-y-1 mb-5">
              <p className="font-body text-sm text-[hsl(var(--foreground))]">
                {currentExhibition.venue}, {currentExhibition.location}
              </p>
              <p className="font-body text-sm text-[hsl(var(--foreground))]">
                {formatDate(currentExhibition.startDate)} &mdash; {formatDate(currentExhibition.endDate)}
              </p>
            </div>

            <p className="font-body text-sm text-[hsl(var(--foreground))] leading-relaxed mb-8 max-w-sm">
              {locale === 'es' ? currentExhibition.description : currentExhibition.descriptionEn}
            </p>

            <div>
              <Link
                href="/exposiciones"
                className="inline-flex items-center gap-3 py-2 px-4 border border-[hsl(var(--foreground))] font-body text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]"
                style={{ transition: 'all var(--motion-normal) var(--ease-out)' }}
              >
                {t.moreInfo}
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Ultramarino closing accent */}
        <div
          className="w-24 h-[2px] bg-[hsl(var(--ultra))] opacity-40 mt-12"
          style={{
            opacity: isVisible ? 0.4 : 0,
            transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.8s var(--ease-smooth) 500ms, opacity 0.6s var(--ease-out) 500ms',
          }}
        />
      </div>
    </section>
  )
}
