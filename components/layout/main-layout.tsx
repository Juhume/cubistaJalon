'use client'

import React, { useState, useMemo, createContext, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useContact } from '@/lib/use-contact'

type Locale = 'es' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'es',
  setLocale: () => {},
})

export function useLocale() {
  return useContext(LocaleContext)
}

const navItems = [
  { href: '/', label: { es: 'Inicio', en: 'Home' } },
  { href: '/obra', label: { es: 'Obra', en: 'Work' } },
  { href: '/artista', label: { es: 'El Artista', en: 'The Artist' } },
  { href: '/exposiciones', label: { es: 'Exposiciones', en: 'Exhibitions' } },
  { href: '/adquirir', label: { es: 'Adquirir', en: 'Acquire' } },
]

function Header({ locale, onLocaleChange }: { locale: Locale; onLocaleChange: (l: Locale) => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const contact = useContact()
  const isHome = pathname === '/'

  // On the home page, the header sits over the dark hero.
  // We use light text until the user scrolls past ~90vh.
  const [isOverDark, setIsOverDark] = useState(isHome)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 20)
      if (isHome) {
        setIsOverDark(y < window.innerHeight * 0.85)
      }
    }
    // Reset on route change
    setIsOverDark(isHome)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  // Close mobile menu if viewport crosses lg breakpoint (prevents stuck scroll lock)
  useEffect(() => {
    const lgMq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches && isMobileMenuOpen) setIsMobileMenuOpen(false)
    }
    lgMq.addEventListener('change', handler)
    return () => lgMq.removeEventListener('change', handler)
  }, [isMobileMenuOpen])

  // Color scheme: light text when over the dark hero, dark text otherwise
  const useLightText = isOverDark && !isScrolled && !isMobileMenuOpen
  const textPrimary = useLightText ? 'hsl(var(--foreground-light))' : 'hsl(var(--foreground))'
  const textSecondary = useLightText ? 'hsl(var(--foreground-light-muted))' : 'hsl(var(--foreground-muted))'
  const textDivider = useLightText ? 'hsl(var(--foreground-light-muted))' : 'hsl(var(--border-strong))'

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: isScrolled ? 'hsl(var(--background) / 0.96)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(8px)' : 'none',
          borderBottom: isScrolled ? '1px solid hsl(var(--border))' : '1px solid transparent',
          padding: isScrolled ? '0.7rem 0' : '1.25rem 0',
          transition: `all var(--motion-normal) var(--ease-out)`,
        }}
      >
        <div className="container-gallery">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative group flex-shrink-0">
              <span
                className="font-display text-lg sm:text-xl"
                style={{ color: textPrimary, transition: `color var(--motion-normal) var(--ease-out)` }}
              >
                Cubista Jalón
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative py-1 group"
                  >
                    <span
                      className="font-body text-sm"
                      style={{
                        color: isActive ? textPrimary : textSecondary,
                        transition: `color var(--motion-normal) var(--ease-out)`,
                      }}
                    >
                      {item.label[locale]}
                    </span>
                    {isActive && (
                      <span
                        className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[hsl(var(--accent))]"
                      />
                    )}
                    {!isActive && (
                      <span
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-[hsl(var(--accent))] origin-left scale-x-0 group-hover:scale-x-100"
                        style={{ transition: `transform var(--motion-normal) var(--ease-smooth)` }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Language toggle */}
              <div className="hidden sm:flex items-center font-body text-sm">
                <button
                  onClick={() => onLocaleChange('es')}
                  className="px-2.5 py-2 cursor-pointer"
                  style={{
                    color: locale === 'es' ? textPrimary : textSecondary,
                    transition: `color var(--motion-normal) var(--ease-out)`,
                  }}
                >
                  Es
                </button>
                <span style={{ color: textDivider, transition: `color var(--motion-normal) var(--ease-out)` }}>/</span>
                <button
                  onClick={() => onLocaleChange('en')}
                  className="px-2.5 py-2 cursor-pointer"
                  style={{
                    color: locale === 'en' ? textPrimary : textSecondary,
                    transition: `color var(--motion-normal) var(--ease-out)`,
                  }}
                >
                  En
                </button>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative w-10 h-10 flex items-center justify-center"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen
                  ? (locale === 'es' ? 'Cerrar menú' : 'Close menu')
                  : (locale === 'es' ? 'Abrir menú' : 'Open menu')
                }
              >
                <div className="relative w-5 h-3.5">
                  <span
                    className="absolute left-0 w-full h-px"
                    style={{
                      backgroundColor: textPrimary,
                      top: isMobileMenuOpen ? '50%' : '0',
                      transform: isMobileMenuOpen ? 'translateY(-50%) rotate(45deg)' : 'none',
                      transition: `all var(--motion-normal) var(--ease-out)`,
                    }}
                  />
                  <span
                    className="absolute left-0 h-px"
                    style={{
                      backgroundColor: textPrimary,
                      width: isMobileMenuOpen ? '100%' : '60%',
                      top: isMobileMenuOpen ? '50%' : 'auto',
                      bottom: isMobileMenuOpen ? 'auto' : '0',
                      transform: isMobileMenuOpen ? 'translateY(-50%) rotate(-45deg)' : 'none',
                      transition: `all var(--motion-normal) var(--ease-out)`,
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 lg:hidden"
        role="dialog"
        aria-modal={isMobileMenuOpen}
        aria-label={locale === 'es' ? 'Menú de navegación' : 'Navigation menu'}
        style={{
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          transition: `visibility 0ms ${isMobileMenuOpen ? '0ms' : '400ms'}`,
        }}
      >
        {/* Background — warm, calm fill */}
        <div
          className="absolute inset-0 bg-[hsl(var(--background))]"
          style={{
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: `opacity ${isMobileMenuOpen ? '250ms' : '300ms'} var(--ease-out)${isMobileMenuOpen ? '' : ' 80ms'}`,
          }}
        />

        {/* Siena accent — thin vertical breath */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[hsl(var(--accent))]"
          style={{
            opacity: isMobileMenuOpen ? 0.8 : 0,
            transform: isMobileMenuOpen ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'top',
            transition: isMobileMenuOpen
              ? `opacity 400ms var(--ease-out) 120ms, transform 500ms var(--ease-out) 120ms`
              : `opacity 200ms var(--ease-out), transform 200ms var(--ease-out)`,
          }}
        />

        {/* Nav content — everything moves as ONE unit */}
        <nav
          className="relative h-full flex flex-col items-start justify-center px-8 sm:px-12"
          style={{
            opacity: isMobileMenuOpen ? 1 : 0,
            transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(12px)',
            transition: isMobileMenuOpen
              ? `opacity 350ms var(--ease-out) 150ms, transform 400ms var(--ease-out) 150ms`
              : `opacity 180ms var(--ease-out), transform 180ms var(--ease-out)`,
          }}
        >
          <div className="flex flex-col gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block"
                >
                  <span
                    className="font-display text-[1.65rem] sm:text-3xl"
                    style={{
                      color: isActive ? 'hsl(var(--accent))' : 'hsl(var(--foreground))',
                      transition: 'color var(--motion-fast) var(--ease-out)',
                    }}
                  >
                    {item.label[locale]}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Language toggle — part of the same unit, no separate animation */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[hsl(var(--border))]">
            <button
              onClick={() => onLocaleChange('es')}
              className="font-body text-base py-1 px-1 cursor-pointer"
              style={{
                color: locale === 'es' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground-muted))',
                transition: 'color var(--motion-fast) var(--ease-out)',
              }}
            >
              Español
            </button>
            <span className="text-[hsl(var(--border-strong))]">/</span>
            <button
              onClick={() => onLocaleChange('en')}
              className="font-body text-base py-1 px-1 cursor-pointer"
              style={{
                color: locale === 'en' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground-muted))',
                transition: 'color var(--motion-fast) var(--ease-out)',
              }}
            >
              English
            </button>
          </div>

          {/* Instagram */}
          <a
            href={contact.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-4 font-body text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent))]"
            style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}
            aria-label={locale === 'es' ? 'Seguir en Instagram' : 'Follow on Instagram'}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            {contact.instagram.handle}
          </a>
        </nav>
      </div>
    </>
  )
}

