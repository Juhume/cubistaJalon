import { MetadataRoute } from 'next'
import { artworks } from '@/lib/artworks'

const BASE_URL = 'https://cubistajalon.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/obra`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/artista`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE_URL}/exposiciones`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/adquirir`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  const artworkPages: MetadataRoute.Sitemap = artworks.map((artwork) => ({
    url: `${BASE_URL}/obra/${artwork.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...artworkPages]
}
