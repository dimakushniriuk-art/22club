import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Risposta: oggetto con chiavi uguali al form progressi (stringhe per precompilazione). */
export type ExtractProgressPdfResponse = Record<string, string>

/** Pattern per estrazione valori da testo PDF (etichetta seguita da numero). */
const PATTERNS: Array<{ keys: string[]; regex: RegExp }> = [
  { keys: ['peso_kg', 'weight_kg'], regex: /(?:peso|weight)\s*(?:\(kg\))?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['massa_grassa_percentuale', 'body_fat'], regex: /massa\s*grassa\s*(?:%|percentuale)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['massa_grassa_percentuale', 'body_fat'], regex: /(?:body\s*fat|fat\s*%?|grasso\s*%?)\s*[:\s]*([\d.,]+)/gi },
  { keys: ['massa_grassa_kg'], regex: /massa\s*grassa\s*(?:kg)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['massa_magra_kg'], regex: /massa\s*magra\s*(?:kg)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['massa_muscolare_kg'], regex: /massa\s*muscolare\s*(?:kg)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['collo_cm'], regex: /collo\s*(?:cm)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['spalle_cm'], regex: /spalle\s*(?:cm)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['torace_cm', 'chest_cm'], regex: /(?:torace|chest|petto)\s*(?:cm)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['vita_cm', 'waist_cm'], regex: /(?:vita|waist)\s*(?:cm)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['fianchi_cm', 'hips_cm'], regex: /(?:fianchi|hips)\s*(?:cm)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['braccio_rilassato_cm'], regex: /braccio\s*rilassato\s*(?:cm)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['braccio_contratto_cm'], regex: /braccio\s*contratto\s*(?:cm)?\s*[:\s]*([\d.,]+)/gi },
  { keys: ['imc'], regex: /(?:imc|bmi|indice\s*massa)\s*[:\s]*([\d.,]+)/gi },
]

function parseNumberFromText(text: string): string | null {
  if (!text || !text.trim()) return null
  const normalized = text.trim().replace(',', '.')
  const num = parseFloat(normalized)
  return Number.isNaN(num) ? null : String(num)
}

function extractFromText(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { keys, regex } of PATTERNS) {
    const m = regex.exec(text)
    if (m?.[1]) {
      const val = parseNumberFromText(m[1])
      if (val != null) for (const k of keys) out[k] = val
    }
  }
  return out
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.role !== 'nutrizionista') {
      return NextResponse.json({ error: 'Solo il nutrizionista può usare questa funzione' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const athleteProfileId = formData.get('athleteProfileId') as string | null

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'File PDF richiesto' }, { status: 400 })
    }

    if (athleteProfileId) {
      const { data: link } = await supabase
        .from('staff_atleti')
        .select('atleta_id')
        .eq('staff_id', profile.id)
        .eq('atleta_id', athleteProfileId)
        .eq('status', 'active')
        .eq('staff_type', 'nutrizionista')
        .maybeSingle()
      if (!link) {
        return NextResponse.json({ error: 'Atleta non assegnato a te' }, { status: 403 })
      }
    }

    const buf = Buffer.from(await file.arrayBuffer())
    let text = ''

    try {
      const pdfParse = (await import('pdf-parse')).default
      const result = await pdfParse(buf)
      text = result?.text ?? ''
    } catch {
      try {
        const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
        const doc = await getDocument({ data: new Uint8Array(buf) }).promise
        const parts: string[] = []
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i)
          const content = await page.getTextContent()
          parts.push((content.items as { str?: string }[]).map((it) => it.str ?? '').join(' '))
        }
        text = parts.join('\n')
      } catch {
        return NextResponse.json({ extracted: {} as ExtractProgressPdfResponse }, { status: 200 })
      }
    }

    const extracted = extractFromText(text)
    return NextResponse.json({ extracted } as { extracted: ExtractProgressPdfResponse })
  } catch (e) {
    console.error('[extract-progress-pdf]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Errore estrazione PDF' },
      { status: 500 }
    )
  }
}