function Footer({ locale }: { locale: Locale }) {
  const contact = useContact()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[hsl(var(--background-dark))]">
      <div className="border-t border-[hsl(var(--foreground-light)/0.1)]">
        <div className="container-gallery py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            {/* Left — identity */}
            <div>
              <p className="font-display text-xl text-[hsl(var(--foreground-light))] mb-2">
                Cubista Jalón
              </p>
              <p className="font-annotation text-sm text-[hsl(var(--foreground-light-muted))]">
                Alfredo Huerta Esteban
              </p>
              <p className="font-body text-sm text-[hsl(var(--foreground-light-muted))] mt-1">
                Madrid, 1953
              </p>
            </div>

            {/* Right — contact + legal */}
            <div className="flex flex-col sm:items-end gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="font-body text-sm text-[hsl(var(--foreground-light-muted))] hover:text-[hsl(var(--accent))] link-underline"
                style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
              >
                {contact.email}
              </a>
              <a
                href={contact.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-body text-sm text-[hsl(var(--foreground-light-muted))] hover:text-[hsl(var(--accent))]"
                style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
                aria-label={locale === 'es' ? 'Seguir en Instagram' : 'Follow on Instagram'}
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                {contact.instagram.handle}
              </a>
              <p className="font-body text-xs text-[hsl(var(--foreground-light-muted))]">
                &copy; {currentYear} &mdash; {locale === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}
              </p>
            </div>
          </div>
        </div>

        {/* Closing gesture */}
        <div className="container-gallery pb-6">
          <div className="flex items-end justify-between">
            <span
              className="font-display text-[3.5rem] sm:text-[4.5rem] leading-none text-[hsl(var(--foreground-light))] select-none"
              style={{ opacity: 0.06 }}
              aria-hidden="true"
            >
              CJ
            </span>
            <span className="inline-block w-3 h-3 bg-[hsl(var(--accent))] mb-2" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Ultramarino bar */}
      <div className="h-1.5 bg-[hsl(var(--ultra))]" />
    </footer>
  )
}

