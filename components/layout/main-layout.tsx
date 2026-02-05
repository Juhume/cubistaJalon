'use client'

import React, { useState, useMemo, createContext, useContext, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
                  className="px-2.5 py-2"
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
                  className="px-2.5 py-2"
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
          transition: `visibility 0ms ${isMobileMenuOpen ? '0ms' : '350ms'}`,
        }}
      >
        {/* Background — opens fast, closes slow (after text is gone) */}
        <div
          className="absolute inset-0 bg-[hsl(var(--background))]"
          style={{
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: isMobileMenuOpen
              ? `opacity 200ms var(--ease-out)`
              : `opacity 300ms var(--ease-out) 50ms`,
          }}
        />

        {/* Siena accent strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--accent))]"
          style={{
            opacity: isMobileMenuOpen ? 1 : 0,
            transform: isMobileMenuOpen ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: isMobileMenuOpen ? 'top' : 'bottom',
            transition: isMobileMenuOpen
              ? `all var(--motion-slow) var(--ease-out) 100ms`
              : `all 200ms var(--ease-out)`,
          }}
        />

        <nav className="relative h-full flex flex-col items-start justify-center gap-5 px-8">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group block"
                style={{
                  paddingLeft: `${index * 0.75}rem`,
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateY(0)' : `translateY(8px)`,
                  willChange: 'opacity, transform',
                  transition: isMobileMenuOpen
                    ? `opacity var(--motion-normal) var(--ease-out) ${200 + index * 50}ms, transform var(--motion-normal) var(--ease-out) ${200 + index * 50}ms`
                    : `opacity 120ms var(--ease-out), transform 120ms var(--ease-out)`,
                }}
              >
                <span
                  className="font-display text-2xl sm:text-3xl"
                  style={{
                    color: isActive ? 'hsl(var(--accent))' : 'hsl(var(--foreground))',
                  }}
                >
                  {item.label[locale]}
                </span>
              </Link>
            )
          })}

          {/* Mobile language toggle */}
          <div
            className="flex items-center gap-3 mt-4 pt-6 border-t border-[hsl(var(--border))]"
            style={{
              paddingLeft: `${navItems.length * 0.75}rem`,
              opacity: isMobileMenuOpen ? 1 : 0,
              transition: isMobileMenuOpen
                ? `opacity var(--motion-normal) var(--ease-out) ${200 + navItems.length * 50}ms`
                : `opacity 100ms var(--ease-out)`,
            }}
          >
            <button
              onClick={() => onLocaleChange('es')}
              className={`font-body text-base ${locale === 'es' ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--foreground-muted))]'}`}
            >
              Español
            </button>
            <span className="text-[hsl(var(--border-strong))]">/</span>
            <button
              onClick={() => onLocaleChange('en')}
              className={`font-body text-base ${locale === 'en' ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--foreground-muted))]'}`}
            >
              English
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}

function Footer({ locale }: { locale: Locale }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[hsl(var(--background))]">
      <div className="border-t border-[hsl(var(--border))]">
        <div className="container-gallery py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            {/* Left — identity */}
            <div>
              <p className="font-display text-xl text-[hsl(var(--foreground))] mb-2">
                Cubista Jalón
              </p>
              <p className="font-annotation text-sm text-[hsl(var(--foreground-muted))]">
                Alfredo Huerta Esteban
              </p>
              <p className="font-body text-xs text-[hsl(var(--foreground-subtle))] mt-1">
                Madrid, 1953
              </p>
            </div>

            {/* Right — contact + legal */}
            <div className="flex flex-col sm:items-end gap-3">
              <a
                href="mailto:info@cubistajalon.com"
                className="font-body text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent))] link-underline"
                style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
              >
                info@cubistajalon.com
              </a>
              <p className="font-body text-[0.7rem] text-[hsl(var(--foreground-subtle))]">
                &copy; {currentYear} &mdash; {locale === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}
              </p>
            </div>
          </div>
        </div>

        {/* Closing gesture */}
        <div className="container-gallery pb-6">
          <div className="flex items-end justify-between">
            <span
              className="font-display text-[3.5rem] sm:text-[4.5rem] leading-none text-[hsl(var(--foreground))] select-none"
              style={{ opacity: 0.04 }}
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
          transition: 'opacity 180ms cubic-bezier(0.4, 0, 1, 1), transform 180ms cubic-bezier(0.4, 0, 1, 1)',
        }
      : phase === 'in'
      ? {
          opacity: 1,
          transform: 'translateY(0)',
          willChange: 'opacity, transform',
          transition: 'opacity 420ms cubic-bezier(0, 0, 0.2, 1), transform 420ms cubic-bezier(0, 0, 0.2, 1)',
        }
      : { opacity: 1, transform: 'none' }

  // Siena accent line — visual "cut" between pages
  const lineStyle: React.CSSProperties =
    phase === 'out'
      ? {
          transform: 'scaleX(1)',
          transition: 'transform 180ms cubic-bezier(0.4, 0, 0.2, 1)',
        }
      : phase === 'in'
      ? {
          transform: 'scaleX(0)',
          transformOrigin: 'right',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1) 100ms',
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

  // Detect language on mount (client-side only)
  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  // Sync <html lang> attribute with current locale
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

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
      </div>
    </LocaleContext.Provider>
  )
}
