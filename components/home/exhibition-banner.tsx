'use client'

import Link from 'next/link'
import Image from 'next/image'
import { exhibitions } from '@/lib/artworks'
import { useInView } from '@/lib/hooks'

interface ExhibitionBannerProps {
  locale: 'es' | 'en'
}

export function ExhibitionBanner({ locale }: ExhibitionBannerProps) {
  const { ref: sectionRef, isVisible } = useInView(0.1)

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

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-[hsl(var(--border))]"
    >
      <div className="container-gallery py-16 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Text content */}
          <div
            className="lg:col-span-5 flex flex-col justify-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'none' : 'translateY(16px)',
              transition: 'opacity var(--motion-slow) var(--ease-out), transform var(--motion-slow) var(--ease-out)',
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

          {/* Image — cinematic aspect ratio */}
          <div
            className="lg:col-span-7"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.8s var(--ease-out) 200ms',
            }}
          >
            <div className="relative crop-marks">
              <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
                <Image
                  src={currentExhibition.imageUrl || "/placeholder.svg"}
                  alt={locale === 'es' ? currentExhibition.title : currentExhibition.titleEn}
                  fill
                  className="object-cover"
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
        </div>
      </div>
    </section>
  )
}
