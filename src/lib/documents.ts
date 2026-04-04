// =====================================================
// DOCUMENT MANAGEMENT FUNCTIONS
// =====================================================

import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { requireCurrentOrgId } from '@/lib/organizations/current-org'
import type { Tables, TablesUpdate } from '@/types/supabase'
import type { Document as DocumentDTO, DocumentStorageOpen } from '@/types/document'

const logger = createLogger('lib:documents')

type DocumentRow = Tables<'documents'>
type DocumentUpdate = TablesUpdate<'documents'>

type DocumentWithRelations = DocumentRow & {
  athlete?: { nome?: string | null; cognome?: string | null } | null
  uploaded_by?: { nome?: string | null; cognome?: string | null } | null
}

const supabase = createClient()

/**
 * Helper functions per estrarre informazioni file da URL
 * (campi non presenti nel DB ma utili per UI)
 * Esportate per uso nei componenti
 */
/** Bucket storage per tabella `documents` (file in `file_url`). */
export const DOCUMENTS_STORAGE_BUCKET = 'documents' as const

/** Bucket ammessi da `/api/document-preview` (allineare alla route API). */
export const STORAGE_PREVIEW_BUCKETS = [
  'documents',
  'athlete-certificates',
  'athlete-referti',
  'athlete-documents',
  'trainer-certificates',
  'trainer-media',
] as const

export type StoragePreviewBucket = (typeof STORAGE_PREVIEW_BUCKETS)[number]

export function isStoragePreviewBucket(bucket: string): bucket is StoragePreviewBucket {
  return (STORAGE_PREVIEW_BUCKETS as readonly string[]).includes(bucket)
}

/**
 * Path oggetto nel bucket da URL Supabase (`/object/public|sign|authenticated/{bucket}/…`) o path relativo con `/`.
 */
export function resolveStorageObjectPathFromUrl(fileUrl: string, bucket: string): string | null {
  const trimmed = fileUrl.trim()
  if (!trimmed) return null

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      const pathname = url.pathname
      const markers = [
        `/object/public/${bucket}/`,
        `/object/sign/${bucket}/`,
        `/object/authenticated/${bucket}/`,
      ]
      for (const marker of markers) {
        const idx = pathname.indexOf(marker)
        if (idx !== -1) {
          return decodeURIComponent(pathname.slice(idx + marker.length))
        }
      }
      return null
    } catch {
      return null
    }
  }

  const noLeading = trimmed.replace(/^\/+/, '')
  if (noLeading.includes('/')) {
    return noLeading
  }
  return null
}

/**
 * Path oggetto nel bucket `documents` da `file_url` (URL Supabase o path relativo).
 */
export function resolveDocumentsStoragePath(fileUrl: string): string | null {
  return resolveStorageObjectPathFromUrl(fileUrl, DOCUMENTS_STORAGE_BUCKET)
}

/**
 * `invoice_url` a volte è stato salvato come route app (`/home/fatture/...` o URL su stesso host)
 * invece del path reale nel bucket (`fatture/...`). Senza questa normalizzazione il path diventa
 * `home/fatture/...` e lo storage fallisce; il fallback apre una pagina inesistente (404).
 */
function normalizeLegacyAppInvoiceHref(invoiceUrl: string): string {
  const t = invoiceUrl.trim()
  if (!t) return t

  const mapHomeFattureToStorage = (path: string): string | null => {
    const nl = path.replace(/^\/+/, '')
    if (nl.startsWith('home/fatture/')) {
      return nl.slice('home/'.length)
    }
    return null
  }

  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t)
      const mapped = mapHomeFattureToStorage(u.pathname)
      if (mapped) return mapped
    } catch {
      /* ignora */
    }
    return t
  }

  const mapped = mapHomeFattureToStorage(t.startsWith('/') ? t : `/${t}`)
  return mapped ?? t
}

