'use client'

import React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { type Artwork, artistBio, getStatusLabel } from '@/lib/artworks'
import { useArtwork, useArtworks } from '@/lib/use-artworks'

/* ─── Career Timeline ─── */

function CareerTimeline({ year, locale }: { year: number; locale: 'es' | 'en' }) {
  const milestones = artistBio.timeline
  const startYear = milestones[0].year
  const endYear = Math.max(milestones[milestones.length - 1].year, new Date().getFullYear())
  const range = endYear - startYear
  const artworkPos = ((year - startYear) / range) * 100

  return (
    <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
      <p className="font-body text-xs tracking-[0.1em] uppercase text-[hsl(var(--foreground-subtle))] mb-3">
        {locale === 'es' ? 'Trayectoria' : 'Career'}
      </p>
      <div className="relative h-[56px]">
        {/* Artwork year — floats above the line, accent color */}
        <span
          className="absolute top-0 font-body text-xs text-[hsl(var(--accent))] font-medium leading-none"
          style={{
            left: `${artworkPos}%`,
            transform: artworkPos > 85 ? 'translateX(-100%)' : artworkPos < 15 ? 'none' : 'translateX(-50%)',
          }}
        >
          {year}
        </span>

        {/* Connecting stem — dot to label */}
        <div
          className="absolute top-[12px] w-px h-[8px] bg-[hsl(var(--accent))] opacity-30 -translate-x-1/2"
          style={{ left: `${artworkPos}%` }}
        />

        {/* Base line */}
        <div
          className="absolute top-[24px] left-0 right-0 h-px"
          style={{ backgroundColor: 'hsl(var(--ultra) / 0.3)' }}
        />

        {/* Milestone ticks */}
        {milestones.map((m) => {
          const pos = ((m.year - startYear) / range) * 100
          return (
            <div
              key={m.year}
              className="absolute top-[20px] w-px h-[9px]"
              style={{
                left: `${pos}%`,
                backgroundColor: 'hsl(var(--ultra) / 0.4)',
              }}
            />
          )
        })}

        {/* Artwork year marker dot */}
        <div
          className="absolute top-[21px] w-[6px] h-[6px] rounded-full bg-[hsl(var(--accent))] -translate-x-1/2"
          style={{ left: `${artworkPos}%` }}
        />

        {/* Career span labels — below the line, subtle */}
        <span className="absolute top-[36px] left-0 font-body text-[0.7rem] text-[hsl(var(--foreground-subtle))] leading-none">
          {startYear}
        </span>
        <span className="absolute top-[36px] right-0 font-body text-[0.7rem] text-[hsl(var(--foreground-subtle))] leading-none">
          {endYear}
        </span>
      </div>
    </div>
  )
}

/* ─── Zoom Viewer (Desktop) ─── */