/* ─── Page Transition ─── */

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const childrenRef = useRef(children)
  const [rendered, setRendered] = useState(children)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Always keep latest children in ref
  childrenRef.current = children

  useEffect(() => {
    if (pathname === prevPathname.current) {
      // Same route — just update content (no transition)
      setRendered(children)
      return
    }

    // Clear any pending timers from interrupted transitions
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    // Route changed — start transition
    setPhase('out')

    const outTimer = setTimeout(() => {
      // Swap content and scroll to top (compatible with all browsers)
      setRendered(childrenRef.current)
      window.scrollTo(0, 0)
      prevPathname.current = pathname

      // Wait two frames for DOM paint before fading in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('in')
          // Reset to idle after animation completes
          const idleTimer = setTimeout(() => setPhase('idle'), 420)
          timersRef.current.push(idleTimer)
        })
      })
    }, 180)

    timersRef.current.push(outTimer)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Update rendered content on non-route re-renders (locale change, etc.)
  useEffect(() => {
    if (phase === 'idle') {
      setRendered(children)
    }
  }, [children, phase])

  const style: React.CSSProperties =
    phase === 'out'
      ? {
          opacity: 0,
          transform: 'translateY(6px)',
          willChange: 'opacity, transform',
          transition: 'opacity 180ms var(--ease-smooth), transform 180ms var(--ease-smooth)',
        }
      : phase === 'in'
      ? {
          opacity: 1,
          transform: 'translateY(0)',
          willChange: 'opacity, transform',
          transition: 'opacity 420ms var(--ease-out), transform 420ms var(--ease-out)',
        }
      : { opacity: 1, transform: 'none' }

  // Siena accent line — visual "cut" between pages
  const lineStyle: React.CSSProperties =
    phase === 'out'
      ? {
          transform: 'scaleX(1)',
          transition: 'transform 180ms var(--ease-smooth)',
        }
      : phase === 'in'
      ? {
          transform: 'scaleX(0)',
          transformOrigin: 'right',
          transition: 'transform 350ms var(--ease-smooth) 100ms',
        }
      : { transform: 'scaleX(0)' }

  return (
    <>
      {/* Transition accent line */}
      <div
        className="fixed top-0 left-0 right-0 z-[55] h-[2px] bg-[hsl(var(--accent))]"
        style={{ transformOrigin: 'left', pointerEvents: 'none', ...lineStyle }}
      />
      <div style={style}>
        {rendered}
      </div>
    </>
  )
}

