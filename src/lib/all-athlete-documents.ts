/**
 * Aggrega tutte le fonti documenti dell'atleta (tabella documents, dati medici, amministrativi, fatture)
 * per la pagina /home/documenti.
 */

import { createClient } from '@/lib/supabase/client'
import { getDocuments, resolveDocumentsStoragePath } from '@/lib/documents'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { Document } from '@/types/document'

export type UnifiedDocumentSource =
  | 'documents'
  | 'medical_certificate'
  | 'medical_referto'
  | 'contract'
  | 'invoice'
  | 'nutrition_plan_pdf'
  | 'chat_attachment'

export interface UnifiedDocumentItem {
  id: string
  category: string
  categoryKey: string
  label: string
  date: string
  expires_at?: string | null
  status?: 'valido' | 'in_scadenza' | 'scaduto' | 'non_valido' | 'in-revisione' | null
  notes?: string | null
  open: { type: 'public'; url: string } | { type: 'signed'; bucket: string; path: string }
  source: UnifiedDocumentSource
  canReplace?: boolean
  /** Se presente, usato come fallback se la signed URL fallisce (es. bucket pubblico) */
  publicUrlFallback?: string
  /** Solo `source === 'documents'`: metadati riga DB. */
  uploaded_by_profile_id?: string | null
  uploaded_by_name?: string | null
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
 * Path bucket `documents` per PDF piano nutrizionale: solo cartelle assegnate all'atleta (`nutrition-plans/{profileId}/…`).
 */
function documentsPathFromNutritionPdfRef(
  pdfRef: string,
  athleteProfileId: string,
): { path: string; publicFallback?: string } | null {
  const t = pdfRef.trim()
  if (!t) return null
  let pathInBucket: string | null = null
  let publicFallback: string | undefined
  if (/^https?:\/\//i.test(t)) {
    publicFallback = t
    pathInBucket = resolveDocumentsStoragePath(t)
    if (!pathInBucket) {
      const m = t.match(/\/object\/[^/]+\/documents\/(.+?)(?:\?|$)/i)
      if (m) pathInBucket = decodeURIComponent(m[1])
    }
  } else {
    pathInBucket = t.replace(/^\/+/, '')
  }
  if (!pathInBucket) return null
  pathInBucket = normalizeDocumentsStoragePath(pathInBucket.replace(/^\/+/, ''))
  const segs = pathInBucket.split('/').filter(Boolean)
  if (segs[0] === 'nutrition-plans') {
    if (segs[1] === '_unassigned') return null
    if (segs[1]?.toLowerCase() !== athleteProfileId.toLowerCase()) return null
    return { path: pathInBucket, publicFallback }
  }
  return null
}

/**
 * Aggrega documenti da: documents, medico, amministrativo, fatture, PDF piani nutrizionali, allegati chat.
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
      canReplace: d.status === 'scaduto' || d.status === 'in_scadenza' || d.status === 'non_valido',
      publicUrlFallback: d.file_url,
      uploaded_by_profile_id: d.uploaded_by_profile_id ?? null,
      uploaded_by_name: d.uploaded_by_name ?? d.staff_name ?? null,
    })
  }

  // 2. Dati medici: certificato + referti (athlete_id = profiles.user_id)
  type MedicalRow = {
    certificato_medico_url?: string | null
    certificato_medico_scadenza?: string | null
    certificato_medico_tipo?: string | null
    referti_medici?: unknown
    updated_at?: string | null
  } | null
  let medical: MedicalRow = null
  if (userId) {
    const res = await supabase
      .from('athlete_medical_data')
      .select(
        'certificato_medico_url, certificato_medico_scadenza, certificato_medico_tipo, referti_medici, updated_at',
      )
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

  const referti =
    (medical?.referti_medici as Array<{
      url: string
      data: string
      tipo: string
      note?: string
    }>) || []
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

  const documentiContrattuali =
    (administrative?.documenti_contrattuali as Array<{
      url: string
      nome: string
      tipo: string
      data_upload: string
      note?: string
    }>) || []
  documentiContrattuali.forEach((doc, i) => {
    const parsed = doc.url.startsWith('http') ? parseStorageUrl(doc.url) : null
    const useSigned = parsed && ['athlete-documents', 'documents'].includes(parsed.bucket)
    items.push({
      id: `contract-${userId}-${i}-${doc.url}`,
      category: doc.tipo || 'Documento contrattuale',
      categoryKey: 'contratto',
      label: doc.nome || doc.tipo || 'Documento',
      date: doc.data_upload,
      notes: doc.note ?? null,
      open: useSigned
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

  const paymentsList = (payments || []) as Array<{
    id: string
    payment_date?: string | null
    amount?: number | null
    invoice_url?: string | null
  }>
  paymentsList.forEach((p) => {
    const url = p.invoice_url as string
    const isPublic = url.startsWith('http')
    const date =
      p.payment_date ?? (p as { created_at?: string }).created_at ?? new Date().toISOString()
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

  // 5. PDF piani nutrizionali (nutrition_plan_versions + legacy), path storage nutrition-plans/{profileId}/…
  const { data: nutritionGroups } = await supabase
    .from('nutrition_plan_groups')
    .select('id, title')
    .eq('athlete_id', profileId)
  const groupRows = (nutritionGroups ?? []) as { id: string; title: string | null }[]
  const groupTitleById = new Map(groupRows.map((g) => [g.id, g.title?.trim() || 'Piano nutrizionale']))

  for (const idChunk of chunkForSupabaseIn(groupRows.map((g) => g.id))) {
    if (idChunk.length === 0) continue

    const { data: versNew } = await supabase
      .from('nutrition_plan_versions')
      .select('id, plan_id, version_number, status, pdf_file_path, created_at, start_date')
      .in('plan_id', idChunk)
      .not('pdf_file_path', 'is', null)

    for (const row of versNew ?? []) {
      const r = row as {
        id: string
        plan_id: string
        version_number: number
        status: string
        pdf_file_path: string
        created_at: string
        start_date: string | null
      }
      const resolved = documentsPathFromNutritionPdfRef(r.pdf_file_path, profileId)
      if (!resolved) continue
      const title = groupTitleById.get(r.plan_id) ?? 'Piano nutrizionale'
      items.push({
        id: `nutrition-plan-${r.id}`,
        category: 'Piano nutrizionale',
        categoryKey: 'piano_nutrizionale',
        label: `${title} · v${r.version_number} (${r.status})`,
        date: r.start_date ?? r.created_at ?? new Date().toISOString(),
        notes: null,
        open: { type: 'signed', bucket: 'documents', path: resolved.path },
        source: 'nutrition_plan_pdf',
        publicUrlFallback: resolved.publicFallback,
      })
    }

    const { data: versLegacy } = await supabase
      .from('nutrition_plan_versions_legacy')
      .select('id, plan_group_id, version_number, status, pdf_file_path, created_at, start_date')
      .in('plan_group_id', idChunk)
      .not('pdf_file_path', 'is', null)

    for (const row of versLegacy ?? []) {
      const r = row as {
        id: string
        plan_group_id: string
        version_number: number
        status: string
        pdf_file_path: string
        created_at: string
        start_date: string | null
      }
      const resolved = documentsPathFromNutritionPdfRef(r.pdf_file_path, profileId)
      if (!resolved) continue
      const title = groupTitleById.get(r.plan_group_id) ?? 'Piano nutrizionale'
      items.push({
        id: `nutrition-plan-legacy-${r.id}`,
        category: 'Piano nutrizionale',
        categoryKey: 'piano_nutrizionale',
        label: `${title} · v${r.version_number} (${r.status})`,
        date: r.start_date ?? r.created_at ?? new Date().toISOString(),
        notes: null,
        open: { type: 'signed', bucket: 'documents', path: resolved.path },
        source: 'nutrition_plan_pdf',
        publicUrlFallback: resolved.publicFallback,
      })
    }
  }

  // 6. Allegati file nei messaggi chat (bucket documents, path chat_files/…)
  const { data: chatAttachments } = await supabase
    .from('chat_messages')
    .select('id, created_at, file_url, file_name, message, sender_id, receiver_id')
    .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
    .not('file_url', 'is', null)
    .order('created_at', { ascending: false })

  for (const msg of chatAttachments ?? []) {
    const row = msg as {
      id: string
      created_at: string | null
      file_url: string
      file_name: string | null
      message: string
    }
    const path = resolveDocumentsStoragePath(row.file_url)
    if (!path) continue
    items.push({
      id: `chat-file-${row.id}`,
      category: 'Allegato chat',
      categoryKey: 'allegato_chat',
      label: row.file_name?.trim() || path.split('/').pop() || 'Allegato',
      date: row.created_at ?? new Date().toISOString(),
      notes: row.message?.trim() ? row.message.trim().slice(0, 240) : null,
      open: { type: 'signed', bucket: 'documents', path },
      source: 'chat_attachment',
      publicUrlFallback: row.file_url,
    })
  }

  // Ordina per data (più recenti prima)
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return items
}

function staffUploaderForSource(source: UnifiedDocumentSource): string {
  switch (source) {
    case 'medical_certificate':
    case 'medical_referto':
      return 'Profilo medico (atleta / staff)'
    case 'contract':
      return 'Documenti contrattuali (profilo)'
    case 'invoice':
      return 'Fatturazione'
    case 'nutrition_plan_pdf':
      return 'Piano nutrizionale (PDF)'
    case 'chat_attachment':
      return 'Chat'
    default:
      return '—'
  }
}

function toStaffDocumentStatus(s: UnifiedDocumentItem['status']): Document['status'] {
  if (
    s === 'valido' ||
    s === 'scaduto' ||
    s === 'in-revisione' ||
    s === 'in_scadenza' ||
    s === 'non_valido'
  ) {
    return s
  }
  return 'valido'
}

/**
 * Righe per dashboard staff (`/dashboard/documenti?atleta=`) allineate al tipo `Document`.
 */
export function mapUnifiedItemsToStaffDocuments(
  items: UnifiedDocumentItem[],
  athleteProfileId: string,
  athleteDisplayName: string | null,
): Document[] {
  return items.map((item) => {
    const status = toStaffDocumentStatus(item.status ?? null)

    if (item.source === 'documents') {
      return {
        id: item.id,
        athlete_id: athleteProfileId,
        file_url: item.publicUrlFallback ?? '',
        category: item.categoryKey,
        status,
        expires_at: item.expires_at ?? null,
        uploaded_by_profile_id: item.uploaded_by_profile_id ?? '',
        uploaded_by_name: item.uploaded_by_name ?? null,
        notes: item.notes ?? null,
        created_at: item.date,
        updated_at: null,
        athlete_name: athleteDisplayName,
        staff_name: item.uploaded_by_name ?? null,
        display_file_name: item.label,
        storage_open: null,
        is_db_document: true,
      }
    }

    const fileUrl = item.open.type === 'public' ? item.open.url : ''

    return {
      id: item.id,
      athlete_id: athleteProfileId,
      file_url: fileUrl,
      category: item.categoryKey,
      status,
      expires_at: item.expires_at ?? null,
      uploaded_by_profile_id: '',
      uploaded_by_name: staffUploaderForSource(item.source),
      notes: item.notes ?? null,
      created_at: item.date,
      updated_at: null,
      athlete_name: athleteDisplayName,
      staff_name: staffUploaderForSource(item.source),
      display_file_name: item.label,
      storage_open: item.open,
      is_db_document: false,
    }
  })
}