function DesktopZoomViewer({
  imageUrl,
  alt,
  isOpen,
  onClose,
  locale,
  title,
  year,
}: {
  imageUrl: string
  alt: string
  isOpen: boolean
  onClose: () => void
  locale: 'es' | 'en'
  title: string
  year: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const wasDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Contemplative mode state
  const [showClose, setShowClose] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const hasInteracted = useRef(false)
  const [contemplative, setContemplative] = useState(true)
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setImgError(false)
      hasInteracted.current = false
      setContemplative(true)
      setShowClose(false)
      setShowInfo(false)
      requestAnimationFrame(() => setVisible(true))

      const closeTimer = setTimeout(() => setShowClose(true), 1000)
      const infoTimer = setTimeout(() => setShowInfo(true), 3000)

      return () => {
        clearTimeout(closeTimer)
        clearTimeout(infoTimer)
        if (returnTimer.current) clearTimeout(returnTimer.current)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // Transition to zoom mode on interaction
  const enterZoomMode = useCallback(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true
      setContemplative(false)
    }
    if (returnTimer.current) {
      clearTimeout(returnTimer.current)
      returnTimer.current = null
    }
  }, [])

  // Native wheel listener — must be non-passive to preventDefault
  useEffect(() => {
    if (!isOpen) return
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      enterZoomMode()
      setScale(prev => {
        const next = prev - e.deltaY * 0.002
        return Math.max(1, Math.min(5, next))
      })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [isOpen, enterZoomMode])

  // Return to contemplative when scale hits 1
  useEffect(() => {
    if (scale <= 1 && hasInteracted.current && !contemplative) {
      returnTimer.current = setTimeout(() => {
        hasInteracted.current = false
        setContemplative(true)
      }, 2000)
    }
    return () => {
      if (returnTimer.current) clearTimeout(returnTimer.current)
    }
  }, [scale, contemplative])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    wasDragging.current = false
    dragStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...position }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [scale, position])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragging.current = true
    setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy })
  }, [isDragging])

  const handlePointerUp = useCallback(() => { setIsDragging(false) }, [])

  const handleClick = useCallback(() => {
    if (wasDragging.current) return
    enterZoomMode()
    if (scale > 1) { setScale(1); setPosition({ x: 0, y: 0 }) }
    else setScale(2.5)
  }, [scale, enterZoomMode])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label={`${locale === 'es' ? 'Vista museo' : 'Museum view'}: ${title}`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms var(--ease-out)' }}
    >
      <div className="absolute inset-0 bg-black" />

      {/* Top bar — switches between contemplative hint and zoom hint */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between py-5 px-8"
        style={{
          opacity: contemplative ? 0 : 1,
          transition: 'opacity 600ms var(--ease-out)',
          pointerEvents: contemplative ? 'none' : 'auto',
        }}
      >
        <p className="font-body text-xs text-white/50">
          {scale > 1
            ? (locale === 'es' ? 'Arrastra para explorar' : 'Drag to explore')
            : (locale === 'es' ? 'Clic para ampliar' : 'Click to zoom in')}
        </p>
      </div>

      {/* Close button — appears after 1s, always focusable for a11y */}
      <button
        onClick={onClose}
        className="absolute top-5 right-8 z-20 text-white/50 hover:text-white p-2"
        style={{
          opacity: showClose ? (contemplative ? 0.3 : 1) : 0,
          transition: 'opacity 600ms var(--ease-out), color var(--motion-fast) var(--ease-out)',
        }}
        aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6L18 18M6 18L18 6" />
        </svg>
      </button>

      {/* Contemplative info — title + year, bottom-left */}
      <div
        className="absolute bottom-8 left-8 z-10 pointer-events-none"
        style={{
          opacity: (showInfo && contemplative) ? 0.4 : 0,
          transition: 'opacity 800ms var(--ease-out)',
        }}
      >
        <p className="font-display text-lg text-white">{title}</p>
        <p className="font-body text-xs text-white/60 mt-1">{year}</p>
      </div>

      {/* Contemplative hint — center bottom */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{
          opacity: (showInfo && contemplative) ? 0.3 : 0,
          transition: 'opacity 800ms var(--ease-out)',
        }}
      >
        <p className="font-body text-xs text-white/50">
          {locale === 'es' ? 'Contempla la obra · Clic para ampliar' : 'Contemplate the work · Click to zoom'}
        </p>
      </div>

      {/* Zoom controls — only when not contemplative */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3"
        style={{
          opacity: contemplative ? 0 : 1,
          transition: 'opacity 400ms var(--ease-out)',
          pointerEvents: contemplative ? 'none' : 'auto',
        }}
      >
        <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }) }}
          className={`font-body text-xs py-1 px-2 ${scale <= 1 ? 'text-white' : 'text-white/40'}`}>1x</button>
        <div className="w-20 h-px bg-white/20 relative">
          <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[hsl(var(--accent))]"
            style={{ left: `${((scale - 1) / 4) * 100}%`, transition: isDragging ? 'none' : 'left 150ms var(--ease-out)' }} />
        </div>
        <button onClick={() => { enterZoomMode(); setScale(5) }}
          className={`font-body text-xs py-1 px-2 ${scale >= 5 ? 'text-white' : 'text-white/40'}`}>5x</button>
      </div>

      <div ref={containerRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden touch-none"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onClick={handleClick}>
        {imgError ? (
          <p className="font-body text-sm text-white/50">
            {locale === 'es' ? 'No se pudo cargar la imagen' : 'Could not load image'}
          </p>
        ) : (
          <div className="relative w-[70vw] h-[75vh]"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 300ms var(--ease-out)',
            }}>
            <Image src={imageUrl || "/placeholder.svg"} alt={alt} fill
              className="object-contain select-none" style={{ pointerEvents: 'none' }}
              sizes="90vw" quality={95} priority
              onError={() => setImgError(true)} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Zoom Viewer (Mobile) — pinch-to-zoom with native touch ─── */

function MobileZoomViewer({
  imageUrl,
  alt,
  isOpen,
  onClose,
  locale,
  title,
  year,
}: {
  imageUrl: string
  alt: string
  isOpen: boolean
  onClose: () => void
  locale: 'es' | 'en'
  title: string
  year: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Contemplative mode state
  const [showClose, setShowClose] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const hasInteracted = useRef(false)
  const [contemplative, setContemplative] = useState(true)
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Touch state refs (not React state — too slow for 60fps touch)
  const scaleRef = useRef(1)
  const posRef = useRef({ x: 0, y: 0 })
  const pinchStartDist = useRef(0)
  const pinchStartScale = useRef(1)
  const panStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const touchMode = useRef<'none' | 'pan' | 'pinch'>('none')
  const lastTap = useRef(0)

  const applyTransform = useCallback(() => {
    if (!imgRef.current) return
    const s = scaleRef.current
    const p = posRef.current
    imgRef.current.style.transform = `scale(${s}) translate(${p.x / s}px, ${p.y / s}px)`
  }, [])

  // Clamp position so image doesn't fly off screen
  const clampPosition = useCallback(() => {
    const s = scaleRef.current
    if (s <= 1) {
      posRef.current = { x: 0, y: 0 }
      return
    }
    const maxX = (window.innerWidth * (s - 1)) / 2
    const maxY = (window.innerHeight * (s - 1)) / 2
    posRef.current.x = Math.max(-maxX, Math.min(maxX, posRef.current.x))
    posRef.current.y = Math.max(-maxY, Math.min(maxY, posRef.current.y))
  }, [])

  const enterZoomMode = useCallback(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true
      setContemplative(false)
    }
    if (returnTimer.current) {
      clearTimeout(returnTimer.current)
      returnTimer.current = null
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      scaleRef.current = 1
      posRef.current = { x: 0, y: 0 }
      hasInteracted.current = false
      setContemplative(true)
      setShowClose(false)
      setShowInfo(false)
      setImgError(false)
      requestAnimationFrame(() => setVisible(true))

      const closeTimer = setTimeout(() => setShowClose(true), 1000)
      const infoTimer = setTimeout(() => setShowInfo(true), 3000)

      return () => {
        clearTimeout(closeTimer)
        clearTimeout(infoTimer)
        if (returnTimer.current) clearTimeout(returnTimer.current)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // Native touch handlers for 60fps performance
  useEffect(() => {
    if (!isOpen) return
    const el = containerRef.current
    if (!el) return

    const dist = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

    const checkReturnToContemplative = () => {
      if (scaleRef.current < 1.1 && hasInteracted.current) {
        returnTimer.current = setTimeout(() => {
          hasInteracted.current = false
          setContemplative(true)
        }, 2000)
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      enterZoomMode()

      if (e.touches.length === 2) {
        touchMode.current = 'pinch'
        pinchStartDist.current = dist(e.touches[0], e.touches[1])
        pinchStartScale.current = scaleRef.current
        panStart.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        }
        posStart.current = { ...posRef.current }
      } else if (e.touches.length === 1) {
        const now = Date.now()
        if (now - lastTap.current < 300) {
          if (scaleRef.current > 1.1) {
            scaleRef.current = 1
            posRef.current = { x: 0, y: 0 }
          } else {
            scaleRef.current = 2.5
            const cx = e.touches[0].clientX - window.innerWidth / 2
            const cy = e.touches[0].clientY - window.innerHeight / 2
            posRef.current = { x: -cx * 0.6, y: -cy * 0.6 }
            clampPosition()
          }
          applyTransform()
          if (imgRef.current) imgRef.current.style.transition = 'transform 300ms var(--ease-out)'
          setTimeout(() => {
            if (imgRef.current) imgRef.current.style.transition = 'none'
            checkReturnToContemplative()
          }, 300)
          lastTap.current = 0
          return
        }
        lastTap.current = now

        touchMode.current = 'pan'
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        posStart.current = { ...posRef.current }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      if (touchMode.current === 'pinch' && e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1])
        const newScale = Math.max(1, Math.min(5, pinchStartScale.current * (d / pinchStartDist.current)))
        scaleRef.current = newScale

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        posRef.current = {
          x: posStart.current.x + (midX - panStart.current.x),
          y: posStart.current.y + (midY - panStart.current.y),
        }
        clampPosition()
        applyTransform()
      } else if (touchMode.current === 'pan' && e.touches.length === 1 && scaleRef.current > 1) {
        const dx = e.touches[0].clientX - panStart.current.x
        const dy = e.touches[0].clientY - panStart.current.y
        posRef.current = {
          x: posStart.current.x + dx,
          y: posStart.current.y + dy,
        }
        clampPosition()
        applyTransform()
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        if (scaleRef.current < 1.1) {
          scaleRef.current = 1
          posRef.current = { x: 0, y: 0 }
          if (imgRef.current) imgRef.current.style.transition = 'transform 300ms var(--ease-out)'
          applyTransform()
          setTimeout(() => {
            if (imgRef.current) imgRef.current.style.transition = 'none'
          }, 300)
        }
        touchMode.current = 'none'
        checkReturnToContemplative()
      } else if (e.touches.length === 1) {
        touchMode.current = 'pan'
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        posStart.current = { ...posRef.current }
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [isOpen, applyTransform, clampPosition, enterZoomMode])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label={`${locale === 'es' ? 'Vista museo' : 'Museum view'}: ${title}`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms var(--ease-out)' }}
    >
      <div className="absolute inset-0 bg-black" />

      {/* Close button — appears after 1s, always focusable for a11y */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center"
        style={{
          opacity: showClose ? (contemplative ? 0.3 : 1) : 0,
          transition: 'opacity 600ms var(--ease-out)',
        }}
        aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6L18 18M6 18L18 6" />
          </svg>
        </div>
      </button>

      {/* Contemplative info — title + year, bottom-left */}
      <div
        className="absolute bottom-8 left-6 z-20 pointer-events-none"
        style={{
          opacity: (showInfo && contemplative) ? 0.4 : 0,
          transition: 'opacity 800ms var(--ease-out)',
        }}
      >
        <p className="font-display text-base text-white">{title}</p>
        <p className="font-body text-xs text-white/60 mt-1">{year}</p>
      </div>

      {/* Pinch hint — only in contemplative mode, replaces old auto-hide */}
      <div
        className="absolute inset-x-0 bottom-8 z-20 flex justify-center pointer-events-none"
        style={{
          opacity: (showInfo && contemplative) ? 0.3 : 0,
          transition: 'opacity 800ms var(--ease-out)',
        }}
      >
        <div className="flex items-center gap-2 py-2 px-4 bg-white/10 backdrop-blur-sm rounded-full">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12L4 7M4 7L4 11M4 7L8 7" />
            <path d="M15 12L20 17M20 17L20 13M20 17L16 17" />
          </svg>
          <span className="font-body text-xs text-white/70">
            {locale === 'es' ? 'Pellizca para explorar' : 'Pinch to explore'}
          </span>
        </div>
      </div>

      {/* Image canvas — full screen, native touch gestures */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        {imgError ? (
          <p className="font-body text-sm text-white/50">
            {locale === 'es' ? 'No se pudo cargar la imagen' : 'Could not load image'}
          </p>
        ) : (
          <div
            ref={imgRef}
            className="relative w-full h-full"
            style={{ transformOrigin: 'center center' }}
          >
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={alt}
              fill
              className="object-contain select-none"
              style={{ pointerEvents: 'none', padding: '12px' }}
              sizes="100vw"
              quality={95}
              priority
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Zoom Viewer — routes to Desktop or Mobile ─── */

function ZoomViewer(props: {
  imageUrl: string
  alt: string
  isOpen: boolean
  onClose: () => void
  locale: 'es' | 'en'
  title: string
  year: number
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect touch device — check for coarse pointer (phones/tablets)
    const mq = window.matchMedia('(pointer: coarse)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (isMobile) return <MobileZoomViewer {...props} />
  return <DesktopZoomViewer {...props} />
}

/* ─── Inquiry Modal ─── */

function InquiryModal({
  artwork,
  locale,
  isOpen,
  onClose
}: {
  artwork: Artwork
  locale: 'es' | 'en'
  isOpen: boolean
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const content = {
    es: {
      title: 'Consultar sobre esta obra',
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      messagePlaceholder: 'Me interesa conocer más sobre esta obra...',
      submit: 'Enviar consulta',
      success: 'Gracias. Te contactaremos pronto.',
      close: 'Cerrar',
    },
    en: {
      title: 'Inquire about this work',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      messagePlaceholder: 'I am interested in learning more about this work...',
      submit: 'Send inquiry',
      success: 'Thank you. We will contact you soon.',
      close: 'Close',
    },
  }

  const t = content[locale]

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = locale === 'es' ? 'Nombre requerido' : 'Name required'
    }
    if (!formData.email.trim()) {
      newErrors.email = locale === 'es' ? 'Email requerido' : 'Email required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = locale === 'es' ? 'Email no válido' : 'Invalid email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      setIsSubmitted(true)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
    >
      <div
        className="absolute inset-0 bg-[hsl(var(--background))]/90"
        onClick={onClose}
      />
      <div className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 sm:p-8 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]"
          style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
          aria-label={t.close}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6L18 18M6 18L18 6" />
          </svg>
        </button>

        <div className="mb-6 pb-5 border-b border-[hsl(var(--border))]">
          <p className="font-body text-sm text-[hsl(var(--foreground-muted))] mb-1">
            {locale === 'es' ? artwork.title : artwork.titleEn}
          </p>
          <p className="font-body text-xs text-[hsl(var(--foreground-subtle))]">
            {artwork.year} &middot; {artwork.dimensions}
          </p>
        </div>

        <h2 id="inquiry-title" className="font-display text-xl text-[hsl(var(--foreground))] mb-6">{t.title}</h2>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <p className="font-body text-[hsl(var(--foreground))]">{t.success}</p>
            <button
              onClick={onClose}
              className="mt-4 font-body text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent))] link-underline"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="inquiry-name" className="input-label">{t.name} *</label>
              <input
                id="inquiry-name"
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })) }}
                className={`input-field ${errors.name ? 'border-[hsl(var(--accent))]' : ''}`}
              />
              {errors.name && <p className="font-body text-xs text-[hsl(var(--accent))] mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="inquiry-email" className="input-label">{t.email} *</label>
              <input
                id="inquiry-email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })) }}
                className={`input-field ${errors.email ? 'border-[hsl(var(--accent))]' : ''}`}
              />
              {errors.email && <p className="font-body text-xs text-[hsl(var(--accent))] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="inquiry-message" className="input-label">{t.message}</label>
              <textarea
                id="inquiry-message"
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t.messagePlaceholder}
                className="input-field resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitted}
              className="w-full py-3 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent))] disabled:opacity-50"
              style={{ transition: `background-color var(--motion-normal) var(--ease-out)` }}
            >
              {t.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ─── Related Works (Semantic) ─── */

interface RelatedCategory {
  label: string
  works: Artwork[]
}

function RelatedWorks({
  currentId,
  currentSeries,
  currentTechnique,
  currentYear,
  locale,
}: {
  currentId: string
  currentSeries: string
  currentTechnique: string
  currentYear: number
  locale: 'es' | 'en'
}) {
  const allArtworks = useArtworks()

  const categories = useMemo(() => {
    const others = allArtworks.filter(a => a.id !== currentId)
    const used = new Set<string>()
    const cats: RelatedCategory[] = []

    const labels = {
      series: locale === 'es' ? 'Misma serie' : 'Same series',
      technique: locale === 'es' ? 'Misma técnica' : 'Same technique',
      year: locale === 'es' ? 'Mismo año' : 'Same year',
      discover: locale === 'es' ? 'Descubrir' : 'Discover',
    }

    // Same series (skip if no series assigned)
    const sameSeries = currentSeries ? others.filter(a => a.series === currentSeries && !used.has(a.id)).slice(0, 2) : []
    if (sameSeries.length > 0) {
      sameSeries.forEach(a => used.add(a.id))
      cats.push({ label: labels.series, works: sameSeries })
    }

    // Same technique
    const sameTechnique = others.filter(a => a.technique === currentTechnique && !used.has(a.id)).slice(0, 2)
    if (sameTechnique.length > 0) {
      sameTechnique.forEach(a => used.add(a.id))
      cats.push({ label: labels.technique, works: sameTechnique })
    }

    // Same year
    const sameYear = others.filter(a => a.year === currentYear && !used.has(a.id)).slice(0, 2)
    if (sameYear.length > 0) {
      sameYear.forEach(a => used.add(a.id))
      cats.push({ label: labels.year, works: sameYear })
    }

    // Total count
    const total = cats.reduce((sum, c) => sum + c.works.length, 0)

    // Fill with discover if needed
    if (total < 2) {
      const discover = others.filter(a => !used.has(a.id)).slice(0, 6 - total)
      if (discover.length > 0) {
        cats.push({ label: labels.discover, works: discover })
      }
    }

    // Cap at 6 total
    let remaining = 6
    return cats.map(cat => {
      const trimmed = cat.works.slice(0, remaining)
      remaining -= trimmed.length
      return { ...cat, works: trimmed }
    }).filter(cat => cat.works.length > 0)
  }, [allArtworks, currentId, currentSeries, currentTechnique, currentYear, locale])

  return (
    <section className="mt-20 sm:mt-28 border-t border-[hsl(var(--border))] pt-10 sm:pt-14">
      <p className="font-body text-sm tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] mb-8">
        {locale === 'es' ? 'Otras obras' : 'Other works'}
      </p>
      <div className="space-y-10">
        {categories.map((cat) => (
          <div key={cat.label}>
            <p className="text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">
              {cat.label}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {cat.works.map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/obra/${artwork.id}`}
                  className="group"
                >
                  <div className="relative overflow-hidden bg-[hsl(var(--muted))] aspect-[4/5]">
                    <Image
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={locale === 'es' ? artwork.title : artwork.titleEn}
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.03]"
                      style={{ transitionDuration: 'var(--motion-slow)' }}
                      sizes="(max-width: 640px) 50vw, 30vw"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent))]"
                      style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
                    >
                      {locale === 'es' ? artwork.title : artwork.titleEn}
                    </p>
                    <p className="font-body text-xs text-[hsl(var(--foreground-subtle))] mt-1">
                      {artwork.year} &middot; {artwork.dimensions}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Main Detail Page ─── */

export default function ArtworkDetailContent({ artwork }: { artwork: Artwork }) {
  const { locale } = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Live-refresh artwork status from API
  const liveArtwork = useArtwork(artwork.id)
  const currentArtwork = liveArtwork ?? artwork

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const content = {
    es: {
      year: 'Año',
      technique: 'Técnica',
      dimensions: 'Dimensiones',
      inquire: 'Consultar adquisición',
      back: 'Catálogo',
      zoom: 'Ampliar',
    },
    en: {
      year: 'Year',
      technique: 'Technique',
      dimensions: 'Dimensions',
      inquire: 'Inquire about acquisition',
      back: 'Catalogue',
      zoom: 'Zoom',
    },
  }

  const t = content[locale]

  return (
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32">
      <div className="container-gallery">
        {/* ── Breadcrumb row ── */}
        <div
          className="flex items-center gap-2 mb-8 sm:mb-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity var(--motion-slow) var(--ease-out)',
          }}
        >
          <Link
            href="/obra"
            className="inline-flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent))] group"
            style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" style={{ transitionDuration: 'var(--motion-normal)' }} fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </svg>
            <span className="font-body text-xs">{t.back}</span>
          </Link>
          {(currentArtwork.series || currentArtwork.seriesEn) && (
            <>
              <span className="text-[hsl(var(--border-strong))] font-body text-xs">/</span>
              <span className="font-body text-xs text-[hsl(var(--foreground-subtle))]">
                {locale === 'es' ? currentArtwork.series : currentArtwork.seriesEn}
              </span>
            </>
          )}
        </div>

        {/* ── Title ── */}
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-[hsl(var(--foreground))] leading-[1.0] mb-10 sm:mb-14 max-w-4xl"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'none' : 'translateY(12px)',
            transition: 'opacity var(--motion-slow) var(--ease-out) 100ms, transform var(--motion-slow) var(--ease-out) 100ms',
          }}
        >
          {locale === 'es' ? currentArtwork.title : currentArtwork.titleEn}
        </h1>

        {/* ── Artwork image — gallery wall ── */}
        <div
          className="mb-14 sm:mb-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s var(--ease-out) 200ms',
          }}
        >
          <button
            onClick={() => setIsZoomOpen(true)}
            className="group relative w-full cursor-zoom-in"
            aria-label={t.zoom}
          >
            {/* The painting — with crop marks */}
            <div className="crop-marks mx-auto" style={{ maxWidth: '920px' }}>
              <div className="relative aspect-[4/3] sm:aspect-[3/2] bg-[hsl(var(--card))]">
                <Image
                  src={currentArtwork.imageUrl || "/placeholder.svg"}
                  alt={locale === 'es' ? currentArtwork.title : currentArtwork.titleEn}
                  fill
                  className="object-contain p-3 sm:p-5"
                  sizes="(max-width: 1024px) 90vw, 920px"
                  priority
                />
              </div>
            </div>

            {/* Zoom hint — hover on desktop, always visible on mobile */}
            <div
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1.5 py-1.5 px-3 bg-[hsl(var(--foreground))]/80 text-[hsl(var(--background))] sm:opacity-0 sm:group-hover:opacity-100"
              style={{ transition: 'opacity var(--motion-normal) var(--ease-out)' }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21L16.65 16.65" />
                <path d="M11 8V14M8 11H14" />
              </svg>
              <span className="font-body text-xs">{t.zoom}</span>
            </div>
          </button>
        </div>

        {/* ── Siena accent line ── */}
        <div className="w-8 h-[2px] bg-[hsl(var(--accent))] mb-10 sm:mb-14" />

        {/* ── Placard: metadata + description ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column: technical data + CTA */}
          <div className="lg:col-span-4">
            {/* Status */}
            <p className={`font-annotation text-sm mb-8 ${
              currentArtwork.status === 'available' ? 'text-[hsl(var(--accent))]'
              : currentArtwork.status === 'reserved' ? 'text-[hsl(var(--ultra))]'
              : 'text-[hsl(var(--foreground-subtle))]'
            }`}>
              {getStatusLabel(currentArtwork.status, locale, 'long')}
            </p>

            {/* Technical details — stacked labels */}
            <div className="space-y-5">
              {[
                { label: t.year, value: String(currentArtwork.year) },
                { label: t.technique, value: locale === 'es' ? currentArtwork.technique : currentArtwork.techniqueEn },
                { label: t.dimensions, value: currentArtwork.dimensions },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] mb-1">
                    {item.label}
                  </p>
                  <p className="font-body text-sm text-[hsl(var(--foreground))]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Career timeline */}
            <CareerTimeline year={currentArtwork.year} locale={locale} />

            {/* CTA */}
            {currentArtwork.status === 'available' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-10 inline-flex items-center gap-3 py-3 px-6 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent))]"
                style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}
              >
                {t.inquire}
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                </svg>
              </button>
            )}
          </div>

          {/* Siena separator — mobile only (grid collapses to 1 col) */}
          <div className="w-8 h-[2px] bg-[hsl(var(--accent))] lg:hidden" />

          {/* Right column: description with ultramarino accent */}
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="flex gap-5 sm:gap-6">
              {/* Vertical accent bar */}
              <div className="w-[3px] bg-[hsl(var(--ultra))] shrink-0 hidden sm:block" />
              <div>
                <p className="font-body text-base sm:text-lg text-[hsl(var(--foreground-muted))] leading-[1.7]">
                  {locale === 'es' ? currentArtwork.description : currentArtwork.descriptionEn}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related works */}
        <RelatedWorks
          currentId={currentArtwork.id}
          currentSeries={currentArtwork.series}
          currentTechnique={currentArtwork.technique}
          currentYear={currentArtwork.year}
          locale={locale}
        />

        <div className="pb-16 sm:pb-24" />
      </div>

      {/* Modals */}
      <ZoomViewer
        imageUrl={currentArtwork.imageUrl}
        alt={locale === 'es' ? currentArtwork.title : currentArtwork.titleEn}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        locale={locale}
        title={locale === 'es' ? currentArtwork.title : currentArtwork.titleEn}
        year={currentArtwork.year}
      />

      <InquiryModal
        artwork={currentArtwork}
        locale={locale}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
