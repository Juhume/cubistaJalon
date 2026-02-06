export interface Artwork {
  id: string
  title: string
  titleEn: string
  year: number
  technique: string
  techniqueEn: string
  dimensions: string
  series: string
  seriesEn: string
  status: 'available' | 'sold' | 'reserved'
  featured: boolean
  description: string
  descriptionEn: string
  imageUrl: string
  gridSpan: {
    cols: number
    rows: number
  }
}

export interface Exhibition {
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

export const artworks: Artwork[] = [
  {
    id: 'fragmentos-del-tiempo',
    title: 'Fragmentos del Tiempo',
    titleEn: 'Fragments of Time',
    year: 2024,
    technique: 'Óleo sobre lienzo',
    techniqueEn: 'Oil on canvas',
    dimensions: '150 x 120 cm',
    series: 'Deconstrucciones',
    seriesEn: 'Deconstructions',
    status: 'available',
    featured: true,
    description: 'Una exploración de la percepción temporal a través de planos geométricos superpuestos que desafían la linealidad del tiempo.',
    descriptionEn: 'An exploration of temporal perception through superimposed geometric planes that challenge the linearity of time.',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    gridSpan: { cols: 6, rows: 2 },
  },
  {
    id: 'naturaleza-fracturada',
    title: 'Naturaleza Fracturada',
    titleEn: 'Fractured Nature',
    year: 2024,
    technique: 'Acrílico y técnica mixta',
    techniqueEn: 'Acrylic and mixed media',
    dimensions: '100 x 80 cm',
    series: 'Paisajes Imposibles',
    seriesEn: 'Impossible Landscapes',
    status: 'available',
    featured: true,
    description: 'La naturaleza vista desde múltiples ángulos simultáneos, revelando la complejidad oculta en lo cotidiano.',
    descriptionEn: 'Nature seen from multiple simultaneous angles, revealing the hidden complexity in the everyday.',
    imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
    gridSpan: { cols: 4, rows: 1 },
  },
  {
    id: 'retrato-multiplicado',
    title: 'Retrato Multiplicado',
    titleEn: 'Multiplied Portrait',
    year: 2023,
    technique: 'Óleo sobre lienzo',
    techniqueEn: 'Oil on canvas',
    dimensions: '120 x 100 cm',
    series: 'Identidades',
    seriesEn: 'Identities',
    status: 'sold',
    featured: true,
    description: 'Una investigación sobre la multiplicidad del ser, donde el rostro se descompone en facetas que revelan las distintas máscaras de la identidad.',
    descriptionEn: 'An investigation into the multiplicity of being, where the face decomposes into facets revealing the different masks of identity.',
    imageUrl: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&q=80',
    gridSpan: { cols: 4, rows: 2 },
  },
  {
    id: 'ciudad-angular',
    title: 'Ciudad Angular',
    titleEn: 'Angular City',
    year: 2023,
    technique: 'Acrílico sobre madera',
    techniqueEn: 'Acrylic on wood',
    dimensions: '180 x 140 cm',
    series: 'Urbanismos',
    seriesEn: 'Urbanisms',
    status: 'available',
    featured: true,
    description: 'La urbe contemporánea fragmentada en planos geométricos que capturan la energía caótica de la vida urbana.',
    descriptionEn: 'The contemporary city fragmented into geometric planes capturing the chaotic energy of urban life.',
    imageUrl: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80',
    gridSpan: { cols: 8, rows: 2 },
  },
  {
    id: 'melodia-visual',
    title: 'Melodía Visual',
    titleEn: 'Visual Melody',
    year: 2023,
    technique: 'Óleo y collage',
    techniqueEn: 'Oil and collage',
    dimensions: '90 x 70 cm',
    series: 'Sinestesias',
    seriesEn: 'Synesthesias',
    status: 'available',
    featured: false,
    description: 'La música traducida en formas geométricas y color, una sinfonía visual que invita a escuchar con los ojos.',
    descriptionEn: 'Music translated into geometric forms and color, a visual symphony that invites you to listen with your eyes.',
    imageUrl: 'https://images.unsplash.com/photo-1573096108468-702f6014ef28?w=800&q=80',
    gridSpan: { cols: 4, rows: 1 },
  },
  {
    id: 'equilibrio-inestable',
    title: 'Equilibrio Inestable',
    titleEn: 'Unstable Equilibrium',
    year: 2022,
    technique: 'Técnica mixta sobre lienzo',
    techniqueEn: 'Mixed media on canvas',
    dimensions: '160 x 130 cm',
    series: 'Tensiones',
    seriesEn: 'Tensions',
    status: 'sold',
    featured: false,
    description: 'Formas que desafían la gravedad y la lógica, suspendidas en un momento de tensión perpetua.',
    descriptionEn: 'Forms that defy gravity and logic, suspended in a moment of perpetual tension.',
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
    gridSpan: { cols: 6, rows: 2 },
  },
  {
    id: 'memoria-geometrica',
    title: 'Memoria Geométrica',
    titleEn: 'Geometric Memory',
    year: 2022,
    technique: 'Óleo sobre lienzo',
    techniqueEn: 'Oil on canvas',
    dimensions: '100 x 100 cm',
    series: 'Deconstrucciones',
    seriesEn: 'Deconstructions',
    status: 'available',
    featured: false,
    description: 'Los recuerdos como fragmentos de un espejo roto, cada pieza reflejando una versión diferente del pasado.',
    descriptionEn: 'Memories as fragments of a broken mirror, each piece reflecting a different version of the past.',
    imageUrl: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&q=80',
    gridSpan: { cols: 4, rows: 1 },
  },
  {
    id: 'danza-de-planos',
    title: 'Danza de Planos',
    titleEn: 'Dance of Planes',
    year: 2024,
    technique: 'Acrílico sobre lienzo',
    techniqueEn: 'Acrylic on canvas',
    dimensions: '140 x 110 cm',
    series: 'Movimiento',
    seriesEn: 'Movement',
    status: 'available',
    featured: true,
    description: 'El movimiento capturado en múltiples instantes simultáneos, una coreografía de formas y colores.',
    descriptionEn: 'Movement captured in multiple simultaneous instants, a choreography of forms and colors.',
    imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80',
    gridSpan: { cols: 5, rows: 2 },
  },
]

export const exhibitions: Exhibition[] = [
  {
    id: 'fragmentos-contemporaneos',
    title: 'Fragmentos Contemporáneos',
    titleEn: 'Contemporary Fragments',
    venue: 'Galería Marlborough',
    location: 'Madrid, España',
    locationEn: 'Madrid, Spain',
    startDate: '2026-03-15',
    endDate: '2026-05-30',
    description: 'Una retrospectiva de las obras más recientes que exploran la fragmentación de la realidad contemporánea.',
    descriptionEn: 'A retrospective of the most recent works exploring the fragmentation of contemporary reality.',
    imageUrl: 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=800&q=80',
  },
  {
    id: 'perspectivas-multiples',
    title: 'Perspectivas Múltiples',
    titleEn: 'Multiple Perspectives',
    venue: 'MACBA',
    location: 'Barcelona, España',
    locationEn: 'Barcelona, Spain',
    startDate: '2025-09-01',
    endDate: '2025-12-15',
    description: 'Diálogo entre el cubismo histórico y la visión contemporánea del artista.',
    descriptionEn: 'Dialogue between historical cubism and the contemporary vision of the artist.',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
  },
  {
    id: 'geometrias-del-alma',
    title: 'Geometrías del Alma',
    titleEn: 'Geometries of the Soul',
    venue: 'White Cube',
    location: 'Londres, Reino Unido',
    locationEn: 'London, United Kingdom',
    startDate: '2025-04-10',
    endDate: '2025-07-20',
    description: 'Primera exposición internacional del artista en una de las galerías más prestigiosas del mundo.',
    descriptionEn: 'First international exhibition of the artist at one of the most prestigious galleries in the world.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
  },
]

export const series = [
  { id: 'all', name: 'Todas', nameEn: 'All' },
  { id: 'deconstrucciones', name: 'Deconstrucciones', nameEn: 'Deconstructions' },
  { id: 'paisajes-imposibles', name: 'Paisajes Imposibles', nameEn: 'Impossible Landscapes' },
  { id: 'identidades', name: 'Identidades', nameEn: 'Identities' },
  { id: 'urbanismos', name: 'Urbanismos', nameEn: 'Urbanisms' },
  { id: 'sinestesias', name: 'Sinestesias', nameEn: 'Synesthesias' },
  { id: 'tensiones', name: 'Tensiones', nameEn: 'Tensions' },
  { id: 'movimiento', name: 'Movimiento', nameEn: 'Movement' },
]

export const statuses = [
  { id: 'all', name: 'Todas', nameEn: 'All' },
  { id: 'available', name: 'Disponible', nameEn: 'Available' },
  { id: 'reserved', name: 'Reservada', nameEn: 'Reserved' },
  { id: 'sold', name: 'Col. privada', nameEn: 'Private col.' },
]

export const artistBio = {
  name: 'Alfredo Huerta Esteban',
  artistName: 'Cubista Jalón',
  birthYear: 1953,
  birthMonth: 'Febrero',
  birthPlace: 'Madrid, España',
  birthPlaceEn: 'Madrid, Spain',
  statement: {
    es: 'Mi trabajo es un diálogo constante entre la tradición cubista y la fragmentación de la experiencia contemporánea. Desde mi estudio en el Círculo de Bellas Artes de Madrid, cada lienzo es un intento de capturar la multiplicidad de perspectivas que definen nuestra percepción del mundo.',
    en: 'My work is a constant dialogue between the cubist tradition and the fragmentation of contemporary experience. From my studio at the Círculo de Bellas Artes in Madrid, each canvas is an attempt to capture the multiplicity of perspectives that define our perception of the world.',
  },
  quote: {
    es: '"El arte no reproduce lo visible, sino que hace visible lo que no siempre lo es."',
    en: '"Art does not reproduce the visible, but makes visible what is not always so."',
  },
  timeline: [
    { year: 1953, event: { es: 'Nace en Madrid', en: 'Born in Madrid' } },
    { year: 1978, event: { es: 'Primera exposición individual en la Galería Juana Mordó', en: 'First solo exhibition at Galería Juana Mordó' } },
    { year: 1985, event: { es: 'Residencia artística en París', en: 'Artist residency in Paris' } },
    { year: 2005, event: { es: 'Retrospectiva en el Museo Reina Sofía', en: 'Retrospective at Museo Reina Sofía' } },
    { year: 2025, event: { es: 'Exposición en White Cube, Londres', en: 'Exhibition at White Cube, London' } },
  ],
}

export function getStatusLabel(
  status: string,
  locale: 'es' | 'en',
  variant: 'short' | 'long' = 'short'
): string {
  const labels: Record<string, Record<'es' | 'en', { short: string; long: string }>> = {
    available: { es: { short: 'Disponible', long: 'Disponible' }, en: { short: 'Available', long: 'Available' } },
    reserved: { es: { short: 'Reservada', long: 'Reservada' }, en: { short: 'Reserved', long: 'Reserved' } },
    sold: { es: { short: 'Col. privada', long: 'Colección privada' }, en: { short: 'Private col.', long: 'Private collection' } },
  }
  return labels[status]?.[locale]?.[variant] ?? status
}

export function isCurrentExhibition(e: Exhibition): boolean {
  return new Date(e.endDate) >= new Date()
}
