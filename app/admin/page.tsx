'use client'

import React from "react"
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { type Artwork, type Exhibition, isCurrentExhibition } from '@/lib/artworks'

/* ─── Types ─── */

type Tab = 'obras' | 'exposiciones' | 'contacto'

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

type ExhibitionForm = {
  id: string
  title: string
  titleEn: string
  venue: string
  location: string
  locationEn: string
  startDate: string
  endDate: string
  description: string
  descriptionEn: string
  imageUrl: string
}

type SeriesItem = { id: string; name: string; nameEn: string }
type SeriesForm = { id: string; name: string; nameEn: string }

type ContactData = {
  email: string
  instagram: { handle: string; url: string }
}

/* ─── Constants ─── */

const emptyArtworkForm: NewArtworkForm = {
  id: '', title: '', titleEn: '', year: '', technique: '', techniqueEn: '',
  dimensions: '', series: '', seriesEn: '', status: 'available',
  description: '', descriptionEn: '', imageUrl: '',
}

const emptyExhibitionForm: ExhibitionForm = {
  id: '', title: '', titleEn: '', venue: '', location: '', locationEn: '',
  startDate: '', endDate: '', description: '', descriptionEn: '', imageUrl: '',
}

const emptySeriesForm: SeriesForm = { id: '', name: '', nameEn: '' }

/* ─── Shared Components ─── */

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

