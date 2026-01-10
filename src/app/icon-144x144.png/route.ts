import { NextResponse } from 'next/server'

// Serve un PNG 144x144 trasparente come placeholder per l'icona
export async function GET() {
  // PNG 1x1 trasparente (base64) — i browser lo scaleranno a 144x144
  const transparent1x1Png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/akqk3kAAAAASUVORK5CYII=',
    'base64',
  )

  return new NextResponse(transparent1x1Png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
