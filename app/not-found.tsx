'use client'

import Link from 'next/link'
import { MainLayout, useLocale } from '@/components/layout/main-layout'

function NotFoundContent() {
  const { locale } = useLocale()
  const t = {
    es: { message: 'Esta página no existe', cta: 'Volver al inicio' },
    en: { message: 'This page does not exist', cta: 'Back to home' },
  }[locale]

  return (
    <div className="min-h-[70vh] flex items-center justify-center pt-24 sm:pt-28">
      <div className="text-center px-6">
        <p className="font-display text-[6rem] sm:text-[8rem] leading-none select-none mb-4
          text-[hsl(var(--foreground))]" style={{ opacity: 0.08 }}>
          404
        </p>
        <div className="w-8 h-[2px] bg-[hsl(var(--accent))] mx-auto mb-6" />
        <p className="font-body text-sm text-[hsl(var(--foreground-muted))] mb-8">{t.message}</p>
        <Link href="/"
          className="inline-flex items-center gap-2 py-2.5 px-5 font-body text-sm
            bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]"
          style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
          {t.cta}
        </Link>
      </div>
    </div>
  )
}

export default function NotFound() {
  return <MainLayout><NotFoundContent /></MainLayout>
}
