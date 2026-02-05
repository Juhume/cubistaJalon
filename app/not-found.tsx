import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="es">
      <body
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: 'hsl(40 14% 96%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div className="text-center px-6">
          <p
            className="text-[6rem] sm:text-[8rem] leading-none select-none mb-4"
            style={{
              fontFamily: '"Bodoni Moda", Georgia, serif',
              color: 'hsl(220 14% 11%)',
              opacity: 0.08,
            }}
          >
            404
          </p>

          <div
            className="w-8 h-[2px] mx-auto mb-6"
            style={{ backgroundColor: 'hsl(14 68% 40%)' }}
          />

          <p
            className="text-sm mb-1"
            style={{
              fontFamily: 'system-ui, sans-serif',
              color: 'hsl(218 8% 34%)',
            }}
          >
            Esta página no existe
          </p>
          <p
            className="text-xs mb-8"
            style={{
              fontFamily: 'system-ui, sans-serif',
              color: 'hsl(216 6% 42%)',
            }}
          >
            This page does not exist
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2.5 px-5 text-sm"
            style={{
              fontFamily: 'system-ui, sans-serif',
              backgroundColor: 'hsl(220 14% 11%)',
              color: 'hsl(40 14% 96%)',
              textDecoration: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </svg>
            Inicio / Home
          </Link>
        </div>
      </body>
    </html>
  )
}