/** Path bucket `documents` per fatture (URL completo o path tipo `fatture/...`). */
export function resolveInvoiceDocumentsStoragePath(invoiceUrl: string): string | null {
  const ref = normalizeLegacyAppInvoiceHref(invoiceUrl)
  const resolved = resolveDocumentsStoragePath(ref)
  if (resolved) {
    if (resolved.startsWith('home/fatture/')) {
      return resolved.slice('home/'.length)
    }
    return resolved
  }
  const s = ref.trim()
  if (!s) return null
  if (!s.startsWith('http')) {
    if (s.startsWith('documents/')) return s.replace(/^documents\//, '')
    if (s.startsWith('home/fatture/')) return s.slice('home/'.length)
    return s
  }
  const match = s.match(/\/documents\/([^?]+)/)
  return match?.[1] ?? null
}

/** Nome file consigliato per anteprima/download da `invoice_url` (path storage o URL legacy). */
export function invoiceDocumentSuggestedFileName(
  invoiceUrl: string,
  fallbackDateIso: string,
): string {
  const filePath = resolveInvoiceDocumentsStoragePath(invoiceUrl)
  if (filePath) {
    const fromPath = filePath.split('/').filter(Boolean).pop()
    if (fromPath) return fromPath
  }
  const parts = invoiceUrl.trim().split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (last) return (last.split('?')[0] ?? last).trim() || last
  return `Fattura ${new Date(fallbackDateIso).toLocaleDateString('it-IT')}`
}

/** URL same-origin verso `/api/document-preview` (stream inline, cookie di sessione). */
export function storagePreviewHref(bucket: string, storagePath: string): string {
  return `/api/document-preview?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(storagePath)}`
}

/** Path da URL completo + `/api/document-preview`. */
export function storagePreviewHrefFromUrl(fileUrl: string, bucket: string): string | null {
  const path = resolveStorageObjectPathFromUrl(fileUrl, bucket)
  if (path == null) return null
  return storagePreviewHref(bucket, path)
}

/**
 * Path o URL già noto: risolve e restituisce href preview, altrimenti null.
 */
export function storagePreviewHrefFromUrlOrPath(bucket: string, urlOrPath: string): string | null {
  const t = urlOrPath.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) {
    return storagePreviewHrefFromUrl(t, bucket)
  }
  const path = t.startsWith('/') ? t.slice(1) : t
  if (!path.includes('/')) return null
  return storagePreviewHref(bucket, path)
}

/**
 * Link same-origin per file da bucket `documents` (proxy `/api/document-preview`).
 * `redirectForNavigation` è ignorato (compatibilità call site).
 */
export function documentsFilePreviewHref(
  fileUrl: string,
  _options?: { redirectForNavigation?: boolean },
): string | null {
  const path = resolveDocumentsStoragePath(fileUrl)
  if (path == null) return null
  return storagePreviewHref(DOCUMENTS_STORAGE_BUCKET, path)
}

type DocumentPreviewRow = Pick<DocumentDTO, 'file_url'> & {
  storage_open?: DocumentStorageOpen | null
}

/** Anteprima stessa scheda: tabella `documents` o riga aggregata (altri bucket / URL pubblico). */
export function documentPreviewHrefForRow(doc: DocumentPreviewRow): string | null {
  if (doc.storage_open?.type === 'public') return doc.storage_open.url
  if (doc.storage_open?.type === 'signed') {
    return storagePreviewHref(doc.storage_open.bucket, doc.storage_open.path)
  }
  return documentsFilePreviewHref(doc.file_url)
}

export async function fetchDocumentBlobForRow(doc: DocumentPreviewRow): Promise<Blob> {
  if (doc.storage_open?.type === 'public') {
    const res = await fetch(doc.storage_open.url, { credentials: 'omit', mode: 'cors' })
    if (!res.ok) throw new Error('Download failed')
    return res.blob()
  }
  if (doc.storage_open?.type === 'signed') {
    return fetchStorageBlobViaPreview(doc.storage_open.bucket, doc.storage_open.path)
  }
  return fetchDocumentBlobViaPreview(doc.file_url)
}

