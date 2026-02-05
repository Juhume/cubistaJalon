import { useState, useEffect } from 'react'
import { artworks as staticArtworks, type Artwork } from './artworks'

/**
 * Hook: optimistic-static with live refresh.
 * Renders instantly from static data, then refreshes from API in background.
 * If API fails, keeps static data (graceful fallback).
 */
export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>(staticArtworks)

  useEffect(() => {
    let cancelled = false

    fetch('/api/artworks')
      .then(res => {
        if (!res.ok) throw new Error('API error')
        return res.json()
      })
      .then((data: Artwork[]) => {
        if (!cancelled) setArtworks(data)
      })
      .catch(() => {
        // Keep static data — silent fallback
      })

    return () => { cancelled = true }
  }, [])

  return artworks
}

/**
 * Single artwork hook. Same pattern: static first, then live.
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
