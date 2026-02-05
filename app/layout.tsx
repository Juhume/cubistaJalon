import React from "react"
import type { Metadata } from 'next'
import { Bodoni_Moda, DM_Sans } from 'next/font/google'

import './globals.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cubista Jalón — Catálogo',
    template: '%s | Cubista Jalón',
  },
  description: 'Catálogo razonado del artista Cubista Jalón (Alfredo Huerta Esteban, n. 1953). Fragmentación geométrica y múltiples perspectivas.',
  keywords: ['arte contemporáneo', 'cubismo', 'pintura', 'Cubista Jalón', 'Alfredo Huerta Esteban', 'catálogo razonado'],
  authors: [{ name: 'Alfredo Huerta Esteban' }],
  metadataBase: new URL('https://cubistajalon.com'),
  openGraph: {
    title: 'Cubista Jalón — Catálogo',
    description: 'Buscando la belleza a través de la fragmentación geométrica',
    type: 'website',
    siteName: 'Cubista Jalón',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cubista Jalón — Catálogo',
    description: 'Buscando la belleza a través de la fragmentación geométrica',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${bodoni.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