export async function fetchStorageBlobViaPreview(
  bucket: string,
  storagePath: string,
): Promise<Blob> {
  const href = storagePreviewHref(bucket, storagePath)
  const res = await fetch(href, { credentials: 'include' })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const ct = res.headers.get('content-type') ?? ''
      if (ct.includes('application/json')) {
        const j = (await res.json()) as { error?: unknown }
        if (typeof j?.error === 'string' && j.error.trim()) detail = j.error
      }
    } catch {
      /* ignora */
    }
    throw new Error(`Download fallito: ${detail}`)
  }
  return await res.blob()
}

export async function downloadStorageBlobViaPreview(
  bucket: string,
  storagePath: string,
  fileName: string,
): Promise<void> {
  const blob = await fetchStorageBlobViaPreview(bucket, storagePath)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export async function fetchDocumentBlobViaPreview(fileUrl: string): Promise<Blob> {
  const path = resolveDocumentsStoragePath(fileUrl)
  if (path == null) {
    throw new Error('Percorso file non valido')
  }
  return fetchStorageBlobViaPreview(DOCUMENTS_STORAGE_BUCKET, path)
}

export function extractFileName(fileUrl: string): string {
  try {
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/')
    return pathParts[pathParts.length - 1] || 'document'
  } catch {
    const pathParts = fileUrl.split('/')
    return pathParts[pathParts.length - 1] || 'document'
  }
}

export function extractFileType(fileUrl: string): string {
  const fileName = extractFileName(fileUrl)
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

/** Titolo riga / drawer: preferisce `display_file_name` e `file_name`. */
export function documentDisplayFileName(
  doc: Pick<DocumentDTO, 'file_url'> & {
    display_file_name?: string | null
    file_name?: string | null
  },
): string {
  const fromDisplay = doc.display_file_name?.trim()
  if (fromDisplay) return fromDisplay
  const fromMeta = doc.file_name?.trim()
  if (fromMeta) return fromMeta
  return extractFileName(doc.file_url)
}

function mapDocument(row: DocumentWithRelations): DocumentDTO {
  return {
    id: row.id,
    athlete_id: row.athlete_id,
    file_url: row.file_url,
    category: row.category,
    status:
      row.status === 'valido' ||
      row.status === 'scaduto' ||
      row.status === 'in-revisione' ||
      row.status === 'in_scadenza' ||
      row.status === 'non_valido'
        ? row.status
        : 'valido',
    expires_at: row.expires_at,
    uploaded_by_profile_id: row.uploaded_by_profile_id,
    uploaded_by_name: row.uploaded_by
      ? `${row.uploaded_by.nome ?? ''} ${row.uploaded_by.cognome ?? ''}`.trim() || null
      : null,
    notes: row.notes,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? null,
    athlete_name: row.athlete
      ? `${row.athlete.nome ?? ''} ${row.athlete.cognome ?? ''}`.trim() || null
      : null,
    staff_name: row.uploaded_by
      ? `${row.uploaded_by.nome ?? ''} ${row.uploaded_by.cognome ?? ''}`.trim() || null
      : null,
  }
}

function ensurePublicUrl(filePath: string): string {
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
  return urlData.publicUrl
}

// =====================================================
// UPLOAD DOCUMENT
// =====================================================

export async function uploadDocument(
  file: File,
  category: string,
  athleteId: string,
  uploadedByUserId?: string,
  expiresAt?: string,
  notes?: string,
  orgId?: string,
): Promise<DocumentDTO> {
  try {
    // 1. Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `documents/${athleteId}/${fileName}`

    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const publicUrl = ensurePublicUrl(filePath)

    // org_id: da parametro o da profilo atleta
    let org_id = orgId
    if (org_id == null) {
      const { data: athleteProfile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', athleteId)
        .single()
      org_id = requireCurrentOrgId(
        (athleteProfile as { org_id?: string | null } | null)?.org_id,
        'Organizzazione non disponibile per upload documento',
      )
    }

    // 3. Save document record to database
    // athleteId: per chi è il documento (profiles.user_id)
    // uploadedByUserId: chi carica il documento (profiles.user_id), default = athleteId (atleta carica per se stesso)
    const uploadedBy = uploadedByUserId || athleteId
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert({
        athlete_id: athleteId, // Per chi è il documento
        category,
        file_url: publicUrl,
        uploaded_by_profile_id: uploadedBy, // Chi carica il documento
        expires_at: expiresAt || null,
        notes: notes || null,
        status: 'valido',
        org_id,
      })
      .select(
        `
        *,
        athlete:profiles!athlete_id(nome, cognome),
        uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
      `,
      )
      .single()

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from('documents').remove([filePath])

      throw new Error(`Database error: ${dbError.message}`)
    }

    return mapDocument(documentData as DocumentWithRelations)
  } catch (error) {
    logger.error('Error uploading document', error, { athleteId, category })
    throw error
  }
}

// =====================================================
// MARK DOCUMENT AS INVALID
// =====================================================

export async function markDocumentInvalid(
  documentId: string,
  rejectionReason: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'non_valido',
        notes: rejectionReason,
      })
      .eq('id', documentId)

    if (error) {
      throw new Error(`Error marking document as invalid: ${error.message}`)
    }
  } catch (error) {
    logger.error('Error marking document as invalid', error, { documentId })
    throw error
  }
}

