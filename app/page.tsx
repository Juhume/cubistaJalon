'use client'

import { useRef, useEffect } from 'react'
import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedWorks } from '@/components/home/featured-works'
import { QuoteSection } from '@/components/home/quote-section'
import { ExhibitionBanner } from '@/components/home/exhibition-banner'

function HomeContent() {
  const { locale } = useLocale()
  const featuredRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Chromatic scroll: warm the background as user scrolls through Featured Works
  useEffect(() => {
    // Respect prefers-reduced-motion
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionMq.matches) return

    const wrapper = wrapperRef.current
    const featured = featuredRef.current
    if (!wrapper || !featured) return

    const onScroll = () => {
      const rect = featured.getBoundingClientRect()
      const viewH = window.innerHeight

      // Progress 0→1 as section scrolls through viewport
      const top = rect.top
      const bottom = rect.bottom
      const sectionH = bottom - top

      // Start when section enters, end when it fully passes
      const progress = Math.max(0, Math.min(1, (viewH - top) / (viewH + sectionH)))

      // Interpolate: hue 40→36, sat 14→18, light 96→94
      const hue = 40 - progress * 4
      const sat = 14 + progress * 4
      const light = 96 - progress * 2

      wrapper.style.setProperty('--scroll-bg', `${hue} ${sat}% ${light}%`)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // init
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={wrapperRef}>
      <HeroSection locale={locale} />
      <div ref={featuredRef}>
        <FeaturedWorks locale={locale} />
      </div>

      <QuoteSection locale={locale} />

      {/* Puente tonal: Quote (dark) → Exhibition (warm) */}
      <div className="h-6 sm:h-8 bg-[hsl(var(--muted))]" />

      <ExhibitionBanner locale={locale} />
    </div>
  )
}

export default function HomePage() {
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  )
}