/* ─── Scroll to Top ─── */

function ScrollToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity var(--motion-normal) var(--ease-out), transform var(--motion-normal) var(--ease-out)',
      }}
      aria-label={locale === 'es' ? 'Volver arriba' : 'Back to top'}
    >
      {/* Diamond container — rotated square with siena accent */}
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rotate-45 border border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--background)/0.9)] backdrop-blur-sm group-hover:bg-[hsl(var(--accent))] group-hover:border-[hsl(var(--accent))]"
        style={{ transition: 'background-color var(--motion-normal) var(--ease-out), border-color var(--motion-normal) var(--ease-out)' }}
      >
        {/* Arrow — counter-rotated to stay upright */}
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 sm:w-[18px] sm:h-[18px] absolute top-1/2 left-1/2 -rotate-45 -translate-x-1/2 -translate-y-1/2 text-[hsl(var(--accent))] group-hover:text-[hsl(var(--background))]"
          style={{ transition: 'color var(--motion-normal) var(--ease-out)' }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 19V5M5 12L12 5L19 12" />
        </svg>
      </div>
    </button>
  )
}

/* ─── Main Layout ─── */

interface MainLayoutProps {
  children: React.ReactNode
}

function detectLocale(): Locale {
  // 1. Check stored preference
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cj-locale')
    if (stored === 'es' || stored === 'en') return stored
  }
  // 2. Detect from browser/OS language
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language || (navigator.languages && navigator.languages[0]) || ''
    if (lang.startsWith('es')) return 'es'
  }
  // 3. Default to English for non-Spanish speakers
  return 'en'
}

export function MainLayout({ children }: MainLayoutProps) {
  const [locale, setLocaleState] = useState<Locale>('es')

  // Detect language before first paint — useLayoutEffect runs synchronously
  // after hydration but before the browser paints, preventing any visible flash.
  useLayoutEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  // Sync <html lang> attribute with current locale
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Image reveal — mark images as loaded for CSS fade-in
  useEffect(() => {
    const markLoaded = (e: Event) => {
      if (e.target instanceof HTMLImageElement && e.target.dataset.nimg !== undefined) {
        e.target.classList.add('img-loaded')
      }
    }
    document.addEventListener('load', markLoaded, true)
    document.querySelectorAll<HTMLImageElement>('img[data-nimg]').forEach(img => {
      if (img.complete) img.classList.add('img-loaded')
    })
    return () => document.removeEventListener('load', markLoaded, true)
  }, [])

  // Persist manual locale changes
  const setLocale = useMemo(() => (l: Locale) => {
    localStorage.setItem('cj-locale', l)
    setLocaleState(l)
  }, [])

  // Stable context value — only changes when locale actually changes
  const localeValue = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return (
    <LocaleContext.Provider value={localeValue}>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-[hsl(var(--foreground))] focus:text-[hsl(var(--background))] focus:font-body focus:text-sm"
        >
          {locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
        </a>
        <Header locale={locale} onLocaleChange={setLocale} />
        <main id="main-content">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer locale={locale} />
        <ScrollToTop locale={locale} />
      </div>
    </LocaleContext.Provider>
  )
}
