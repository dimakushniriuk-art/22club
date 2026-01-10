// =====================================================
// DOCUMENT MANAGEMENT FUNCTIONS
// =====================================================

import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { Tables, TablesUpdate } from '@/types/supabase'
import type { Document as DocumentDTO } from '@/types/document'

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
        fallbackData?.map((doc) => ({
          ...(doc as DocumentRow),
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
    const filePath = document.file_url.split('/').slice(-2).join('/')
    const { error: storageError } = await supabase.storage.from('documents').remove([filePath])

    if (storageError) {
      logger.warn('Error deleting file from storage', storageError, { documentId })
      // Non bloccare l'operazione se il file non esiste più
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

    const stats = data?.reduce(
      (acc, doc) => {
        acc.total++
        if (doc.status === 'valido') acc.valid++
        if (doc.status === 'in_scadenza') acc.expiring++
        if (doc.status === 'scaduto') acc.expired++
        if (doc.status === 'non_valido') acc.invalid++
        return acc
      },
      {
        total: 0,
        valid: 0,
        expiring: 0,
        expired: 0,
        invalid: 0,
      },
    ) || {
      total: 0,
      valid: 0,
      expiring: 0,
      expired: 0,
      invalid: 0,
    }

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
