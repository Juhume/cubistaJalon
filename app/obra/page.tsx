'use client'

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { getStatusLabel, type Artwork } from '@/lib/artworks'
import { useArtworks } from '@/lib/use-artworks'
import { useSeries } from '@/lib/use-series'

/* ─── Desktop: editorial work row with hover interaction ─── */
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
      className="group flex flex-wrap items-baseline gap-3 sm:gap-6 py-3 sm:py-4 border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity var(--motion-normal) var(--ease-out) ${Math.min(index * 35, 350)}ms, transform var(--motion-normal) var(--ease-out) ${Math.min(index * 35, 350)}ms, background-color var(--motion-fast) var(--ease-out)`,
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
      <span className="font-body text-xs text-[hsl(var(--foreground-muted))] shrink-0">
        {artwork.year}
      </span>
      <span className="font-body text-xs text-[hsl(var(--foreground-subtle))] hidden md:block shrink-0 w-28 text-right">
        {artwork.dimensions}
      </span>
      <span className={`
        font-annotation text-xs shrink-0 w-24 text-right
        ${artwork.status === 'available'
          ? 'text-[hsl(var(--accent))]'
          : artwork.status === 'reserved'
            ? 'text-[hsl(var(--ultra))]'
            : 'text-[hsl(var(--foreground-subtle))]'
        }
      `}>
        {getStatusLabel(artwork.status, locale)}
      </span>
    </Link>
  )
}