// =====================================================
// GET DOCUMENTS
// =====================================================

export async function getDocuments(
  athleteId?: string,
  filters?: {
    status?: string
    category?: string
    search?: string
  },
): Promise<DocumentDTO[]> {
  try {
    // Try query with relationships first, fallback to basic query if relationships fail
    let documentsData: DocumentWithRelations[] | undefined
    try {
      let query = supabase
        .from('documents')
        .select(
          `
          *,
          athlete:profiles!athlete_id(nome, cognome),
          uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
        `,
        )
        .order('created_at', { ascending: false })

      // Apply filters
      if (athleteId) {
        query = query.eq('athlete_id', athleteId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query

      if (error && error.message.includes('relationship')) {
        throw new Error('Relationship not found, using fallback')
      }
      if (error) throw error

      documentsData = data
    } catch (relationshipError) {
      logger.warn('Document relationships not available, using fallback', relationshipError, {
        athleteId,
      })

      // Fallback: query without relationships
      let fallbackQuery = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply same filters to fallback
      if (athleteId) {
        fallbackQuery = fallbackQuery.eq('athlete_id', athleteId)
      }
      if (filters?.status) {
        fallbackQuery = fallbackQuery.eq('status', filters.status)
      }
      if (filters?.category) {
        fallbackQuery = fallbackQuery.eq('category', filters.category)
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery

      if (fallbackError) throw fallbackError

      // Add mock profile data to maintain compatibility
      documentsData =
        fallbackData?.map((doc: DocumentRow) => ({
          ...doc,
          athlete: { nome: 'Atleta', cognome: 'Sconosciuto' },
          uploaded_by: { nome: 'Staff', cognome: 'Membro' },
        })) ?? []
    }

    // Apply search filter if needed (only remaining filter to apply)
    if (filters?.search && documentsData) {
      const searchTerm = filters.search.toLowerCase()
      documentsData = documentsData.filter((doc) => {
        const fileName = extractFileName(doc.file_url)
        const notes = doc.notes ?? ''
        return (
          fileName.toLowerCase().includes(searchTerm) || notes.toLowerCase().includes(searchTerm)
        )
      })
    }

    return (documentsData ?? []).map(mapDocument)
  } catch (error) {
    // Log dettagliato dell'errore
    const errorObj = error as Record<string, unknown>
    const errorMessage = (errorObj.message as string) || String(error) || 'Nessun messaggio'
    const errorCode =
      (errorObj.code as string) || (errorObj.status as number)?.toString() || 'UNKNOWN'
    const errorDetails = errorObj.details || 'Nessun dettaglio'
    const errorHint = (errorObj.hint as string) || 'Nessun hint'

    // Log immediato in console per debug
    console.error('=== ERRORE CARICAMENTO DOCUMENTI ===')
    console.error('Error message:', errorMessage)
    console.error('Error code:', errorCode)
    console.error('Error details:', errorDetails)
    console.error('Error hint:', errorHint)
    console.error('Athlete ID:', athleteId)
    console.error('Full error object:', error)

    logger.error('Error fetching documents', {
      error: {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        hint: errorHint,
      },
      athleteId,
    })
    throw error
  }
}

// =====================================================
// DELETE DOCUMENT
// =====================================================

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    // 1. Get document info
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_url, athlete_id')
      .eq('id', documentId)
      .single()

    if (fetchError) {
      throw new Error(`Error fetching document: ${fetchError.message}`)
    }

    // 2. Delete from database
    const { error: dbError } = await supabase.from('documents').delete().eq('id', documentId)

    if (dbError) {
      throw new Error(`Error deleting document: ${dbError.message}`)
    }

    // 3. Delete file from storage
    const filePath = resolveDocumentsStoragePath(document.file_url)
    if (filePath) {
      const { error: storageError } = await supabase.storage.from('documents').remove([filePath])
      if (storageError) {
        logger.warn('Error deleting file from storage', storageError, { documentId })
        // Non bloccare l'operazione se il file non esiste più
      }
    }
  } catch (error) {
    logger.error('Error deleting document', error, { documentId })
    throw error
  }
}

// =====================================================
// UPDATE DOCUMENT
// =====================================================

export async function updateDocument(
  documentId: string,
  updates: DocumentUpdate,
): Promise<DocumentDTO> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select(
        `
        *,
        athlete:profiles!athlete_id(nome, cognome),
        uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
      `,
      )
      .single()

    if (error) {
      throw new Error(`Error updating document: ${error.message}`)
    }

    return mapDocument(data as DocumentWithRelations)
  } catch (error) {
    logger.error('Error updating document', error, { documentId })
    throw error
  }
}

