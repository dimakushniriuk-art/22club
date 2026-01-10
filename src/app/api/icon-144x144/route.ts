import { NextResponse } from 'next/server'

// Fallback temporaneo per evitare 404 finché l'icona reale non è aggiunta.
export async function GET() {
  // Genera un PNG 144x144 trasparente (1x1 scalato) come placeholder
  const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAQAAAB3Wq3lAAAAAElFTkSuQmCC',
    'base64',
  )
  return new NextResponse(transparentPng, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
