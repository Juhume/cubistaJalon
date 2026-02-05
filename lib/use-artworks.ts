import { useState, useEffect, useSyncExternalStore, useCallback } from 'react'
import { artworks as staticArtworks, type Artwork } from './artworks'

/**
 * Shared fetch cache — prevents duplicate API calls when multiple
 * components call useArtworks() simultaneously.
 */
let sharedArtworks: Artwork[] = staticArtworks
let fetchPromise: Promise<void> | null = null
let listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach(l => l())
}

function fetchArtworksOnce() {
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/api/artworks')
    .then(res => {
      if (!res.ok) throw new Error('API error')
      return res.json()
    })
    .then((data: Artwork[]) => {
      sharedArtworks = data
      notifyListeners()
    })
    .catch(() => {
      // Keep static data — silent fallback
    })
    .finally(() => {
      fetchPromise = null
    })

  return fetchPromise
}

/**
 * Hook: optimistic-static with shared live refresh.
 * All components share a single fetch — no duplicate API calls.
 * Renders instantly from static data, then refreshes from API in background.
 */
export function useArtworks() {
  const subscribe = useCallback((callback: () => void) => {
    listeners.add(callback)
    return () => { listeners.delete(callback) }
  }, [])

  const getSnapshot = useCallback(() => sharedArtworks, [])

  const artworks = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    fetchArtworksOnce()
  }, [])

  return artworks
}

/**
 * Single artwork hook. Uses shared cache when available,
 * falls back to individual fetch.
 */
export function useArtwork(id: string) {
  const staticArtwork = staticArtworks.find(a => a.id === id) ?? null
  const [artwork, setArtwork] = useState<Artwork | null>(staticArtwork)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/artworks/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('API error')
        return res.json()
      })
      .then((data: Artwork) => {
        if (!cancelled) setArtwork(data)
      })
      .catch(() => {
        // Keep static data — silent fallback
      })

    return () => { cancelled = true }
  }, [id])

  return artwork
}