/* ─── Tablet & Mobile: image card ─── */
function ArtworkCard({
  artwork,
  locale,
  index,
}: {
  artwork: Artwork
  locale: 'es' | 'en'
  index: number
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [visible, setVisible] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

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

  useEffect(() => {
    const smMq = window.matchMedia('(min-width: 640px)')
    setIsTablet(smMq.matches)
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches)
    smMq.addEventListener('change', handler)
    return () => smMq.removeEventListener('change', handler)
  }, [])

  const { cols, rows } = artwork.gridSpan

  // Tablet (sm, 6 cols): 3-tier widths
  // Mobile (2 cols): big pieces full, small pieces half
  const gridStyle: React.CSSProperties = isTablet
    ? {
        gridColumn: cols >= 7
          ? 'span 6'
          : (cols >= 5 && rows >= 2)
            ? 'span 4'
            : cols >= 5
              ? 'span 3'
              : rows >= 2
                ? 'span 3'
                : 'span 2',
        gridRow: rows >= 2 ? 'span 2' : undefined,
      }
    : {
        gridColumn: (cols >= 6 || rows >= 2) ? 'span 2' : 'span 1',
      }

  const aspectClass = rows >= 2 ? 'aspect-[4/5]' : 'aspect-[5/4]'

  const statusColor =
    artwork.status === 'available'
      ? 'text-[hsl(var(--accent))]'
      : artwork.status === 'reserved'
        ? 'text-[hsl(var(--ultra))]'
        : 'text-[hsl(var(--foreground-subtle))]'

  const statusLabel = getStatusLabel(artwork.status, locale)

  return (
    <Link
      ref={ref}
      href={`/obra/${artwork.id}`}
      className="group block"
      style={{
        ...gridStyle,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity var(--motion-reveal) var(--ease-out) ${Math.min(index * 40, 300)}ms, transform var(--motion-reveal) var(--ease-out) ${Math.min(index * 40, 300)}ms`,
      }}
    >
      {/* Image with crop-marks */}
      <div className="relative crop-marks">
        <div className={`relative ${aspectClass} overflow-hidden bg-[hsl(var(--muted))]`}>
          <Image
            src={artwork.imageUrl}
            alt={locale === 'es' ? artwork.title : artwork.titleEn}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            style={{ transitionDuration: 'var(--motion-reveal)', transitionTimingFunction: 'var(--ease-out)' }}
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Card metadata */}
      <div className="mt-3 space-y-0.5">
        <h3
          className="font-display text-sm sm:text-base text-[hsl(var(--foreground))] leading-snug group-hover:text-[hsl(var(--accent))]"
          style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}
        >
          {locale === 'es' ? artwork.title : artwork.titleEn}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="font-body text-xs text-[hsl(var(--foreground-muted))]">
            {artwork.year}
          </span>
          <span className="text-[hsl(var(--foreground-subtle))] text-xs">&middot;</span>
          <span className={`font-annotation text-xs ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        {(artwork.series || artwork.seriesEn) && (
          <p className="font-body text-xs uppercase tracking-[0.06em] text-[hsl(var(--foreground-subtle))]">
            {locale === 'es' ? artwork.series : artwork.seriesEn}
          </p>
        )}
      </div>
    </Link>
  )
}

function GalleryContent() {
  const { locale } = useLocale()
  const artworks = useArtworks()
  const series = useSeries()
  const searchParams = useSearchParams()

  // Initialize from URL params
  const [selectedSeries, setSelectedSeries] = useState(() => {
    const s = searchParams.get('serie')
    return s && series.some(x => x.id === s) ? s : 'all'
  })
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(() => {
    return searchParams.get('estado') === 'available'
  })
  const [hoveredArtwork, setHoveredArtwork] = useState<Artwork | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Sync filters to URL (without navigation)
  const updateURL = useCallback((seriesId: string, onlyAvailable: boolean) => {
    const params = new URLSearchParams()
    if (seriesId !== 'all') params.set('serie', seriesId)
    if (onlyAvailable) params.set('estado', 'available')
    const qs = params.toString()
    const url = qs ? `/obra?${qs}` : '/obra'
    window.history.replaceState(null, '', url)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Artworks filtered by series only (used for contextual status counts)
  const seriesFiltered = useMemo(() => {
    if (selectedSeries === 'all') return artworks
    if (selectedSeries === 'sin-serie') return artworks.filter(a => !a.series)
    return artworks.filter(a => (a.series || '').toLowerCase().replace(/\s+/g, '-') === selectedSeries)
  }, [selectedSeries, artworks])

  // Combined filter: series + availability toggle
  const filteredArtworks = useMemo(() => {
    if (!showOnlyAvailable) return seriesFiltered
    return seriesFiltered.filter(a => a.status === 'available')
  }, [seriesFiltered, showOnlyAvailable])

  // Count available works in current series filter
  const availableCount = useMemo(() => {
    return seriesFiltered.filter(a => a.status === 'available').length
  }, [seriesFiltered])

  function resetFilters() {
    setSelectedSeries('all')
    setShowOnlyAvailable(false)
    updateURL('all', false)
  }

  const content = {
    es: {
      title: 'Catálogo',
      filterLabel: 'Serie',
      noResults: 'No hay obras con estos filtros.',
      resetFilters: 'Ver todo el catálogo',
    },
    en: {
      title: 'Catalogue',
      filterLabel: 'Series',
      noResults: 'No works match these filters.',
      resetFilters: 'View full catalogue',
    },
  }

  const t = content[locale]

  const groupedArtworks = useMemo(() => {
    const groups: { series: string; seriesEn: string; works: Artwork[] }[] = []
    const seriesMap = new Map<string, Artwork[]>()

    filteredArtworks.forEach(a => {
      const key = a.series || ''
      if (!seriesMap.has(key)) seriesMap.set(key, [])
      seriesMap.get(key)!.push(a)
    })

    seriesMap.forEach((works, seriesName) => {
      groups.push({
        series: seriesName,
        seriesEn: works[0].seriesEn || '',
        works,
      })
    })

    return groups
  }, [filteredArtworks])

  let globalIndex = 0

  return (
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32">
      <div className="container-gallery">
        {/* Header */}
        <header className="mb-12 sm:mb-16">
          <h1
            className="font-display text-3xl sm:text-4xl md:text-5xl text-[hsl(var(--foreground))] leading-[1.1]"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: `opacity var(--motion-reveal) var(--ease-out)`,
            }}
          >
            {t.title}
          </h1>
        </header>

        {/* Filters */}
        <div
          className="mb-8 sm:mb-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity var(--motion-slow) var(--ease-out) 100ms`,
          }}
        >
          {/* Series filter */}
          <div className="relative">
            <div
              role="group"
              aria-label={locale === 'es' ? 'Filtrar por serie' : 'Filter by series'}
              className="flex items-center gap-3 flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible no-scrollbar"
            >
              <span className="shrink-0 whitespace-nowrap font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] mr-2">
                {t.filterLabel}
              </span>
              {series.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSeries(s.id); updateURL(s.id, showOnlyAvailable) }}
                  aria-pressed={selectedSeries === s.id}
                  className="shrink-0 whitespace-nowrap font-body text-sm py-3 px-3 cursor-pointer"
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
            {/* Fade hint — indicates scrollability on mobile */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[hsl(var(--background))] to-transparent pointer-events-none sm:hidden" />
          </div>

          {/* Availability toggle */}
          <div className="flex items-center mt-4 sm:mt-5">
            <button
              role="switch"
              aria-checked={showOnlyAvailable}
              aria-label={locale === 'es' ? 'Mostrar solo obras disponibles' : 'Show only available works'}
              onClick={() => { const next = !showOnlyAvailable; setShowOnlyAvailable(next); updateURL(selectedSeries, next) }}
              className="flex items-center gap-3 group/toggle py-2 cursor-pointer"
            >
              {/* Track — geometric, not pill-shaped */}
              <span
                className="relative w-12 h-6 rounded-sm"
                style={{
                  border: `1px solid ${showOnlyAvailable ? 'hsl(var(--accent))' : 'hsl(var(--border-strong, var(--border)))'}`,
                  backgroundColor: showOnlyAvailable ? 'hsl(var(--accent) / 0.08)' : 'transparent',
                  transition: 'border-color var(--motion-normal) var(--ease-out), background-color var(--motion-normal) var(--ease-out)',
                }}
              >
                {/* Diamond knob */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45"
                  style={{
                    left: showOnlyAvailable ? 'calc(100% - 18px)' : '3px',
                    backgroundColor: showOnlyAvailable ? 'hsl(var(--accent))' : 'hsl(var(--foreground-subtle))',
                    transition: 'left var(--motion-normal) var(--ease-out), background-color var(--motion-normal) var(--ease-out)',
                  }}
                />
              </span>

              <span
                className="font-body text-sm"
                style={{
                  color: showOnlyAvailable ? 'hsl(var(--accent))' : 'hsl(var(--foreground-muted))',
                  transition: 'color var(--motion-fast) var(--ease-out)',
                }}
              >
                {locale === 'es' ? 'Solo disponibles' : 'Available only'}
                <span className="ml-1.5 text-xs opacity-50">{availableCount}</span>
              </span>
            </button>
          </div>
        </div>

        {/* ─── Desktop: work list + hover preview (original layout) ─── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-12 pb-16 sm:pb-24">
          {/* Work list */}
          <div className="lg:col-span-7">
            {groupedArtworks.length > 0 ? (
              groupedArtworks.map((group) => (
                <div key={group.series} className="mb-8">
                  {selectedSeries === 'all' && group.series && (
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
              <div className="py-12 text-center space-y-4">
                <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                  {t.noResults}
                </p>
                <button
                  onClick={resetFilters}
                  className="font-body text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] cursor-pointer"
                  style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
                >
                  {t.resetFilters}
                </button>
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
                  alt={locale === 'es' ? filteredArtworks[0].title : filteredArtworks[0].titleEn}
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

        {/* ─── Tablet & Mobile: image card grid ─── */}
        <div className="lg:hidden pb-16 sm:pb-24">
          {filteredArtworks.length > 0 ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4"
              style={{ gridAutoFlow: 'dense' }}
            >
              {filteredArtworks.map((artwork, index) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                {t.noResults}
              </p>
              <button
                onClick={resetFilters}
                className="font-body text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] cursor-pointer"
                style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
              >
                {t.resetFilters}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <MainLayout>
      <Suspense>
        <GalleryContent />
      </Suspense>
    </MainLayout>
  )
}
