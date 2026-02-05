'use client'

import React, { useState, createContext, useContext, useEffect } from 'react'
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
              <div className="hidden sm:flex items-center gap-1 font-body text-sm">
                <button
                  onClick={() => onLocaleChange('es')}
                  className="px-1.5 py-0.5"
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
                  className="px-1.5 py-0.5"
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
                className="lg:hidden relative w-8 h-8 flex items-center justify-center"
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
        className="fixed inset-0 z-40 lg:hidden"
        style={{
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          transition: `visibility 0ms ${isMobileMenuOpen ? '0ms' : '400ms'}`,
        }}
      >
        <div
          className="absolute inset-0 bg-[hsl(var(--background))]"
          style={{
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: `opacity var(--motion-normal) var(--ease-out)`,
          }}
        />

        {/* Siena accent strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--accent))]"
          style={{
            opacity: isMobileMenuOpen ? 1 : 0,
            transform: isMobileMenuOpen ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'top',
            transition: `all var(--motion-slow) var(--ease-out) 100ms`,
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
                  transform: isMobileMenuOpen ? 'none' : `translateX(-12px)`,
                  transition: `opacity var(--motion-normal) var(--ease-out) ${150 + index * 60}ms, transform var(--motion-normal) var(--ease-out) ${150 + index * 60}ms`,
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
              transition: `opacity var(--motion-normal) var(--ease-out) ${150 + navItems.length * 60}ms`,
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

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [locale, setLocale] = useState<Locale>('es')

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Header locale={locale} onLocaleChange={setLocale} />
        <main>{children}</main>
        <Footer locale={locale} />
      </div>
    </LocaleContext.Provider>
  )
}
