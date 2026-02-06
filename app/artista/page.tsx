'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { artistBio } from '@/lib/artworks'

function ArtistContent() {
  const { locale } = useLocale()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const content = {
    es: {
      subtitle: 'El artista',
      statement: 'Declaración artística',
      biography: 'Trayectoria',
      downloadCV: 'Descargar CV',
    },
    en: {
      subtitle: 'The artist',
      statement: 'Artist statement',
      biography: 'Journey',
      downloadCV: 'Download CV',
    },
  }

  const t = content[locale]

  return (
    <div className="min-h-screen pt-24 sm:pt-28">
      {/* Hero */}
      <section className="container-gallery py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Text */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.6s var(--ease-out), transform 0.7s var(--ease-out)',
            }}
          >
            <p className="font-annotation text-sm text-[hsl(var(--foreground-muted))] mb-4">
              {t.subtitle}
            </p>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-[hsl(var(--foreground))] leading-[1] mb-4">
              {artistBio.artistName}
            </h1>

            <div className="mb-8">
              <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                {artistBio.name}
              </p>
              <p className="font-body text-sm text-[hsl(var(--foreground-subtle))]">
                {locale === 'es' ? artistBio.birthPlace : artistBio.birthPlaceEn} &middot; {artistBio.birthYear}
              </p>
            </div>

            <p className="font-body text-base sm:text-lg text-[hsl(var(--foreground))] leading-relaxed max-w-lg">
              {artistBio.statement[locale]}
            </p>
          </div>

          {/* Photo — dual perspective effect */}
          <div
            className="relative overflow-hidden"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.8s var(--ease-out) 200ms`,
            }}
          >
            {/* Second copy — offset, reduced opacity, sepia */}
            <div
              className="absolute top-4 left-4 right-0 bottom-0 opacity-25"
              style={{ filter: 'sepia(0.4)' }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[hsl(var(--muted))]">
                <Image
                  src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Primary photo */}
            <div className="relative crop-marks">
              <div className="relative aspect-[4/5] overflow-hidden bg-[hsl(var(--muted))]">
                <Image
                  src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80"
                  alt={artistBio.artistName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-14 sm:py-20 border-t border-[hsl(var(--border))]">
        <div className="container-gallery">
          <blockquote className="max-w-3xl">
            <p className="font-display text-xl sm:text-2xl md:text-3xl text-[hsl(var(--foreground))] leading-[1.3]"
              style={{ fontStyle: 'italic' }}
            >
              {artistBio.quote[locale].replace(/^"|"$/g, '')}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="w-6 h-px bg-[hsl(var(--accent))]" />
              <cite className="font-body text-sm text-[hsl(var(--foreground-muted))] not-italic">
                Cubista Jalón
              </cite>
            </div>
          </blockquote>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-gallery py-14 sm:py-20">
        <div className="mb-10">
          <span className="inline-block w-2.5 h-2.5 bg-[hsl(var(--ultra))] mr-3 align-middle" aria-hidden="true" />
          <span className="font-body text-sm tracking-[0.1em] uppercase text-[hsl(var(--foreground-muted))] align-middle">
            {t.biography}
          </span>
        </div>

        <div className="max-w-2xl">
          {artistBio.timeline.map((item, index) => (
            <div
              key={item.year}
              className="flex gap-6 sm:gap-10 py-4 border-b border-[hsl(var(--border))] group"
            >
              {/* Year badge */}
              <span className="shrink-0 w-16 flex items-baseline">
                <span
                  className="inline-flex items-center justify-center px-2 py-0.5 text-white font-display text-sm sm:text-base leading-tight"
                  style={{
                    backgroundColor: `hsl(var(--accent) / ${Math.max(0.65, 1 - index * 0.05)})`,
                  }}
                >
                  {item.year}
                </span>
              </span>
              <p className="font-body text-sm text-[hsl(var(--foreground-muted))] leading-relaxed group-hover:text-[hsl(var(--foreground))]"
                style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
              >
                {item.event[locale]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CV Download */}
      <section className="border-t border-[hsl(var(--border))] py-10 sm:py-14">
        <div className="container-gallery">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg text-[hsl(var(--foreground))] mb-1">{t.downloadCV}</p>
              <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                {locale === 'es'
                  ? 'Curriculum vitae completo con historial de exposiciones.'
                  : 'Complete curriculum vitae with exhibition history.'}
              </p>
            </div>
            <a
              href="/cv-cubista-jalon.pdf"
              download
              className="inline-flex items-center gap-2 font-body text-sm text-[hsl(var(--foreground))] border-b-2 border-[hsl(var(--accent))] pb-1 hover:text-[hsl(var(--accent))]"
              style={{ transition: `color var(--motion-normal) var(--ease-out)` }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" />
                <path d="M7 10L12 15L17 10" />
                <path d="M12 15V3" />
              </svg>
              <span>PDF</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ArtistPage() {
  return (
    <MainLayout>
      <ArtistContent />
    </MainLayout>
  )
}
