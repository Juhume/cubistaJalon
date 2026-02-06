import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { series as staticSeries } from './artworks'

export interface Series {
  id: string
  name: string
  nameEn: string
}

let sharedSeries: Series[] = staticSeries
let fetchPromise: Promise<void> | null = null
let listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach(l => l())
}

function fetchSeriesOnce() {
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/api/series')
    .then(res => {
      if (!res.ok) throw new Error('API error')
      return res.json()
    })
    .then((data: Series[]) => {
      sharedSeries = data
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

export function invalidateSeries() {
  fetchPromise = null
  fetchSeriesOnce()
}

export function useSeries() {
  const subscribe = useCallback((callback: () => void) => {
    listeners.add(callback)
    return () => { listeners.delete(callback) }
  }, [])

  const getSnapshot = useCallback(() => sharedSeries, [])

  const series = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    fetchSeriesOnce()
  }, [])

  return series
}
