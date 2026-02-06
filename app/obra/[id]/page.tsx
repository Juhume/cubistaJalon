import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { artworks } from '@/lib/artworks'
import ArtworkDetailContent from './artwork-detail'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const artwork = artworks.find(a => a.id === id)

  if (!artwork) {
    return { title: 'Obra no encontrada' }
  }

  return {
    title: artwork.title,
    description: artwork.description,
    openGraph: {
      title: `${artwork.title} — Cubista Jalón`,
      description: artwork.description,
      images: [{ url: artwork.imageUrl, alt: artwork.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${artwork.title} — Cubista Jalón`,
      description: artwork.description,
      images: [artwork.imageUrl],
    },
  }
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { id } = await params
  const artwork = artworks.find(a => a.id === id)

  if (!artwork) {
    notFound()
  }

  return (
    <MainLayout>
      <ArtworkDetailContent artwork={artwork} />
    </MainLayout>
  )
}
