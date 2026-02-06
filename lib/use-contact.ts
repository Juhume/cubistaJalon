import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { contact as staticContact } from './contact'

export interface ContactData {
  email: string
  instagram: {
    handle: string
    url: string
  }
}

let sharedContact: ContactData = staticContact
let fetchPromise: Promise<void> | null = null
let listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach(l => l())
}

function fetchContactOnce() {
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch('/api/contact')
    .then(res => {
      if (!res.ok) throw new Error('API error')
      return res.json()
    })
    .then((data: ContactData) => {
      sharedContact = data
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

export function invalidateContact() {
  fetchPromise = null
  fetchContactOnce()
}

export function useContact() {
  const subscribe = useCallback((callback: () => void) => {
    listeners.add(callback)
    return () => { listeners.delete(callback) }
  }, [])

  const getSnapshot = useCallback(() => sharedContact, [])

  const contact = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    fetchContactOnce()
  }, [])

  return contact
}
