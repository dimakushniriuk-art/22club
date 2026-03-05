import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/document-preview?bucket=...&path=...
 * Stream del file da Storage (signed URL server-side) per visualizzazione in iframe.
 * Evita X-Frame-Options / CORS che bloccano l'embed della signed URL diretta.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bucket = searchParams.get('bucket')
  const path = searchParams.get('path')

  if (!bucket || !path) {
    return NextResponse.json(
      { error: 'Parametri bucket e path richiesti' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 10)

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? 'Impossibile generare signed URL' },
      { status: 403 }
    )
  }

  const fileRes = await fetch(data.signedUrl)
  if (!fileRes.ok) {
    return NextResponse.json(
      { error: 'File non disponibile' },
      { status: fileRes.status }
    )
  }

  const contentType = fileRes.headers.get('content-type') ?? 'application/octet-stream'
  const body = await fileRes.arrayBuffer()

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  })
}
