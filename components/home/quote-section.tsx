'use client'

import { artistBio } from '@/lib/artworks'
import { useInView } from '@/lib/hooks'

interface QuoteSectionProps {
  locale: 'es' | 'en'
}

export function QuoteSection({ locale }: QuoteSectionProps) {
  const { ref: sectionRef, isVisible } = useInView(0.15)

  const quote = artistBio.quote[locale].replace(/^"|"$/g, '')

  return (
    <section
      ref={sectionRef}
      className="relative section-dark py-32 sm:py-44 lg:py-56"
    >
      <div className="container-gallery">
        <div className="max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">

          {/* Ultramarino vertical bar — structural element (desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div
              className="w-full h-full bg-[hsl(var(--ultra))]"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'top',
                transition: 'transform var(--motion-reveal) var(--ease-smooth), opacity var(--motion-reveal) var(--ease-out)',
              }}
            />
          </div>

          {/* Mobile: ultramarino horizontal band — visible presence */}
          <div
            className="lg:hidden h-4 bg-[hsl(var(--ultra))] mb-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform var(--motion-reveal) var(--ease-smooth), opacity var(--motion-reveal) var(--ease-out)',
            }}
          />

          {/* Quote content */}
          <div className="lg:col-span-9 lg:col-start-3 lg:pl-4 relative">
            {/* Decorative guillemets */}
            <span
              className="absolute -top-6 -left-2 lg:-left-6 font-display text-[4rem] sm:text-[5rem] lg:text-[6rem] leading-none text-[hsl(var(--foreground-light))] opacity-[0.05] pointer-events-none select-none"
              aria-hidden="true"
            >
              &laquo;
            </span>
            <span
              className="absolute -bottom-6 right-0 lg:right-4 font-display text-[4rem] sm:text-[5rem] lg:text-[6rem] leading-none text-[hsl(var(--foreground-light))] opacity-[0.05] pointer-events-none select-none"
              aria-hidden="true"
            >
              &raquo;
            </span>

            <blockquote>
              <p
                className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] text-[hsl(var(--foreground-light))] leading-[1.25]"
                style={{
                  fontStyle: 'italic',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity var(--motion-reveal) var(--ease-out) 150ms, transform var(--motion-reveal) var(--ease-out) 150ms',
                }}
              >
                {quote}
              </p>
            </blockquote>

            {/* Attribution */}
            <div
              className="mt-8 sm:mt-10 flex items-center gap-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity var(--motion-slow) var(--ease-out) 400ms, transform var(--motion-slow) var(--ease-out) 400ms',
              }}
            >
              <span className="w-10 h-px bg-[hsl(var(--accent))]" />
              <cite className="font-body text-sm text-[hsl(var(--foreground-light-muted))] not-italic">
                Cubista Jalón
              </cite>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
