/**
 * Aggrega tutte le fonti documenti dell'atleta (tabella documents, dati medici, amministrativi, fatture)
 * per la pagina /home/documenti.
 */

import { createClient } from '@/lib/supabase'
import { getDocuments } from '@/lib/documents'

export type UnifiedDocumentSource =
  | 'documents'
  | 'medical_certificate'
  | 'medical_referto'
  | 'contract'
  | 'invoice'

export interface UnifiedDocumentItem {
  id: string
  category: string
  categoryKey: string
  label: string
  date: string
  expires_at?: string | null
  status?: 'valido' | 'in_scadenza' | 'scaduto' | 'non_valido' | 'in-revisione' | null
  notes?: string | null
  open:
    | { type: 'public'; url: string }
    | { type: 'signed'; bucket: string; path: string }
  source: UnifiedDocumentSource
  canReplace?: boolean
  /** Se presente, usato come fallback se la signed URL fallisce (es. bucket pubblico) */
  publicUrlFallback?: string
}

/**
 * Restituisce il path per signed URL (rimuove leading slash).
 */
function toStoragePath(urlOrPath: string): string {
  return urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath
}

const UUID_RE = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

/**
 * In storage il path reale del dossier è dossier/{profile_id}/{filename}.
 * Se file_url nel DB ha profile_id/dossier/{filename}, lo converte nel formato corretto.
 */
function normalizeDocumentsStoragePath(path: string): string {
  const m = path.match(new RegExp(`^(${UUID_RE})/dossier/(.+)$`, 'i'))
  return m ? `dossier/${m[1]}/${m[2]}` : path
}

/**
 * Estrae il path storage dal file_url della tabella documents (bucket privato → serve signed URL).
 * URL tipo: https://xxx.supabase.co/storage/v1/object/public/documents/documents/athleteId/file.pdf
 */
function documentFileUrlToStoragePath(fileUrl: string): string {
  try {
    const u = new URL(fileUrl)
    const match = u.pathname.match(/\/documents\/(.+)$/)
    const raw = match ? match[1] : fileUrl
    const path = raw.startsWith('/') ? raw.slice(1) : raw
    return normalizeDocumentsStoragePath(path)
  } catch {
    const path = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl
    return normalizeDocumentsStoragePath(path)
  }
}

/**
 * Estrae bucket e path da un URL di storage Supabase (object/public/bucket_id/path).
 * Per bucket privati usare signed URL con path estratto.
 */
function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const u = new URL(url)
    const match = u.pathname.match(/\/object\/[^/]+\/[^/]+\/([^/]+)\/(.+)$/)
    if (match) return { bucket: match[1], path: match[2] }
    return null
  } catch {
    return null
  }
}

/**
 * Aggrega documenti da: tabella documents, certificato/referti medici, documenti contrattuali, fatture.
 * @param profileId - profiles.id (per documents e payments)
 * @param userId - profiles.user_id / auth.uid() (per athlete_medical_data e athlete_administrative_data); opzionale
 */
