'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { exhibitions } from '@/lib/artworks'

function ExhibitionsContent() {
  const { locale } = useLocale()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const currentExhibition = exhibitions.find(e => e.isCurrent)
  const pastExhibitions = exhibitions.filter(e => !e.isCurrent)

  const content = {
    es: {
      title: 'Exposiciones',
      current: 'Exposición actual',
      past: 'Anteriores',
    },
    en: {
      title: 'Exhibitions',
      current: 'Current exhibition',
      past: 'Past',
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

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32">
      <div className="container-gallery">
        {/* Header */}
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl text-[hsl(var(--foreground))] leading-[1.1] mb-12 sm:mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'none' : 'translateY(16px)',
            transition: `opacity var(--motion-slow) var(--ease-out), transform var(--motion-slow) var(--ease-out)`,
          }}
        >
          {t.title}
        </h1>
      </div>

      {/* Current Exhibition */}
      {currentExhibition && (
        <section
          className="container-gallery mb-16 sm:mb-24"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity 0.8s var(--ease-out) 100ms`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-t border-[hsl(var(--foreground))]">
            {/* Text */}
            <div className="md:col-span-5 py-10 md:py-14 md:pr-8">
              <p className="font-annotation text-sm text-[hsl(var(--accent))] mb-6">
                {t.current}
              </p>

              <h2 className="font-display text-2xl sm:text-3xl text-[hsl(var(--foreground))] leading-[1.1] mb-5">
                {locale === 'es' ? currentExhibition.title : currentExhibition.titleEn}
              </h2>

              <div className="space-y-1 mb-5">
                <p className="font-body text-sm text-[hsl(var(--foreground))]">
                  {currentExhibition.venue}, {currentExhibition.location}
                </p>
                <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                  {formatDate(currentExhibition.startDate)} &mdash; {formatDate(currentExhibition.endDate)}
                </p>
              </div>

              <p className="font-body text-sm text-[hsl(var(--foreground-muted))] leading-relaxed">
                {locale === 'es' ? currentExhibition.description : currentExhibition.descriptionEn}
              </p>
            </div>

            {/* Siena vertical divider */}
            <div className="hidden md:flex md:col-span-1 items-stretch justify-center">
              <div className="w-[2px] bg-[hsl(var(--accent))] opacity-60" />
            </div>

            {/* Image */}
            <div className="md:col-span-6 py-6 md:py-10">
              <div className="relative crop-marks">
                <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
                  <Image
                    src={currentExhibition.imageUrl || "/placeholder.svg"}
                    alt={locale === 'es' ? currentExhibition.title : currentExhibition.titleEn}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Past Exhibitions */}
      <div className="container-gallery">
        {pastExhibitions.length > 0 && (
          <section className="pb-16 sm:pb-24">
            <div className="mb-8">
              <span className="inline-block w-2 h-2 bg-[hsl(var(--accent))] mr-2.5 align-middle" aria-hidden="true" />
              <span className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] align-middle">
                {t.past}
              </span>
            </div>

            <div className="border-t border-[hsl(var(--foreground))]">
              {pastExhibitions.map((exhibition) => (
                <div
                  key={exhibition.id}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 py-5 border-b border-[hsl(var(--border))] group"
                >
                  <span className="font-body text-xs text-[hsl(var(--foreground-subtle))] shrink-0 sm:w-36">
                    {formatDateShort(exhibition.startDate)} &mdash; {formatDateShort(exhibition.endDate)}
                  </span>

                  <span className="font-display text-lg text-[hsl(var(--foreground))] flex-1 group-hover:text-[hsl(var(--accent))]"
                    style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
                  >
                    {locale === 'es' ? exhibition.title : exhibition.titleEn}
                  </span>

                  <span className="font-body text-sm text-[hsl(var(--foreground-muted))] shrink-0">
                    {exhibition.venue}, {exhibition.location}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default function ExhibitionsPage() {
  return (
    <MainLayout>
      <ExhibitionsContent />
    </MainLayout>
  )
}
