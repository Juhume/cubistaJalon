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
      className="relative py-20 sm:py-28 lg:py-36"
    >
      <div className="container-gallery">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">

          {/* Ultramarino vertical bar — structural element */}
          <div className="hidden lg:block lg:col-span-1">
            <div
              className="w-full h-full bg-[hsl(var(--ultra))]"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'top',
                transition: 'transform 0.8s var(--ease-smooth), opacity 0.6s var(--ease-out)',
              }}
            />
          </div>

          {/* Mobile: thin ultramarino rule */}
          <div
            className="lg:hidden h-px bg-[hsl(var(--ultra))] mb-2"
            style={{
              opacity: isVisible ? 0.6 : 0,
              transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.8s var(--ease-smooth), opacity 0.6s var(--ease-out)',
            }}
          />

          {/* Quote content */}
          <div className="lg:col-span-9 lg:col-start-3 lg:pl-4">
            <blockquote>
              <p
                className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] text-[hsl(var(--foreground))] leading-[1.25]"
                style={{
                  fontStyle: 'italic',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 0.7s var(--ease-out) 150ms, transform 0.7s var(--ease-out) 150ms',
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
                transition: 'opacity 0.5s var(--ease-out) 400ms, transform 0.5s var(--ease-out) 400ms',
              }}
            >
              <span className="w-10 h-px bg-[hsl(var(--accent))]" />
              <cite className="font-body text-sm text-[hsl(var(--foreground))] not-italic">
                Cubista Jalón
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