// =====================================================
// GET DOCUMENT STATS
// =====================================================

export async function getDocumentStats(athleteId?: string): Promise<{
  total: number
  valid: number
  expiring: number
  expired: number
  invalid: number
}> {
  try {
    let query = supabase.from('documents').select('status')

    if (athleteId) {
      query = query.eq('athlete_id', athleteId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error fetching document stats: ${error.message}`)
    }

    type DocStatsAcc = {
      total: number
      valid: number
      expiring: number
      expired: number
      invalid: number
    }
    const initial: DocStatsAcc = { total: 0, valid: 0, expiring: 0, expired: 0, invalid: 0 }
    const stats: DocStatsAcc =
      data?.reduce((acc: DocStatsAcc, doc: { status: string | null }) => {
        acc.total++
        if (doc.status === 'valido') acc.valid++
        if (doc.status === 'in_scadenza') acc.expiring++
        if (doc.status === 'scaduto') acc.expired++
        if (doc.status === 'non_valido') acc.invalid++
        return acc
      }, initial) ?? initial

    return {
      total: stats.total,
      valid: stats.valid,
      expiring: stats.expiring,
      expired: stats.expired,
      invalid: stats.invalid,
    }
  } catch (error) {
    logger.error('Error fetching document stats', error, { athleteId })
    throw error
  }
}

// =====================================================
// VALIDATE FILE
// =====================================================

export function validateDocumentFile(file: File): {
  valid: boolean
  error?: string
} {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

  const maxSize = 20 * 1024 * 1024 // 20MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato file non supportato. Usa PDF, JPG o PNG.',
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File troppo grande. Massimo 20MB.',
    }
  }

  return { valid: true }
}