function ConfirmModal({ title, body, onConfirm, onCancel }: {
  title: string; body: React.ReactNode; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-[hsl(var(--background-dark))] opacity-80" />
      <div className="relative w-full max-w-sm border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-8 h-8 border border-red-400 text-red-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <h3 className="font-display text-base text-[hsl(var(--foreground))]">{title}</h3>
            <div className="font-body text-sm text-[hsl(var(--foreground-muted))] mt-1">{body}</div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="py-2 px-4 font-body text-sm text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]" style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="py-2 px-4 font-body text-sm bg-red-500 text-white hover:bg-red-600" style={{ transition: 'background-color var(--motion-fast) var(--ease-out)' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, onClick, updating }: { status: string; onClick: () => void; updating: boolean }) {
  const classes =
    status === 'available'
      ? 'text-[hsl(var(--accent))] border border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--background))]'
      : status === 'reserved'
        ? 'text-[hsl(var(--ultra))] border border-[hsl(var(--ultra))] hover:bg-[hsl(var(--ultra))] hover:text-[hsl(var(--background))]'
        : 'text-[hsl(var(--foreground-subtle))] border border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--background))]'

  return (
    <button
      onClick={onClick}
      disabled={updating}
      className={`relative font-annotation text-xs py-1.5 px-4 min-w-[100px] ${classes} ${updating ? 'opacity-50' : ''}`}
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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type FormLang = 'es' | 'en'

function LangToggle({ lang, onChange }: { lang: FormLang; onChange: (l: FormLang) => void }) {
  return (
    <div className="inline-flex border border-[hsl(var(--border))]">
      {(['es', 'en'] as const).map(l => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className="py-1 px-3 font-body text-xs tracking-[0.04em] uppercase"
          style={{
            backgroundColor: lang === l ? 'hsl(var(--accent))' : 'transparent',
            color: lang === l ? 'hsl(var(--background))' : 'hsl(var(--foreground-muted))',
            transition: 'all var(--motion-fast) var(--ease-out)',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function ImageUrlField({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  const [imgError, setImgError] = useState(false)
  const showPreview = value.startsWith('http') && !imgError

  // Reset error when URL changes
  useEffect(() => { setImgError(false) }, [value])

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="input-label">URL de imagen{required && <Req />}</label>
        <input type="url" required={required} value={value} onChange={e => onChange(e.target.value)} className="input-field" placeholder="https://images.unsplash.com/..." />
      </div>
      <div className="shrink-0 w-12 h-12 border border-[hsl(var(--border))] bg-[hsl(var(--muted))] overflow-hidden mb-px flex items-center justify-center">
        {showPreview ? (
          <Image src={value} alt="Preview" width={48} height={48} className="object-cover w-full h-full" onError={() => setImgError(true)} />
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[hsl(var(--foreground-subtle))] opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16l4-4a3 3 0 014 0l4 4m-2-2l1-1a3 3 0 014 0l3 3M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    </div>
  )
}

function Req() {
  return <span className="text-[hsl(var(--accent))] ml-0.5" aria-hidden="true">*</span>
}

function RequiredLegend() {
  return <p className="font-body text-xs text-[hsl(var(--foreground-subtle))]"><span className="text-[hsl(var(--accent))]">*</span> Campo obligatorio</p>
}

function SubmitButton({ submitting, label, labelSubmitting }: { submitting: boolean; label: string; labelSubmitting?: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="py-2.5 px-6 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent))] disabled:opacity-60 flex items-center gap-2"
      style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}
    >
      {submitting && <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {submitting ? (labelSubmitting || 'Guardando...') : label}
    </button>
  )
}

/* ─── Tab: Obras ─── */

function ObrasTab({ authHeaders, toast, onExpire }: {
  authHeaders: () => Record<string, string>
  toast: (msg: { type: 'success' | 'error'; text: string }) => void
  onExpire: () => void
}) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newArtwork, setNewArtwork] = useState<NewArtworkForm>(emptyArtworkForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Artwork | null>(null)
  const [formLang, setFormLang] = useState<FormLang>('es')
  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Inline series creation from dropdown
  const [inlineSeries, setInlineSeries] = useState(false)
  const [inlineSeriesName, setInlineSeriesName] = useState('')
  const [inlineSeriesNameEn, setInlineSeriesNameEn] = useState('')
  const [inlineSeriesSubmitting, setInlineSeriesSubmitting] = useState(false)

  // Series management panel
  const [showSeriesPanel, setShowSeriesPanel] = useState(false)
  const [seriesForm, setSeriesForm] = useState<SeriesForm>(emptySeriesForm)
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null)
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [pendingDeleteSeries, setPendingDeleteSeries] = useState<SeriesItem | null>(null)
  const [submittingSeries, setSubmittingSeries] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/artworks').then(r => r.json()),
      fetch('/api/series').then(r => r.json()),
    ]).then(([a, s]) => { setArtworks(a); setSeriesList(s) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  // Compute artwork counts per series
  const seriesOptions = seriesList.filter(s => s.id !== 'all')
  const artworkCounts: Record<string, number> = {}
  const nameToId = new Map(seriesList.map(s => [s.name, s.id]))
  artworks.forEach(a => {
    const id = nameToId.get(a.series)
    if (id) artworkCounts[id] = (artworkCounts[id] || 0) + 1
  })

  const toggleStatus = async (artwork: Artwork) => {
    const cycle: Record<string, 'available' | 'sold' | 'reserved'> = { available: 'reserved', reserved: 'sold', sold: 'available' }
    const newStatus = cycle[artwork.status] || 'available'
    setUpdatingId(artwork.id)
    try {
      const res = await fetch(`/api/artworks/${artwork.id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status: newStatus }) })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; throw new Error() }
      const updated = await res.json() as Artwork
      setArtworks(prev => prev.map(a => a.id === artwork.id ? updated : a))
      const labels: Record<string, string> = { available: 'Disponible', reserved: 'Reservada', sold: 'Vendida' }
      toast({ type: 'success', text: `${artwork.title} — ${labels[newStatus]}` })
    } catch { toast({ type: 'error', text: 'Error actualizando estado' }) }
    finally { setUpdatingId(null) }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const artwork = pendingDelete
    setPendingDelete(null)
    try {
      const res = await fetch(`/api/artworks/${artwork.id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; throw new Error() }
      setArtworks(prev => prev.filter(a => a.id !== artwork.id))
      toast({ type: 'success', text: `Eliminada: ${artwork.title}` })
    } catch { toast({ type: 'error', text: 'Error eliminando obra' }) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const isEdit = !!editingId
    try {
      const body = isEdit
        ? { title: newArtwork.title, titleEn: newArtwork.titleEn, year: parseInt(newArtwork.year, 10), technique: newArtwork.technique, techniqueEn: newArtwork.techniqueEn, dimensions: newArtwork.dimensions, series: newArtwork.series, seriesEn: newArtwork.seriesEn, status: newArtwork.status, description: newArtwork.description, descriptionEn: newArtwork.descriptionEn, imageUrl: newArtwork.imageUrl }
        : { ...newArtwork, year: parseInt(newArtwork.year, 10), featured: false, gridSpan: { cols: 4, rows: 1 } }
      const url = isEdit ? `/api/artworks/${editingId}` : '/api/artworks'
      const res = await fetch(url, { method: isEdit ? 'PATCH' : 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; const err = await res.json(); throw new Error(err.error || 'Error') }
      const result = await res.json() as Artwork
      if (isEdit) { setArtworks(prev => prev.map(a => a.id === editingId ? result : a)) }
      else { setArtworks(prev => [...prev, result]) }
      toast({ type: 'success', text: `${isEdit ? 'Actualizada' : 'Añadida'}: ${newArtwork.title}` })
      cancelForm()
    } catch (err) { toast({ type: 'error', text: err instanceof Error ? err.message : 'Error' }) }
    finally { setSubmitting(false) }
  }

  const handleEdit = (artwork: Artwork) => {
    setNewArtwork({ id: artwork.id, title: artwork.title, titleEn: artwork.titleEn, year: String(artwork.year), technique: artwork.technique, techniqueEn: artwork.techniqueEn, dimensions: artwork.dimensions, series: artwork.series, seriesEn: artwork.seriesEn, status: artwork.status, description: artwork.description, descriptionEn: artwork.descriptionEn, imageUrl: artwork.imageUrl })
    setEditingId(artwork.id)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDuplicate = (artwork: Artwork) => {
    setNewArtwork({ id: '', title: '', titleEn: '', year: String(artwork.year), technique: artwork.technique, techniqueEn: artwork.techniqueEn, dimensions: artwork.dimensions, series: artwork.series, seriesEn: artwork.seriesEn, status: 'available', description: artwork.description, descriptionEn: artwork.descriptionEn, imageUrl: artwork.imageUrl })
    setEditingId(null)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelForm = () => { setShowAddForm(false); setEditingId(null); setNewArtwork(emptyArtworkForm); setFormLang('es'); setInlineSeries(false) }

  const handleTitleChange = (title: string) => {
    setNewArtwork({ ...newArtwork, title, id: editingId ? newArtwork.id : generateSlug(title) })
  }

  const handleSeriesSelect = (value: string) => {
    if (value === '__new__') {
      setInlineSeries(true)
      setInlineSeriesName('')
      setInlineSeriesNameEn('')
      return
    }
    const match = seriesList.find(s => s.name === value)
    setNewArtwork({ ...newArtwork, series: value, seriesEn: match ? match.nameEn : newArtwork.seriesEn })
  }

  // Inline series creation
  const handleInlineSeriesCreate = async () => {
    if (!inlineSeriesName.trim() || !inlineSeriesNameEn.trim()) return
    setInlineSeriesSubmitting(true)
    try {
      const body = { id: generateSlug(inlineSeriesName), name: inlineSeriesName, nameEn: inlineSeriesNameEn }
      const res = await fetch('/api/series', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; const err = await res.json(); throw new Error(err.error || 'Error') }
      const result = await res.json() as SeriesItem
      setSeriesList(prev => [...prev, result])
      setNewArtwork({ ...newArtwork, series: result.name, seriesEn: result.nameEn })
      setInlineSeries(false)
      toast({ type: 'success', text: `Serie creada: ${result.name}` })
    } catch (err) { toast({ type: 'error', text: err instanceof Error ? err.message : 'Error creando serie' }) }
    finally { setInlineSeriesSubmitting(false) }
  }

  // Series panel CRUD
  const handleSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingSeries(true)
    const isEdit = !!editingSeriesId
    try {
      const url = isEdit ? `/api/series/${editingSeriesId}` : '/api/series'
      const body = isEdit ? { name: seriesForm.name, nameEn: seriesForm.nameEn } : seriesForm
      const res = await fetch(url, { method: isEdit ? 'PATCH' : 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; const err = await res.json(); throw new Error(err.error || 'Error') }
      const result = await res.json() as SeriesItem
      if (isEdit) { setSeriesList(prev => prev.map(s => s.id === editingSeriesId ? result : s)) }
      else { setSeriesList(prev => [...prev, result]) }
      toast({ type: 'success', text: `${isEdit ? 'Actualizada' : 'Creada'}: ${seriesForm.name}` })
      cancelSeriesForm()
    } catch (err) { toast({ type: 'error', text: err instanceof Error ? err.message : 'Error' }) }
    finally { setSubmittingSeries(false) }
  }

  const confirmDeleteSeries = async () => {
    if (!pendingDeleteSeries) return
    const s = pendingDeleteSeries
    setPendingDeleteSeries(null)
    try {
      const res = await fetch(`/api/series/${s.id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; const err = await res.json(); throw new Error(err.error || 'Error') }
      setSeriesList(prev => prev.filter(x => x.id !== s.id))
      toast({ type: 'success', text: `Eliminada: ${s.name}` })
    } catch (err) { toast({ type: 'error', text: err instanceof Error ? err.message : 'Error eliminando serie' }) }
  }

  const handleSeriesEdit = (s: SeriesItem) => {
    setSeriesForm({ id: s.id, name: s.name, nameEn: s.nameEn })
    setEditingSeriesId(s.id)
    setShowSeriesForm(true)
  }

  const cancelSeriesForm = () => { setShowSeriesForm(false); setEditingSeriesId(null); setSeriesForm(emptySeriesForm) }

  const handleSeriesNameChange = (name: string) => {
    setSeriesForm({ ...seriesForm, name, id: editingSeriesId ? seriesForm.id : generateSlug(name) })
  }

  const availableCount = artworks.filter(a => a.status === 'available').length
  const reservedCount = artworks.filter(a => a.status === 'reserved').length
  const soldCount = artworks.filter(a => a.status === 'sold').length

  const isEs = formLang === 'es'

  return (
    <>
      {pendingDelete && (
        <ConfirmModal
          title="Eliminar obra"
          body={<>Vas a eliminar <span className="text-[hsl(var(--foreground))]">&ldquo;{pendingDelete.title}&rdquo;</span>. Esta acción no se puede deshacer.</>}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {pendingDeleteSeries && (
        artworkCounts[pendingDeleteSeries.id] > 0
          ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setPendingDeleteSeries(null)}>
              <div className="absolute inset-0 bg-[hsl(var(--background-dark))] opacity-80" />
              <div className="relative w-full max-w-sm border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-4 mb-6">
                  <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-8 h-8 border border-[hsl(var(--ultra))] text-[hsl(var(--ultra))]">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-display text-base text-[hsl(var(--foreground))]">Serie en uso</h3>
                    <p className="font-body text-sm text-[hsl(var(--foreground-muted))] mt-1">
                      <span className="text-[hsl(var(--accent))]">{artworkCounts[pendingDeleteSeries.id]} obra(s)</span> usan la serie &ldquo;{pendingDeleteSeries.name}&rdquo;. Reasigna las obras antes de eliminarla.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setPendingDeleteSeries(null)} className="py-2 px-4 font-body text-sm text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]" style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )
          : (
            <ConfirmModal
              title="Eliminar serie"
              body={<>Vas a eliminar <span className="text-[hsl(var(--foreground))]">&ldquo;{pendingDeleteSeries.name}&rdquo;</span>. Esta acción no se puede deshacer.</>}
              onConfirm={confirmDeleteSeries}
              onCancel={() => setPendingDeleteSeries(null)}
            />
          )
      )}

      {/* Stats + add button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 font-body text-xs text-[hsl(var(--foreground-muted))] flex-wrap">
          <span>{artworks.length} obras</span>
          <span className="text-[hsl(var(--accent))]">{availableCount} disponibles</span>
          {reservedCount > 0 && <span className="text-[hsl(var(--ultra))]">{reservedCount} reservadas</span>}
          <span className="text-[hsl(var(--foreground-subtle))]">{soldCount} vendidas</span>
        </div>
        <button
          onClick={() => showAddForm ? cancelForm() : setShowAddForm(true)}
          className="py-2 px-4 font-body text-sm bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] shrink-0"
          style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}
        >
          {showAddForm ? 'Cancelar' : '+ Nueva obra'}
        </button>
      </div>

      {/* Add/edit form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-10 border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <h2 className="font-display text-lg text-[hsl(var(--foreground))]">
              {editingId ? `Editar: ${newArtwork.title}` : 'Nueva obra'}
            </h2>
            <LangToggle lang={formLang} onChange={setFormLang} />
          </div>
          <div className="p-5 sm:p-6 space-y-8">
            {/* Identification */}
            <div>
              <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">Identificación</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label">{isEs ? 'Título' : 'Title'}<Req /></label>
                  {isEs ? (
                    <input type="text" required value={newArtwork.title} onChange={e => handleTitleChange(e.target.value)} className="input-field" placeholder="Fragmentos del Tiempo" />
                  ) : (
                    <input type="text" required value={newArtwork.titleEn} onChange={e => setNewArtwork({ ...newArtwork, titleEn: e.target.value })} className="input-field" placeholder="Fragments of Time" />
                  )}
                </div>
                <div>
                  <label className="input-label">Año<Req /></label>
                  <input type="number" required value={newArtwork.year} onChange={e => setNewArtwork({ ...newArtwork, year: e.target.value })} className="input-field" placeholder="2024" />
                </div>
              </div>
              {isEs && newArtwork.id && (
                <p className="font-body text-xs text-[hsl(var(--foreground-subtle))] mt-2">/obra/{newArtwork.id}</p>
              )}
            </div>

            {/* Technical */}
            <div>
              <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">Datos técnicos</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">{isEs ? 'Técnica' : 'Technique'}<Req /></label>
                  {isEs ? (
                    <input type="text" required value={newArtwork.technique} onChange={e => setNewArtwork({ ...newArtwork, technique: e.target.value })} className="input-field" placeholder="Óleo sobre lienzo" />
                  ) : (
                    <input type="text" required value={newArtwork.techniqueEn} onChange={e => setNewArtwork({ ...newArtwork, techniqueEn: e.target.value })} className="input-field" placeholder="Oil on canvas" />
                  )}
                </div>
                <div>
                  <label className="input-label">Dimensiones<Req /></label>
                  <input type="text" required value={newArtwork.dimensions} onChange={e => setNewArtwork({ ...newArtwork, dimensions: e.target.value })} className="input-field" placeholder="150 x 120 cm" />
                </div>
                <div>
                  <label className="input-label">Estado<Req /></label>
                  <select value={newArtwork.status} onChange={e => setNewArtwork({ ...newArtwork, status: e.target.value as 'available' | 'sold' | 'reserved' })} className="input-field" style={{ cursor: 'pointer' }}>
                    <option value="available">Disponible</option>
                    <option value="reserved">Reservada</option>
                    <option value="sold">Vendida</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="input-label">{isEs ? 'Serie' : 'Series'}</label>
                {inlineSeries ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={inlineSeriesName} onChange={e => setInlineSeriesName(e.target.value)} className="input-field" placeholder="Nombre de la serie" autoFocus />
                      <input type="text" value={inlineSeriesNameEn} onChange={e => setInlineSeriesNameEn(e.target.value)} className="input-field" placeholder="Series name (EN)" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleInlineSeriesCreate}
                        disabled={inlineSeriesSubmitting || !inlineSeriesName.trim() || !inlineSeriesNameEn.trim()}
                        className="py-1.5 px-4 font-body text-xs bg-[hsl(var(--accent))] text-[hsl(var(--background))] hover:bg-[hsl(var(--foreground))] disabled:opacity-50 flex items-center gap-1.5"
                        style={{ transition: 'background-color var(--motion-fast) var(--ease-out)' }}
                      >
                        {inlineSeriesSubmitting && <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
                        Crear serie
                      </button>
                      <button type="button" onClick={() => setInlineSeries(false)} className="py-1.5 px-4 font-body text-xs text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]" style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={newArtwork.series}
                    onChange={e => handleSeriesSelect(e.target.value)}
                    className="input-field"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">{isEs ? 'Sin serie' : 'No series'}</option>
                    {seriesOptions.map(s => (
                      <option key={s.id} value={s.name}>{isEs ? s.name : s.nameEn}</option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="__new__">{isEs ? '+ Nueva serie' : '+ New series'}</option>
                  </select>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">Contenido</p>
              <div className="space-y-4">
                <ImageUrlField value={newArtwork.imageUrl} onChange={v => setNewArtwork({ ...newArtwork, imageUrl: v })} required />
                <div>
                  <label className="input-label">{isEs ? 'Descripción' : 'Description'}<Req /></label>
                  {isEs ? (
                    <textarea required rows={3} value={newArtwork.description} onChange={e => setNewArtwork({ ...newArtwork, description: e.target.value })} className="input-field resize-none" />
                  ) : (
                    <textarea required rows={3} value={newArtwork.descriptionEn} onChange={e => setNewArtwork({ ...newArtwork, descriptionEn: e.target.value })} className="input-field resize-none" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 border-t border-[hsl(var(--border))] flex items-center justify-between">
            <RequiredLegend />
            <div className="flex gap-3">
              <button type="button" onClick={cancelForm} className="py-2.5 px-6 font-body text-sm text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]" style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}>Cancelar</button>
              <SubmitButton submitting={submitting} label={editingId ? 'Guardar cambios' : 'Crear obra'} />
            </div>
          </div>
        </form>
      )}

      {/* Empty / loading states */}
      {!loaded && artworks.length === 0 && (
        <p className="font-body text-sm text-[hsl(var(--foreground-muted))] py-12 text-center">Cargando...</p>
      )}
      {loaded && artworks.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">No hay obras todavía</p>
          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="mt-4 py-2 px-4 font-body text-sm text-[hsl(var(--accent))] border border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--background))]" style={{ transition: 'all var(--motion-normal) var(--ease-out)' }}>
              + Nueva obra
            </button>
          )}
        </div>
      )}

      {artworks.length > 0 && (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {artworks.map(artwork => (
              <div key={artwork.id} className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                <div className="flex gap-3">
                  <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-[hsl(var(--muted))]">
                    <Image src={artwork.imageUrl || '/placeholder.svg'} alt="" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-[hsl(var(--foreground))] truncate">{artwork.title}</p>
                    <p className="font-body text-xs text-[hsl(var(--foreground-subtle))] mt-0.5">{artwork.series ? `${artwork.series} · ` : ''}{artwork.year}</p>
                    <p className="font-body text-xs text-[hsl(var(--foreground-subtle))]">{artwork.dimensions}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--border))]">
                  <StatusBadge status={artwork.status} onClick={() => toggleStatus(artwork)} updating={updatingId === artwork.id} />
                  <div className="flex gap-1">
                    <button onClick={() => handleDuplicate(artwork)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--ultra))] py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Duplicar</button>
                    <button onClick={() => handleEdit(artwork)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--accent))] py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Editar</button>
                    <button onClick={() => setPendingDelete(artwork)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-red-500 py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[hsl(var(--foreground))]">
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 w-12">&nbsp;</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Obra</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Serie</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 hidden md:table-cell">Año</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 hidden lg:table-cell">Dimensiones</th>
                  <th className="text-center font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Estado</th>
                  <th className="text-right font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map(artwork => (
                  <tr key={artwork.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]" style={{ transition: 'background-color var(--motion-fast) var(--ease-out)' }}>
                    <td className="py-3 pr-4">
                      <div className="relative w-10 h-10 overflow-hidden bg-[hsl(var(--muted))]">
                        <Image src={artwork.imageUrl || '/placeholder.svg'} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-display text-sm text-[hsl(var(--foreground))]">{artwork.title}</span>
                      <span className="block font-body text-xs text-[hsl(var(--foreground-subtle))] mt-0.5">{artwork.titleEn}</span>
                    </td>
                    <td className="py-3 pr-4"><span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{artwork.series}</span></td>
                    <td className="py-3 pr-4 hidden md:table-cell"><span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{artwork.year}</span></td>
                    <td className="py-3 pr-4 hidden lg:table-cell"><span className="font-body text-xs text-[hsl(var(--foreground-subtle))]">{artwork.dimensions}</span></td>
                    <td className="py-3 pr-4 text-center">
                      <StatusBadge status={artwork.status} onClick={() => toggleStatus(artwork)} updating={updatingId === artwork.id} />
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button onClick={() => handleDuplicate(artwork)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--ultra))] py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Duplicar</button>
                      <button onClick={() => handleEdit(artwork)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--accent))] py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Editar</button>
                      <button onClick={() => setPendingDelete(artwork)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-red-500 py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── Series management panel ─── */}
      <div className="mt-12 border-t border-[hsl(var(--border))] pt-1">
        <button
          onClick={() => setShowSeriesPanel(!showSeriesPanel)}
          className="w-full flex items-center justify-between py-3 group"
        >
          <span className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] group-hover:text-[hsl(var(--foreground))]" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>
            Series · {seriesOptions.length}
          </span>
          <svg
            viewBox="0 0 24 24" className="w-4 h-4 text-[hsl(var(--foreground-subtle))]" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ transform: showSeriesPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--motion-fast) var(--ease-out)' }}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSeriesPanel && (
          <div className="pb-4">
            {/* Series form */}
            {showSeriesForm ? (
              <form onSubmit={handleSeriesSubmit} className="mb-6 border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display text-sm text-[hsl(var(--foreground))]">{editingSeriesId ? 'Editar serie' : 'Nueva serie'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Nombre (ES)</label>
                    <input type="text" required value={seriesForm.name} onChange={e => handleSeriesNameChange(e.target.value)} className="input-field" placeholder="Deconstrucciones" />
                  </div>
                  <div>
                    <label className="input-label">Name (EN)</label>
                    <input type="text" required value={seriesForm.nameEn} onChange={e => setSeriesForm({ ...seriesForm, nameEn: e.target.value })} className="input-field" placeholder="Deconstructions" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={cancelSeriesForm} className="py-1.5 px-4 font-body text-xs text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]" style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}>Cancelar</button>
                  <button type="submit" disabled={submittingSeries} className="py-1.5 px-4 font-body text-xs bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] disabled:opacity-60 flex items-center gap-1.5" style={{ transition: 'background-color var(--motion-fast) var(--ease-out)' }}>
                    {submittingSeries && <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
                    {editingSeriesId ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-4">
                <button onClick={() => setShowSeriesForm(true)} className="font-body text-xs text-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>
                  + Nueva serie
                </button>
              </div>
            )}

            {/* Series table */}
            {seriesOptions.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] py-2 pr-4">ES</th>
                    <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] py-2 pr-4 hidden sm:table-cell">EN</th>
                    <th className="text-center font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] py-2 pr-4">Obras</th>
                    <th className="text-right font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-subtle))] py-2">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {seriesOptions.map(s => (
                    <tr key={s.id} className="border-b border-[hsl(var(--border))]">
                      <td className="py-2 pr-4">
                        <span className="font-body text-sm text-[hsl(var(--foreground))]">{s.name}</span>
                        <span className="block sm:hidden font-body text-xs text-[hsl(var(--foreground-muted))] mt-0.5">{s.nameEn}</span>
                      </td>
                      <td className="py-2 pr-4 hidden sm:table-cell"><span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{s.nameEn}</span></td>
                      <td className="py-2 pr-4 text-center"><span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{artworkCounts[s.id] || 0}</span></td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <button onClick={() => handleSeriesEdit(s)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--accent))] py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Editar</button>
                        <button onClick={() => setPendingDeleteSeries(s)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-red-500 py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Tab: Exposiciones ─── */

function ExposicionesTab({ authHeaders, toast, onExpire }: {
  authHeaders: () => Record<string, string>
  toast: (msg: { type: 'success' | 'error'; text: string }) => void
  onExpire: () => void
}) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ExhibitionForm>(emptyExhibitionForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Exhibition | null>(null)
  const [formLang, setFormLang] = useState<FormLang>('es')
  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/exhibitions').then(r => r.json()).then(setExhibitions).catch(() => {}).finally(() => setLoaded(true))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const isEdit = !!editingId
    try {
      const url = isEdit ? `/api/exhibitions/${editingId}` : '/api/exhibitions'
      const body = isEdit ? { title: form.title, titleEn: form.titleEn, venue: form.venue, location: form.location, locationEn: form.locationEn, startDate: form.startDate, endDate: form.endDate, description: form.description, descriptionEn: form.descriptionEn, imageUrl: form.imageUrl } : form
      const res = await fetch(url, { method: isEdit ? 'PATCH' : 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; const err = await res.json(); throw new Error(err.error || 'Error') }
      const result = await res.json() as Exhibition
      if (isEdit) { setExhibitions(prev => prev.map(e => e.id === editingId ? result : e)) }
      else { setExhibitions(prev => [...prev, result]) }
      toast({ type: 'success', text: `${isEdit ? 'Actualizada' : 'Creada'}: ${form.title}` })
      cancelForm()
    } catch (err) { toast({ type: 'error', text: err instanceof Error ? err.message : 'Error' }) }
    finally { setSubmitting(false) }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const ex = pendingDelete
    setPendingDelete(null)
    try {
      const res = await fetch(`/api/exhibitions/${ex.id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; throw new Error() }
      setExhibitions(prev => prev.filter(e => e.id !== ex.id))
      toast({ type: 'success', text: `Eliminada: ${ex.title}` })
    } catch { toast({ type: 'error', text: 'Error eliminando exposición' }) }
  }

  const handleEdit = (ex: Exhibition) => {
    setForm({ id: ex.id, title: ex.title, titleEn: ex.titleEn, venue: ex.venue, location: ex.location, locationEn: ex.locationEn, startDate: ex.startDate, endDate: ex.endDate, description: ex.description, descriptionEn: ex.descriptionEn, imageUrl: ex.imageUrl })
    setEditingId(ex.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyExhibitionForm); setFormLang('es') }

  const handleTitleChange = (title: string) => {
    setForm({ ...form, title, id: editingId ? form.id : generateSlug(title) })
  }

  const isEs = formLang === 'es'

  return (
    <>
      {pendingDelete && (
        <ConfirmModal
          title="Eliminar exposición"
          body={<>Vas a eliminar <span className="text-[hsl(var(--foreground))]">&ldquo;{pendingDelete.title}&rdquo;</span>. Esta acción no se puede deshacer.</>}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{exhibitions.length} exposiciones</span>
        <button onClick={() => showForm ? cancelForm() : setShowForm(true)} className="py-2 px-4 font-body text-sm bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--accent))]" style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}>
          {showForm ? 'Cancelar' : '+ Nueva exposición'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <h2 className="font-display text-lg text-[hsl(var(--foreground))]">{editingId ? `Editar: ${form.title}` : 'Nueva exposición'}</h2>
            <LangToggle lang={formLang} onChange={setFormLang} />
          </div>
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <label className="input-label">{isEs ? 'Título' : 'Title'}<Req /></label>
              {isEs ? (
                <input type="text" required value={form.title} onChange={e => handleTitleChange(e.target.value)} className="input-field" />
              ) : (
                <input type="text" required value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} className="input-field" />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Venue<Req /></label>
                <input type="text" required value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="input-field" placeholder="Galería Marlborough" />
              </div>
              <div>
                <label className="input-label">{isEs ? 'Ubicación' : 'Location'}<Req /></label>
                {isEs ? (
                  <input type="text" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="Madrid, España" />
                ) : (
                  <input type="text" required value={form.locationEn} onChange={e => setForm({ ...form, locationEn: e.target.value })} className="input-field" placeholder="Madrid, Spain" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Fecha inicio<Req /></label>
                <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Fecha fin<Req /></label>
                <input type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field" />
              </div>
            </div>
            <ImageUrlField value={form.imageUrl} onChange={v => setForm({ ...form, imageUrl: v })} required />
            <div>
              <label className="input-label">{isEs ? 'Descripción' : 'Description'}<Req /></label>
              {isEs ? (
                <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
              ) : (
                <textarea required rows={3} value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} className="input-field resize-none" />
              )}
            </div>
          </div>
          <div className="p-5 border-t border-[hsl(var(--border))] flex items-center justify-between">
            <RequiredLegend />
            <div className="flex gap-3">
              <button type="button" onClick={cancelForm} className="py-2.5 px-6 font-body text-sm text-[hsl(var(--foreground-muted))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]" style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}>Cancelar</button>
              <SubmitButton submitting={submitting} label={editingId ? 'Guardar cambios' : 'Crear exposición'} />
            </div>
          </div>
        </form>
      )}

      {/* Empty / loading states */}
      {!loaded && exhibitions.length === 0 && (
        <p className="font-body text-sm text-[hsl(var(--foreground-muted))] py-12 text-center">Cargando...</p>
      )}
      {loaded && exhibitions.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">No hay exposiciones todavía</p>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="mt-4 py-2 px-4 font-body text-sm text-[hsl(var(--accent))] border border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--background))]" style={{ transition: 'all var(--motion-normal) var(--ease-out)' }}>
              + Nueva exposición
            </button>
          )}
        </div>
      )}

      {exhibitions.length > 0 && (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {exhibitions.map(ex => {
              const isCurrent = isCurrentExhibition(ex)
              return (
                <div key={ex.id} className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <div className="flex gap-3">
                    <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-[hsl(var(--muted))]">
                      <Image src={ex.imageUrl || '/placeholder.svg'} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-[hsl(var(--foreground))] truncate">{ex.title}</p>
                      <p className="font-body text-xs text-[hsl(var(--foreground-subtle))] mt-0.5">{ex.venue}</p>
                      <p className="font-body text-xs text-[hsl(var(--foreground-subtle))]">{ex.startDate} — {ex.endDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--border))]">
                    <span className={`font-annotation text-xs py-1 px-3 border ${isCurrent ? 'text-[hsl(var(--accent))] border-[hsl(var(--accent))]' : 'text-[hsl(var(--foreground-subtle))] border-[hsl(var(--border))]'}`}>
                      {isCurrent ? 'Actual' : 'Pasada'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(ex)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--accent))] py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Editar</button>
                      <button onClick={() => setPendingDelete(ex)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-red-500 py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Eliminar</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[hsl(var(--foreground))]">
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 w-12">&nbsp;</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Exposición</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Venue</th>
                  <th className="text-left font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4 hidden md:table-cell">Fechas</th>
                  <th className="text-center font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3 pr-4">Estado</th>
                  <th className="text-right font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-muted))] py-3">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {exhibitions.map(ex => {
                  const isCurrent = isCurrentExhibition(ex)
                  return (
                    <tr key={ex.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]" style={{ transition: 'background-color var(--motion-fast) var(--ease-out)' }}>
                      <td className="py-3 pr-4">
                        <div className="relative w-10 h-10 overflow-hidden bg-[hsl(var(--muted))]">
                          <Image src={ex.imageUrl || '/placeholder.svg'} alt="" fill className="object-cover" sizes="40px" />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-display text-sm text-[hsl(var(--foreground))]">{ex.title}</span>
                        <span className="block font-body text-xs text-[hsl(var(--foreground-subtle))] mt-0.5">{ex.titleEn}</span>
                      </td>
                      <td className="py-3 pr-4"><span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{ex.venue}</span></td>
                      <td className="py-3 pr-4 hidden md:table-cell"><span className="font-body text-xs text-[hsl(var(--foreground-muted))]">{ex.startDate} — {ex.endDate}</span></td>
                      <td className="py-3 pr-4 text-center">
                        <span className={`font-annotation text-xs py-1 px-3 border ${isCurrent ? 'text-[hsl(var(--accent))] border-[hsl(var(--accent))]' : 'text-[hsl(var(--foreground-subtle))] border-[hsl(var(--border))]'}`}>
                          {isCurrent ? 'Actual' : 'Pasada'}
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(ex)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--accent))] py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Editar</button>
                        <button onClick={() => setPendingDelete(ex)} className="font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-red-500 py-1 px-2" style={{ transition: 'color var(--motion-fast) var(--ease-out)' }}>Eliminar</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

/* ─── Tab: Contacto ─── */

function ContactoTab({ authHeaders, toast, onExpire }: {
  authHeaders: () => Record<string, string>
  toast: (msg: { type: 'success' | 'error'; text: string }) => void
  onExpire: () => void
}) {
  const [data, setData] = useState<ContactData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/contact').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  if (!data) return <p className="font-body text-sm text-[hsl(var(--foreground-muted))] py-8">Cargando...</p>

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/contact', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) })
      if (!res.ok) { if (res.status === 401) { onExpire(); return }; const err = await res.json(); throw new Error(err.error || 'Error') }
      const updated = await res.json() as ContactData
      setData(updated)
      toast({ type: 'success', text: 'Contacto actualizado' })
    } catch (err) { toast({ type: 'error', text: err instanceof Error ? err.message : 'Error' }) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--ultra))] mb-4">Información de contacto</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Email</label>
            <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="input-label">Instagram handle</label>
            <input type="text" value={data.instagram.handle} onChange={e => setData({ ...data, instagram: { ...data.instagram, handle: e.target.value } })} className="input-field" placeholder="@cubistajalon_" />
          </div>
          <div>
            <label className="input-label">Instagram URL</label>
            <input type="url" value={data.instagram.url} onChange={e => setData({ ...data, instagram: { ...data.instagram, url: e.target.value } })} className="input-field" placeholder="https://instagram.com/cubistajalon_" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
        <button onClick={handleSave} disabled={saving} className="py-2.5 px-6 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent))] disabled:opacity-50" style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

/* ─── Main Admin ─── */

const tabs: { id: Tab; label: string }[] = [
  { id: 'obras', label: 'Obras' },
  { id: 'exposiciones', label: 'Exposiciones' },
  { id: 'contacto', label: 'Contacto' },
]

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('obras')

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token])

  const toast = useCallback((msg: { type: 'success' | 'error'; text: string }) => {
    setMessage(msg)
  }, [])

  const onExpire = useCallback(() => {
    setMessage({ type: 'error', text: 'Sesión expirada' })
    setIsAuthenticated(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(false)
    try {
      const listRes = await fetch('/api/artworks')
      if (!listRes.ok) throw new Error('API down')
      const allArtworks = await listRes.json() as Artwork[]
      if (allArtworks.length > 0) {
        const testArtwork = allArtworks[0]
        const testRes = await fetch(`/api/artworks/${testArtwork.id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ featured: testArtwork.featured }),
        })
        if (testRes.status === 401) { setLoginError(true); return }
      }
      setIsAuthenticated(true)
    } catch {
      setMessage({ type: 'error', text: 'Error conectando con el API' })
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background-dark))] flex items-center justify-center p-4">
        {message && <Toast message={message} onDismiss={() => setMessage(null)} />}
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-8">
          <div>
            <p className="font-display text-2xl text-[hsl(var(--foreground-light))]">Cubista Jalón</p>
            <p className="font-body text-xs text-[hsl(var(--foreground-light-muted))] mt-1 tracking-[0.08em] uppercase">Administración</p>
          </div>
          <div>
            <label className="block font-body text-xs tracking-[0.08em] uppercase text-[hsl(var(--foreground-light-muted))] mb-2">Token de acceso</label>
            <input
              type="password" value={token}
              onChange={e => { setToken(e.target.value); setLoginError(false) }}
              required
              className="w-full py-3 px-0 bg-transparent border-b text-[hsl(var(--foreground-light))] font-body text-sm focus:outline-none"
              style={{ borderBottomColor: loginError ? 'hsl(0, 72%, 51%)' : 'hsl(var(--foreground-light-muted) / 0.3)', transition: 'border-color var(--motion-normal) var(--ease-out)' }}
              onFocus={e => { if (!loginError) e.target.style.borderBottomColor = 'hsl(var(--accent))' }}
              onBlur={e => { if (!loginError) e.target.style.borderBottomColor = 'hsl(var(--foreground-light-muted) / 0.3)' }}
              autoFocus
            />
            {loginError && <p className="font-body text-xs text-red-400 mt-2">Token incorrecto</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-[hsl(var(--accent))] text-[hsl(var(--background))] font-body text-sm hover:bg-[hsl(var(--accent-light))]" style={{ transition: 'background-color var(--motion-normal) var(--ease-out)' }}>Acceder</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {message && <Toast message={message} onDismiss={() => setMessage(null)} />}

      {/* Header bar */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="py-4 flex items-center justify-between">
            <p className="font-display text-lg text-[hsl(var(--foreground))]">Admin</p>
            <div className="flex items-center gap-3">
              <p className="hidden sm:block font-body text-xs text-[hsl(var(--foreground-subtle))]">
                Token: ****{token.slice(-4)}
              </p>
              <button
                onClick={() => { setIsAuthenticated(false); setToken('') }}
                className="py-2 px-3 font-body text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
                style={{ transition: 'all var(--motion-fast) var(--ease-out)' }}
              >
                Salir
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-px overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="py-3 px-4 font-body text-sm whitespace-nowrap"
                style={{
                  color: activeTab === tab.id ? 'hsl(var(--foreground))' : 'hsl(var(--foreground-muted))',
                  borderBottom: activeTab === tab.id ? '2px solid hsl(var(--accent))' : '2px solid transparent',
                  transition: 'color var(--motion-fast) var(--ease-out), border-color var(--motion-fast) var(--ease-out)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        {activeTab === 'obras' && <ObrasTab authHeaders={authHeaders} toast={toast} onExpire={onExpire} />}
        {activeTab === 'exposiciones' && <ExposicionesTab authHeaders={authHeaders} toast={toast} onExpire={onExpire} />}
        {activeTab === 'contacto' && <ContactoTab authHeaders={authHeaders} toast={toast} onExpire={onExpire} />}
      </div>
    </div>
  )
}