export async function getAllAthleteDocuments(
  profileId: string,
  userId: string | null,
): Promise<UnifiedDocumentItem[]> {
  const supabase = createClient()
  const items: UnifiedDocumentItem[] = []

  // 1. Tabella documents (athlete_id = profiles.id) — bucket privato: apri con signed URL
  const docs = await getDocuments(profileId)
  for (const d of docs) {
    const storagePath = documentFileUrlToStoragePath(d.file_url)
    items.push({
      id: d.id,
      category: d.category,
      categoryKey: d.category,
      label: d.file_url?.split('/').pop() || 'Documento',
      date: d.created_at,
      expires_at: d.expires_at,
      status: d.status,
      notes: d.notes,
      open: { type: 'signed', bucket: 'documents', path: storagePath },
      source: 'documents',
      canReplace:
        d.status === 'scaduto' || d.status === 'in_scadenza' || d.status === 'non_valido',
      publicUrlFallback: d.file_url,
    })
  }

  // 2. Dati medici: certificato + referti (athlete_id = profiles.user_id)
  type MedicalRow = { certificato_medico_url?: string | null; certificato_medico_scadenza?: string | null; certificato_medico_tipo?: string | null; referti_medici?: unknown; updated_at?: string | null } | null
  let medical: MedicalRow = null
  if (userId) {
    const res = await supabase
      .from('athlete_medical_data')
      .select('certificato_medico_url, certificato_medico_scadenza, certificato_medico_tipo, referti_medici, updated_at')
      .eq('athlete_id', userId)
      .maybeSingle()
    medical = res.data as MedicalRow
  }

  if (medical?.certificato_medico_url) {
    const path = toStoragePath(medical.certificato_medico_url)
    const scadenza = medical.certificato_medico_scadenza
    let status: UnifiedDocumentItem['status'] = null
    if (scadenza) {
      const scad = new Date(scadenza)
      const now = new Date()
      if (scad < now) status = 'scaduto'
      else if ((scad.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7) status = 'in_scadenza'
      else status = 'valido'
    }
    items.push({
      id: `medical-cert-${userId}`,
      category: 'Certificato medico',
      categoryKey: 'certificato',
      label: medical.certificato_medico_tipo
        ? `Certificato ${medical.certificato_medico_tipo}`
        : 'Certificato medico',
      date: (medical as { updated_at?: string }).updated_at ?? scadenza ?? new Date().toISOString(),
      expires_at: scadenza ?? null,
      status,
      open: { type: 'signed', bucket: 'athlete-certificates', path },
      source: 'medical_certificate',
    })
  }

  const referti = (medical?.referti_medici as Array<{ url: string; data: string; tipo: string; note?: string }>) || []
  referti.forEach((r, i) => {
    const path = toStoragePath(r.url)
    items.push({
      id: `medical-referto-${userId}-${i}-${path}`,
      category: 'Referto medico',
      categoryKey: 'referto',
      label: r.tipo || 'Referto',
      date: r.data,
      notes: r.note ?? null,
      open: { type: 'signed', bucket: 'athlete-referti', path },
      source: 'medical_referto',
    })
  })

  // 3. Dati amministrativi: documenti contrattuali (athlete_id = profiles.user_id)
  let administrative: { documenti_contrattuali?: unknown } | null = null
  if (userId) {
    const res = await supabase
      .from('athlete_administrative_data')
      .select('documenti_contrattuali')
      .eq('athlete_id', userId)
      .maybeSingle()
    administrative = res.data
  }

  const documentiContrattuali = (administrative?.documenti_contrattuali as Array<{
    url: string
    nome: string
    tipo: string
    data_upload: string
    note?: string
  }>) || []
  documentiContrattuali.forEach((doc, i) => {
    const parsed = doc.url.startsWith('http') ? parseStorageUrl(doc.url) : null
    const useSigned =
      parsed && ['athlete-documents', 'documents'].includes(parsed.bucket)
    items.push({
      id: `contract-${userId}-${i}-${doc.url}`,
      category: doc.tipo || 'Documento contrattuale',
      categoryKey: 'contratto',
      label: doc.nome || doc.tipo || 'Documento',
      date: doc.data_upload,
      notes: doc.note ?? null,
      open:
        useSigned
          ? { type: 'signed', bucket: parsed!.bucket, path: parsed!.path }
          : doc.url.startsWith('http')
            ? { type: 'public', url: doc.url }
            : { type: 'signed', bucket: 'athlete-documents', path: toStoragePath(doc.url) },
      source: 'contract',
    })
  })

  // 4. Fatture da payments (athlete_id = profiles.id)
  const { data: payments } = await supabase
    .from('payments')
    .select('id, payment_date, amount, invoice_url')
    .eq('athlete_id', profileId)
    .eq('status', 'completed')
    .not('invoice_url', 'is', null)

  const paymentsList = (payments || []) as Array<{ id: string; payment_date?: string | null; amount?: number | null; invoice_url?: string | null }>
  paymentsList.forEach((p) => {
    const url = p.invoice_url as string
    const isPublic = url.startsWith('http')
    const date = p.payment_date ?? (p as { created_at?: string }).created_at ?? new Date().toISOString()
    items.push({
      id: `invoice-${p.id}`,
      category: 'Fattura',
      categoryKey: 'fattura',
      label: `Fattura ${new Date(date).toLocaleDateString('it-IT')}`,
      date,
      notes: p.amount != null ? `Importo: €${Number(p.amount).toFixed(2)}` : null,
      open: isPublic
        ? { type: 'public', url }
        : { type: 'signed', bucket: 'documents', path: toStoragePath(url) },
      source: 'invoice',
    })
  })

  // Ordina per data (più recenti prima)
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return items
}
