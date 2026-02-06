'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { MainLayout, useLocale } from '@/components/layout/main-layout'
import { useArtworks } from '@/lib/use-artworks'
import { useContact } from '@/lib/use-contact'

function AcquisitionContent() {
  const { locale } = useLocale()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    artwork: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const artworks = useArtworks()
  const contact = useContact()
  const availableArtworks = artworks.filter(a => a.status === 'available')

  const content = {
    es: {
      title: 'Adquirir',
      intro: 'Cada pieza de Cubista Jalón es única. Trabajamos directamente con coleccionistas para asegurar que cada adquisición sea una experiencia personal.',
      process: [
        { num: '01', title: 'Consulta', desc: 'Inicia una conversación sobre la obra que te interesa.' },
        { num: '02', title: 'Diálogo', desc: 'Hablamos sobre la pieza y cómo encajaría en tu colección.' },
        { num: '03', title: 'Entrega', desc: 'Coordinamos el envío seguro de tu nueva obra.' },
      ],
      formTitle: 'Formulario de consulta',
      name: 'Nombre',
      email: 'Email',
      phone: 'Teléfono',
      artworkInterest: 'Obra de interés',
      selectArtwork: 'Selecciona una obra',
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntanos más sobre tu interés...',
      submit: 'Enviar consulta',
      success: 'Gracias por tu interés. Te contactaremos pronto.',
      services: [
        'Certificado de autenticidad',
        'Envío asegurado a nivel mundial',
        'Pagos fraccionados disponibles',
        'Asesoramiento en instalación',
      ],
      servicesTitle: 'Incluido',
      contact: 'Contacto directo',
    },
    en: {
      title: 'Acquire',
      intro: 'Each piece by Cubista Jalón is unique. We work directly with collectors to ensure each acquisition is a personal experience.',
      process: [
        { num: '01', title: 'Inquiry', desc: 'Start a conversation about the work that interests you.' },
        { num: '02', title: 'Dialogue', desc: 'We discuss the piece and how it would fit in your collection.' },
        { num: '03', title: 'Delivery', desc: 'We coordinate safe shipping of your new work.' },
      ],
      formTitle: 'Inquiry form',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      artworkInterest: 'Work of interest',
      selectArtwork: 'Select a work',
      message: 'Message',
      messagePlaceholder: 'Tell us more about your interest...',
      submit: 'Send inquiry',
      success: 'Thank you for your interest. We will contact you soon.',
      services: [
        'Certificate of authenticity',
        'Insured worldwide shipping',
        'Installment payments available',
        'Installation advisory',
      ],
      servicesTitle: 'Included',
      contact: 'Direct contact',
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

  return (
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32">
      <div className="container-gallery">
        {/* Header */}
        <div
          className="max-w-3xl mb-10 sm:mb-16 lg:mb-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s var(--ease-out), transform 0.7s var(--ease-out)',
          }}
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-[hsl(var(--foreground))] leading-[1.1] mb-6">
            {t.title}
          </h1>
          <p className="font-body text-sm sm:text-base text-[hsl(var(--foreground-muted))] leading-relaxed max-w-xl">
            {t.intro}
          </p>
        </div>

        {/* Process — staggered cards with siena left border */}
        <section className="mb-10 sm:mb-16 lg:mb-20 max-w-2xl">
          {t.process.map((step, index) => (
            <div
              key={step.num}
              className="flex gap-0 py-3 sm:py-4"
              style={{
                paddingLeft: `${index * 1}rem`,
              }}
            >
              {/* Siena left border */}
              <div className="w-1 bg-[hsl(var(--accent))] shrink-0 mr-5" />
              <div className="flex gap-6 flex-1 pb-4 border-b border-[hsl(var(--border))]">
                <span className="font-display text-lg text-[hsl(var(--accent))] shrink-0 w-8">
                  {step.num}
                </span>
                <div>
                  <p className="font-display text-base text-[hsl(var(--foreground))] mb-1">
                    {step.title}
                  </p>
                  <p className="font-body text-sm text-[hsl(var(--foreground-muted))]">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Form and sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pb-16 sm:pb-24">
          {/* Form */}
          <section>
            <div className="mb-8 pb-3 border-b border-[hsl(var(--accent))]">
              <p className="font-body text-sm tracking-[0.1em] uppercase text-[hsl(var(--foreground))]">
                {t.formTitle}
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-12 text-center border-b border-[hsl(var(--border))]">
                <p className="font-body text-[hsl(var(--foreground))]">{t.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="field-name" className="input-label">{t.name} *</label>
                    <input
                      id="field-name"
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
                    <label htmlFor="field-email" className="input-label">{t.email} *</label>
                    <input
                      id="field-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })) }}
                      className={`input-field ${errors.email ? 'border-[hsl(var(--accent))]' : ''}`}
                    />
                    {errors.email && <p className="font-body text-xs text-[hsl(var(--accent))] mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="field-phone" className="input-label">{t.phone}</label>
                  <input
                    id="field-phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="field-artwork" className="input-label">{t.artworkInterest}</label>
                  <select
                    id="field-artwork"
                    value={formData.artwork}
                    onChange={(e) => setFormData({ ...formData, artwork: e.target.value })}
                    className="input-field"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">{t.selectArtwork}</option>
                    {availableArtworks.map((artwork) => (
                      <option key={artwork.id} value={artwork.id}>
                        {locale === 'es' ? artwork.title : artwork.titleEn} ({artwork.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="field-message" className="input-label">{t.message}</label>
                  <textarea
                    id="field-message"
                    rows={4}
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
          </section>

          {/* Sidebar */}
          <aside className="space-y-10">
            {/* Services */}
            <div>
              <p className="font-annotation text-sm text-[hsl(var(--foreground-muted))] mb-5">
                {t.servicesTitle}
              </p>
              <ul className="space-y-3">
                {t.services.map((service, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[hsl(var(--accent))] shrink-0 mt-1.5" />
                    <span className="font-body text-sm text-[hsl(var(--foreground-muted))]">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="border-t border-[hsl(var(--border))] pt-8">
              <p className="font-annotation text-sm text-[hsl(var(--foreground-muted))] mb-3">
                {t.contact}
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="font-body text-sm text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] link-underline"
                style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
              >
                {contact.email}
              </a>
              <a
                href={contact.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-2 font-body text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent))]"
                style={{ transition: `color var(--motion-fast) var(--ease-out)` }}
                aria-label={locale === 'es' ? 'Seguir en Instagram' : 'Follow on Instagram'}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                {contact.instagram.handle}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function AcquisitionPage() {
  return (
    <MainLayout>
      <AcquisitionContent />
    </MainLayout>
  )
}
