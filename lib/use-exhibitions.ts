import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { exhibitions as staticExhibitions, type Exhibition } from './artworks'

let sharedExhibitions: Exhibition[] = staticExhibitions
let fetchPromise: Promise<void> | null = null
let listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach(l => l())
}

function fetchExhibitionsOnce() {
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/api/exhibitions')
    .then(res => {
      if (!res.ok) throw new Error('API error')
      return res.json()
    })
    .then((data: Exhibition[]) => {
      sharedExhibitions = data
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

export function invalidateExhibitions() {
  fetchPromise = null
  fetchExhibitionsOnce()
}

export function useExhibitions() {
  const subscribe = useCallback((callback: () => void) => {
    listeners.add(callback)
    return () => { listeners.delete(callback) }
  }, [])

  const getSnapshot = useCallback(() => sharedExhibitions, [])

  const exhibitions = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    fetchExhibitionsOnce()
  }, [])

  return exhibitions
}
