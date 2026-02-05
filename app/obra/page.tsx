'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { series, type Artwork } from '@/lib/artworks'
import { useArtworks } from '@/lib/use-artworks'

function WorkRow({
  artwork,
  locale,
  index,
  onHover,
  isVisible,
}: {
  artwork: Artwork
  locale: 'es' | 'en'
  index: number
  onHover: (artwork: Artwork | null) => void
  isVisible: boolean
}) {
  const num = String(index + 1).padStart(3, '0')

  return (
    <Link
      href={`/obra/${artwork.id}`}
      className="group flex items-baseline gap-3 sm:gap-6 py-3 sm:py-4 border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : 'translateY(8px)',
        transition: `opacity var(--motion-slow) var(--ease-out) ${index * 40}ms, transform var(--motion-slow) var(--ease-out) ${index * 40}ms, background-color var(--motion-fast) var(--ease-out)`,
      }}
      onMouseEnter={() => onHover(artwork)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="font-body text-xs text-[hsl(var(--foreground-subtle))] w-8 shrink-0">
        {num}
      </span>
      <span className="font-display text-base sm:text-lg text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent))] flex-1 min-w-0"
        style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
      >
        {locale === 'es' ? artwork.title : artwork.titleEn}
      </span>
      <span className="font-body text-xs text-[hsl(var(--foreground-muted))] hidden sm:block shrink-0">
        {artwork.year}
      </span>
      <span className="font-body text-xs text-[hsl(var(--foreground-subtle))] hidden md:block shrink-0 w-28 text-right">
        {artwork.dimensions}
      </span>
      <span className={`
        font-annotation text-xs shrink-0 hidden sm:block w-24 text-right
        ${artwork.status === 'available'
          ? 'text-[hsl(var(--accent))]'
          : 'text-[hsl(var(--foreground-subtle))]'
        }
      `}>
        {artwork.status === 'available'
          ? (locale === 'es' ? 'Disponible' : 'Available')
          : (locale === 'es' ? 'Col. privada' : 'Private col.')
        }
      </span>
    </Link>
  )
}

function GalleryContent() {
  const { locale } = useLocale()
  const artworks = useArtworks()
  const [selectedSeries, setSelectedSeries] = useState('all')
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(artworks)
  const [hoveredArtwork, setHoveredArtwork] = useState<Artwork | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSeries === 'all') {
      setFilteredArtworks(artworks)
    } else {
      setFilteredArtworks(
        artworks.filter(a => a.series.toLowerCase().replace(/\s+/g, '-') === selectedSeries)
      )
    }
  }, [selectedSeries, artworks])

  const content = {
    es: {
      title: 'Catálogo',
      filterLabel: 'Serie',
      noResults: 'No hay obras en esta serie.',
    },
    en: {
      title: 'Catalogue',
      filterLabel: 'Series',
      noResults: 'No works in this series.',
    },
  }

  const t = content[locale]

  const groupedArtworks: { series: string; seriesEn: string; works: Artwork[] }[] = []
  const seriesMap = new Map<string, Artwork[]>()

  filteredArtworks.forEach(a => {
    const key = a.series
    if (!seriesMap.has(key)) seriesMap.set(key, [])
    seriesMap.get(key)!.push(a)
  })

  seriesMap.forEach((works, seriesName) => {
    groupedArtworks.push({
      series: seriesName,
      seriesEn: works[0].seriesEn,
      works,
    })
  })

  let globalIndex = 0

  return (
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32" ref={sectionRef}>
      <div className="container-gallery">
        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <h1
            className="font-display text-3xl sm:text-4xl md:text-5xl text-[hsl(var(--foreground))] leading-[1.1]"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.8s var(--ease-out)`,
            }}
          >
            {t.title}
          </h1>
        </header>

        {/* Filters */}
        <div
          className="mb-8 sm:mb-10 flex items-center gap-3 flex-wrap"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity var(--motion-slow) var(--ease-out) 100ms`,
          }}
        >
          <span className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] mr-2">
            {t.filterLabel}
          </span>
          {series.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeries(s.id)}
              className="font-body text-sm py-1 px-2"
              style={{
                color: selectedSeries === s.id
                  ? 'hsl(var(--foreground))'
                  : 'hsl(var(--foreground-muted))',
                borderBottom: selectedSeries === s.id
                  ? '1px solid hsl(var(--foreground))'
                  : '1px solid transparent',
                transition: `color var(--motion-fast) var(--ease-out), border-color var(--motion-fast) var(--ease-out)`,
              }}
            >
              {locale === 'es' ? s.name : s.nameEn}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-16 sm:pb-24">
          {/* Work list */}
          <div className="lg:col-span-7">
            {groupedArtworks.length > 0 ? (
              groupedArtworks.map((group) => (
                <div key={group.series} className="mb-8">
                  {selectedSeries === 'all' && (
                    <h2 className="flex items-center gap-2 font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-3 mt-6 first:mt-0">
                      <span className="inline-block w-2 h-2 bg-[hsl(var(--accent))]" aria-hidden="true" />
                      {locale === 'es' ? group.series : group.seriesEn}
                    </h2>
                  )}

                  <div className={selectedSeries === 'all' ? '' : 'border-t border-[hsl(var(--foreground))]'}>
                    {group.works.map((artwork) => {
                      const idx = globalIndex++
                      return (
                        <WorkRow
                          key={artwork.id}
                          artwork={artwork}
                          locale={locale}
                          index={idx}
                          onHover={setHoveredArtwork}
                          isVisible={isVisible}
                        />
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                  {t.noResults}
                </p>
              </div>
            )}
          </div>

          {/* Hover preview */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div
              className="relative aspect-[4/5] overflow-hidden bg-[hsl(var(--muted))]"
              style={{
                opacity: hoveredArtwork ? 1 : 0.4,
                transition: `opacity var(--motion-normal) var(--ease-out)`,
              }}
            >
              {hoveredArtwork ? (
                <Image
                  src={hoveredArtwork.imageUrl}
                  alt={locale === 'es' ? hoveredArtwork.title : hoveredArtwork.titleEn}
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
              ) : filteredArtworks[0] ? (
                <Image
                  src={filteredArtworks[0].imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
              ) : null}
            </div>
            <div className="mt-3 h-6">
              {hoveredArtwork && (
                <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                  {locale === 'es' ? hoveredArtwork.technique : hoveredArtwork.techniqueEn}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <MainLayout>
      <GalleryContent />
    </MainLayout>
  )
}
