'use client'

import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedWorks } from '@/components/home/featured-works'
import { QuoteSection } from '@/components/home/quote-section'
import { ExhibitionBanner } from '@/components/home/exhibition-banner'

function HomeContent() {
  const { locale } = useLocale()

  return (
    <>
      <HeroSection locale={locale} />
      <FeaturedWorks locale={locale} />
      <QuoteSection locale={locale} />
      <ExhibitionBanner locale={locale} />
    </>
  )
}

export default function HomePage() {
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  )
}
