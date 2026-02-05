'use client'

import React from "react"
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Artwork } from '@/lib/artworks'

type NewArtworkForm = {
  id: string
  title: string
  titleEn: string
  year: string
  technique: string
  techniqueEn: string
  dimensions: string
  series: string
  seriesEn: string
  status: 'available' | 'sold' | 'reserved'
  description: string
  descriptionEn: string
  imageUrl: string
}

const emptyForm: NewArtworkForm = {
  id: '',
  title: '',
  titleEn: '',
  year: '',
  technique: '',
  techniqueEn: '',
  dimensions: '',
  series: '',
  seriesEn: '',
  status: 'available',
  description: '',
  descriptionEn: '',
  imageUrl: '',
}

function Toast({ message, onDismiss }: { message: { type: 'success' | 'error'; text: string }; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed top-6 right-6 z-[70] max-w-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 300ms var(--ease-out), transform 300ms var(--ease-out)',
      }}
    >
      <div className={`p-4 border font-body text-sm ${
        message.type === 'success'
          ? 'bg-[hsl(var(--background))] border-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
          : 'bg-[hsl(var(--background))] border-red-400 text-red-600'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              message.type === 'success' ? 'bg-[hsl(var(--accent))]' : 'bg-red-500'
            }`} />
            {message.text}
          </div>
          <button
            onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
            className="text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--foreground))] shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6L18 18M6 18L18 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, onClick, updating }: { status: string; onClick: () => void; updating: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={updating}
      className={`
        relative font-annotation text-xs py-1.5 px-4 min-w-[100px]
        ${artwork_status_classes(status)}
        ${updating ? 'opacity-50' : ''}
      `}
      style={{ transition: 'all var(--motion-normal) var(--ease-out)' }}
      title={status === 'available' ? 'Reservar' : status === 'reserved' ? 'Marcar como vendida' : 'Marcar como disponible'}
    >
      {updating ? (
        <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        status === 'available' ? 'Disponible' : status === 'reserved' ? 'Reservada' : 'Vendida'
      )}
    </button>
  )
}

function artwork_status_classes(status: string): string {
  if (status === 'available') {
    return 'text-[hsl(var(--accent))] border border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--background))]'
  }
  if (status === 'reserved') {
    return 'text-[hsl(var(--ultra))] border border-[hsl(var(--ultra))] hover:bg-[hsl(var(--ultra))] hover:text-[hsl(var(--background))]'
  }
  return 'text-[hsl(var(--foreground-subtle))] border border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--background))]'
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newArtwork, setNewArtwork] = useState<NewArtworkForm>(emptyForm)

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(false)

    // Validate token by attempting a test PATCH (read first artwork, patch with same data)
    try {
      const listRes = await fetch('/api/artworks')
      if (!listRes.ok) throw new Error('API down')
      const allArtworks = await listRes.json() as Artwork[]

      if (allArtworks.length > 0) {
        const testArtwork = allArtworks[0]
        const testRes = await fetch(`/api/artworks/${testArtwork.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featured: testArtwork.featured }),
        })

        if (testRes.status === 401) {
          setLoginError(true)
          return
        }
      }

      setIsAuthenticated(true)
      setArtworks(allArtworks)
    } catch {
      setMessage({ type: 'error', text: 'Error conectando con el API' })
    }
  }

  const toggleStatus = async (artwork: Artwork) => {
    const cycle: Record<string, 'available' | 'sold' | 'reserved'> = {
      available: 'reserved',
      reserved: 'sold',
      sold: 'available',
    }
    const newStatus = cycle[artwork.status] || 'available'
    setUpdatingId(artwork.id)
    try {
      const res = await fetch(`/api/artworks/${artwork.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        if (res.status === 401) {
          setMessage({ type: 'error', text: 'Sesión expirada' })
          setIsAuthenticated(false)
          return
        }
        throw new Error('Update failed')
      }
      const updated = await res.json() as Artwork
      setArtworks(prev => prev.map(a => a.id === artwork.id ? updated : a))
      const statusLabels: Record<string, string> = { available: 'Disponible', reserved: 'Reservada', sold: 'Vendida' }
      setMessage({
        type: 'success',
        text: `${artwork.title} — ${statusLabels[newStatus]}`,
      })
    } catch {
      setMessage({ type: 'error', text: 'Error actualizando estado' })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (artwork: Artwork) => {
    if (!confirm(`Eliminar "${artwork.title}"?\n\nEsta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/artworks/${artwork.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        if (res.status === 401) {
          setMessage({ type: 'error', text: 'Sesión expirada' })
          setIsAuthenticated(false)
          return
        }
        throw new Error('Delete failed')
      }
      setArtworks(prev => prev.filter(a => a.id !== artwork.id))
      setMessage({ type: 'success', text: `Eliminada: ${artwork.title}` })
    } catch {
      setMessage({ type: 'error', text: 'Error eliminando obra' })
    }
  }

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body: Artwork = {
        ...newArtwork,
        year: parseInt(newArtwork.year, 10),
        featured: false,
        gridSpan: { cols: 4, rows: 1 },
      }
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        if (res.status === 401) {
          setMessage({ type: 'error', text: 'Sesión expirada' })
          setIsAuthenticated(false)
          return
        }
        const err = await res.json()
        throw new Error(err.error || 'Error al crear')
      }
      const created = await res.json() as Artwork
      setArtworks(prev => [...prev, created])
      setMessage({ type: 'success', text: `Añadida: ${newArtwork.title}` })
      setNewArtwork(emptyForm)
      setShowAddForm(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error añadiendo obra'
      setMessage({ type: 'error', text: msg })
    }
  }

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setNewArtwork({ ...newArtwork, title, id: slug })
  }

  const availableCount = artworks.filter(a => a.status === 'available').length
  const reservedCount = artworks.filter(a => a.status === 'reserved').length
  const soldCount = artworks.filter(a => a.status === 'sold').length

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background-dark))] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-8">
          <div>
            <p className="font-display text-2xl text-[hsl(var(--foreground-light))]">
              Cubista Jalón
            </p>
            <p className="font-body text-xs text-[hsl(var(--foreground-light-muted))] mt-1 tracking-[0.08em] uppercase">
              Administración
            </p>
          </div>

          <div>
            <label className="block font-body text-[0.7rem] tracking-[0.08em] uppercase text-[hsl(var(--foreground-light-muted))] mb-2">
              Token de acceso
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => { setToken(e.target.value); setLoginError(false) }}
              required
              className="w-full py-3 px-0 bg-transparent border-b text-[hsl(var(--foreground-light))] font-body text-sm focus:outline-none"
              style={{
                borderBottomColor: loginError
                  ? 'hsl(0, 72%, 51%)'
                  : 'hsl(var(--foreground-light-muted) / 0.3)',
                transition: 'border-color var(--motion-normal) var(--ease-out)',
              }}
              onFocus={(e) => {
                if (!loginError) e.target.style.borderBottomColor = 'hsl(var(--accent))'
              }}
              onBlur={(e) => {
                if (!loginError) e.target.style.borderBottomColor = 'hsl(var(--foreground-light-muted) / 0.3)'
              }}
              autoFocus
            />
            {loginError && (
              <p className="font-body text-xs text-red-400 mt-2">
                Token incorrecto
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[hsl(var(--accent))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent-light))]"
            style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}
          >
            Acceder
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Toast notifications */}
      {message && <Toast message={message} onDismiss={() => setMessage(null)} />}

      {/* Header bar */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="font-display text-lg text-[hsl(var(--foreground))]">Admin</p>
            <span className="hidden sm:inline-block w-px h-4 bg-[hsl(var(--border))]" />
            <div className="hidden sm:flex items-center gap-3 font-body text-xs text-[hsl(var(--foreground-muted))]">
              <span>{artworks.length} obras</span>
              <span className="text-[hsl(var(--accent))]">{availableCount} disponibles</span>
              {reservedCount > 0 && <span className="text-[hsl(var(--ultra))]">{reservedCount} reservadas</span>}
              <span className="text-[hsl(var(--foreground-subtle))]">{soldCount} vendidas</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-2 px-4 font-body text-sm bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]"
              style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}
            >
              {showAddForm ? 'Cancelar' : '+ Nueva obra'}
            </button>
            <button
              onClick={() => { setIsAuthenticated(false); setToken('') }}
              className="py-2 px-3 font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
              style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleAddArtwork} className="mb-10 border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <h2 className="font-display text-lg text-[hsl(var(--foreground))]">Nueva obra</h2>
              <p className="font-body text-xs text-[hsl(var(--foreground-subtle))]">
                Todos los campos son obligatorios
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-8">
              {/* Identification */}
              <div>
                <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">
                  Identificación
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="input-label">Título (ES)</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="input-field"
                      placeholder="Fragmentos del Tiempo"
                    />
                  </div>
                  <div>
                    <label className="input-label">Año</label>
                    <input
                      type="number"
                      required
                      value={newArtwork.year}
                      onChange={(e) => setNewArtwork({ ...newArtwork, year: e.target.value })}
                      className="input-field"
                      placeholder="2024"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <label className="input-label">Title (EN)</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.titleEn}
                      onChange={(e) => setNewArtwork({ ...newArtwork, titleEn: e.target.value })}
                      className="input-field"
                      placeholder="Fragments of Time"
                    />
                  </div>
                  <div>
                    <label className="input-label">ID (slug)</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.id}
                      onChange={(e) => setNewArtwork({ ...newArtwork, id: e.target.value })}
                      className="input-field text-[hsl(var(--foreground-subtle))]"
                    />
                  </div>
                </div>
              </div>

              {/* Technical */}
              <div>
                <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">
                  Datos técnicos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Técnica (ES)</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.technique}
                      onChange={(e) => setNewArtwork({ ...newArtwork, technique: e.target.value })}
                      className="input-field"
                      placeholder="Óleo sobre lienzo"
                    />
                  </div>
                  <div>
                    <label className="input-label">Technique (EN)</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.techniqueEn}
                      onChange={(e) => setNewArtwork({ ...newArtwork, techniqueEn: e.target.value })}
                      className="input-field"
                      placeholder="Oil on canvas"
                    />
                  </div>
                  <div>
                    <label className="input-label">Dimensiones</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.dimensions}
                      onChange={(e) => setNewArtwork({ ...newArtwork, dimensions: e.target.value })}
                      className="input-field"
                      placeholder="150 x 120 cm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="input-label">Serie (ES)</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.series}
                      onChange={(e) => setNewArtwork({ ...newArtwork, series: e.target.value })}
                      className="input-field"
                      placeholder="Deconstrucciones"
                    />
                  </div>
                  <div>
                    <label className="input-label">Series (EN)</label>
                    <input
                      type="text"
                      required
                      value={newArtwork.seriesEn}
                      onChange={(e) => setNewArtwork({ ...newArtwork, seriesEn: e.target.value })}
                      className="input-field"
                      placeholder="Deconstructions"
                    />
                  </div>
                  <div>
                    <label className="input-label">Estado</label>
                    <select
                      value={newArtwork.status}
                      onChange={(e) => setNewArtwork({ ...newArtwork, status: e.target.value as 'available' | 'sold' | 'reserved' })}
                      className="input-field"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="available">Disponible</option>
                      <option value="reserved">Reservada</option>
                      <option value="sold">Vendida</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">
                  Contenido
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">URL de imagen</label>
                    <input
                      type="url"
                      required
                      value={newArtwork.imageUrl}
                      onChange={(e) => setNewArtwork({ ...newArtwork, imageUrl: e.target.value })}
                      className="input-field"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Descripción (ES)</label>
                      <textarea
                        required
                        rows={3}
                        value={newArtwork.description}
                        onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                        className="input-field resize-none"
                      />
                    </div>
                    <div>
                      <label className="input-label">Description (EN)</label>
                      <textarea
                        required
                        rows={3}
                        value={newArtwork.descriptionEn}
                        onChange={(e) => setNewArtwork({ ...newArtwork, descriptionEn: e.target.value })}
                        className="input-field resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="p-5 border-t border-[hsl(var(--border))] flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent))]"
                style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}
              >
                Crear obra
              </button>
            </div>
          </form>
        )}

        {/* Artworks table */}
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[hsl(var(--foreground))]">
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 w-12">&nbsp;</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Obra</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 hidden sm:table-cell">Serie</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 hidden md:table-cell">Año</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 hidden lg:table-cell">Dimensiones</th>
                  <th className="text-center font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Estado</th>
                  <th className="text-right font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map((artwork) => (
                  <tr
                    key={artwork.id}
                    className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                    style={{ transition: 'background-color var(--motion-fast) var(--ease-out)' }}
                  >
                    <td className="py-3 pr-4">
                      <div className="relative w-10 h-10 overflow-hidden bg-[hsl(var(--muted))]">
                        <Image
                          src={artwork.imageUrl || '/placeholder.svg'}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-display text-sm text-[hsl(var(--foreground))]">
                        {artwork.title}
                      </span>
                      <span className="block font-body text-[0.7rem] text-[hsl(var(--foreground-subtle))] mt-0.5">
                        {artwork.titleEn}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{artwork.series}</span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{artwork.year}</span>
                    </td>
                    <td className="py-3 pr-4 hidden lg:table-cell">
                      <span className="font-body text-xs text-[hsl(var(--foreground-subtle))]">{artwork.dimensions}</span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <StatusBadge
                        status={artwork.status}
                        onClick={() => toggleStatus(artwork)}
                        updating={updatingId === artwork.id}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(artwork)}
                        className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-red-500 py-1 px-2"
                        style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-[hsl(var(--border))] flex items-center justify-between">
          <p className="font-body text-xs text-[hsl(var(--foreground-subtle))]">
            {artworks.length} obras en catálogo
          </p>
          <p className="font-body text-xs text-[hsl(var(--foreground-subtle))]">
            Token: ****{token.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  )
}
