// ============================================================
// FASE 2: Servizio Comunicazioni
// ============================================================
// Gestisce CRUD operations per communications e recipients
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { Json } from '@/lib/supabase/types'

const logger = createLogger('lib:communications:service')

type CommunicationRow = Tables<'communications'>
type CommunicationRecipientRow = Tables<'communication_recipients'>

type CommunicationInsert = TablesInsert<'communications'>
type CommunicationUpdate = TablesUpdate<'communications'>
type CommunicationRecipientInsert = TablesInsert<'communication_recipients'>
type CommunicationRecipientUpdate = TablesUpdate<'communication_recipients'>

// Tipi per filtri destinatari
export interface RecipientFilter {
  role?: 'admin' | 'pt' | 'trainer' | 'staff' | 'atleta'
  athlete_ids?: string[]
  all_users?: boolean
}

// Tipo per creazione comunicazione
export interface CreateCommunicationInput {
  title: string
  message: string
  type: 'push' | 'email' | 'sms' | 'all'
  recipient_filter: RecipientFilter
  scheduled_for?: string | null
  metadata?: Record<string, unknown>
}

// Tipo per aggiornamento comunicazione
export interface UpdateCommunicationInput {
  title?: string
  message?: string
  type?: 'push' | 'email' | 'sms' | 'all'
  recipient_filter?: RecipientFilter
  scheduled_for?: string | null
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}

// Tipo per comunicazione con statistiche
export type CommunicationWithStats = CommunicationRow & {
  recipients?: CommunicationRecipientRow[]
}

let serviceClient: ReturnType<typeof createClient<Database>> | null = null

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function getSupabaseClient() {
  if (!serviceClient) {
    serviceClient = createClient<Database>(
      requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
        },
      },
    )
  }
  return serviceClient
}

// ============================================================
// CRUD Operations per Communications
// ============================================================

/**
 * Crea una nuova comunicazione
 */
export async function createCommunication(
  userId: string,
  input: CreateCommunicationInput,
): Promise<{ data: CommunicationRow | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const communicationData: CommunicationInsert = {
      created_by: userId,
      title: input.title,
      message: input.message,
      type: input.type,
      status: input.scheduled_for ? 'scheduled' : 'draft',
      scheduled_for: input.scheduled_for || null,
      recipient_filter: input.recipient_filter as Json,
      metadata: (input.metadata || {}) as Json,
      total_recipients: 0,
      total_sent: 0,
      total_delivered: 0,
      total_opened: 0,
      total_failed: 0,
    }

    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('communications') as any)
      .insert(communicationData)
      .select()
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Ottiene tutte le comunicazioni (con filtri opzionali e paginazione)
 * Restituisce anche il count totale per paginazione
 */
export async function getCommunications(options?: {
  status?: CommunicationRow['status']
  type?: CommunicationRow['type']
  created_by?: string
  limit?: number
  offset?: number
}): Promise<{
  data: CommunicationRow[] | null
  count: number | null
  error: Error | null
}> {
  try {
    const supabase = getSupabaseClient()

    // Costruisci query base per count (senza limit/offset)
    // Usa 'estimated' invece di 'exact' per velocità (accettabile per count comunicazioni)
    let countQuery = supabase.from('communications').select('*', { count: 'estimated', head: true })

    if (options?.status) {
      countQuery = countQuery.eq('status', options.status as CommunicationRow['status'])
    }

    if (options?.type) {
      countQuery = countQuery.eq('type', options.type as CommunicationRow['type'])
    }

    if (options?.created_by) {
      countQuery = countQuery.eq('created_by', options.created_by)
    }

    // Ottieni count totale
    const { count, error: countError } = await countQuery

    if (countError) {
      return { data: null, count: null, error: new Error(countError.message) }
    }

    // Query per i dati
    let query = supabase
      .from('communications')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status as CommunicationRow['status'])
    }

    if (options?.type) {
      query = query.eq('type', options.type as CommunicationRow['type'])
    }

    if (options?.created_by) {
      query = query.eq('created_by', options.created_by)
    }

    if (options?.limit) {
      if (options?.offset !== undefined) {
        // Usa range per paginazione
        query = query.range(options.offset, options.offset + options.limit - 1)
      } else {
        query = query.limit(options.limit)
      }
    }

    const { data, error } = await query

    if (error) {
      return { data: null, count: null, error: new Error(error.message) }
    }

    return { data, count: count || 0, error: null }
  } catch (error) {
    return {
      data: null,
      count: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Ottiene una comunicazione specifica con i suoi recipients
 */
export async function getCommunicationById(
  id: string,
): Promise<{ data: CommunicationWithStats | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const { data: communication, error: commError } = await supabase
      .from('communications')
      .select('*')
      .eq('id', id)
      .single()

    if (commError) {
      return { data: null, error: new Error(commError.message) }
    }

    const { data: recipients, error: recipientsError } = await supabase
      .from('communication_recipients')
      .select('*')
      .eq('communication_id', id)
      .order('created_at', { ascending: false })

    if (recipientsError) {
      return { data: null, error: new Error(recipientsError.message) }
    }

    // Type assertion per communication
    type CommunicationWithRecipients = CommunicationRow & {
      recipients: CommunicationRecipientRow[]
    }

    const typedCommunication = communication as CommunicationRow

    return {
      data: {
        ...typedCommunication,
        recipients: (recipients as CommunicationRecipientRow[]) || [],
      } as CommunicationWithRecipients,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Aggiorna una comunicazione
 * Se cambia il recipient_filter e la comunicazione è in stato draft/scheduled,
 * elimina i recipients esistenti per evitare invii a destinatari errati
 */
export async function updateCommunication(
  id: string,
  input: UpdateCommunicationInput,
): Promise<{ data: CommunicationRow | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    // Se recipient_filter è cambiato, verifica se dobbiamo eliminare recipients esistenti
    if (input.recipient_filter !== undefined) {
      // Ottieni comunicazione esistente per confrontare il filtro
      const { data: existingComm, error: fetchError } = await supabase
        .from('communications')
        .select('recipient_filter, status')
        .eq('id', id)
        .single()

      // Type assertion per existingComm
      type ExistingCommData = {
        recipient_filter?: Json | null
        status?: string | null
        [key: string]: unknown
      }

      const typedExistingComm = existingComm as ExistingCommData | null

      if (!fetchError && typedExistingComm) {
        // Confronta recipient_filter (confronto JSON stringificato per semplicità)
        const oldFilter = JSON.stringify(typedExistingComm.recipient_filter || {})
        const newFilter = JSON.stringify(input.recipient_filter)
        const filterChanged = oldFilter !== newFilter

        // Se il filtro è cambiato e la comunicazione è in stato draft/scheduled,
        // elimina i recipients esistenti e resetta total_recipients
        if (
          filterChanged &&
          typedExistingComm.status &&
          ['draft', 'scheduled'].includes(typedExistingComm.status)
        ) {
          const { error: deleteError } = await supabase
            .from('communication_recipients')
            .delete()
            .eq('communication_id', id)

          if (deleteError) {
            logger.warn(
              'Error deleting recipients for communication after filter change',
              deleteError,
              { communicationId: id },
            )
          } else {
            logger.debug(
              'Deleted existing recipients for communication after recipient_filter change',
              undefined,
              { communicationId: id },
            )
          }

          // Resetta total_recipients a 0 se non specificato esplicitamente
          if (input.recipient_filter === undefined) {
            // Non necessario, ma per sicurezza
          }
        }
      }
    }

    const updateData: CommunicationUpdate = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.message !== undefined) updateData.message = input.message
    if (input.type !== undefined) updateData.type = input.type
    if (input.status !== undefined) updateData.status = input.status
    if (input.scheduled_for !== undefined) updateData.scheduled_for = input.scheduled_for
    if (input.recipient_filter !== undefined) {
      updateData.recipient_filter = input.recipient_filter as Json
      // Se recipient_filter cambia e stiamo aggiornando, resetta total_recipients a 0
      // (verrà ricalcolato all'invio)
      updateData.total_recipients = 0
    }
    if (input.metadata !== undefined) updateData.metadata = input.metadata as Json

    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('communications') as any)
      .update(updateData as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Elimina una comunicazione (cascade elimina anche i recipients)
 */
export async function deleteCommunication(id: string): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('communications').delete().eq('id', id)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

// ============================================================
// Operations per Communication Recipients
// ============================================================

/**
 * Crea recipients per una comunicazione
 */
export async function createCommunicationRecipients(
  communicationId: string,
  recipients: Array<{ user_id: string; recipient_type: 'push' | 'email' | 'sms' }>,
): Promise<{ data: CommunicationRecipientRow[] | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const recipientsData: CommunicationRecipientInsert[] = recipients.map((r) => ({
      communication_id: communicationId,
      user_id: r.user_id,
      recipient_type: r.recipient_type,
      status: 'pending',
    }))

    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('communication_recipients') as any)
      .insert(recipientsData)
      .select()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    // Aggiorna total_recipients nella comunicazione
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('communications') as any)
      .update({ total_recipients: recipients.length } as Record<string, unknown>)
      .eq('id', communicationId)

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Aggiorna lo status di un recipient
 */
export async function updateRecipientStatus(
  recipientId: string,
  status: CommunicationRecipientRow['status'],
  metadata?: {
    sent_at?: string
    delivered_at?: string
    opened_at?: string
    failed_at?: string
    error_message?: string
    metadata?: Record<string, unknown>
  },
): Promise<{ data: CommunicationRecipientRow | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    const updateData: CommunicationRecipientUpdate = {
      status,
    }

    if (metadata?.sent_at) updateData.sent_at = metadata.sent_at
    if (metadata?.delivered_at) updateData.delivered_at = metadata.delivered_at
    if (metadata?.opened_at) updateData.opened_at = metadata.opened_at
    if (metadata?.failed_at) updateData.failed_at = metadata.failed_at
    if (metadata?.error_message) updateData.error_message = metadata.error_message
    if (metadata?.metadata) updateData.metadata = metadata.metadata as Json

    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('communication_recipients') as any)
      .update(updateData as Record<string, unknown>)
      .eq('id', recipientId)
      .select()
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Aggiorna le statistiche aggregate di una comunicazione
 */
export async function updateCommunicationStats(
  communicationId: string,
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient()

    // Calcola statistiche dai recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('communication_recipients')
      .select('status')
      .eq('communication_id', communicationId)

    if (recipientsError) {
      return { error: new Error(recipientsError.message) }
    }

    // Type assertion per recipients
    type RecipientRow = {
      status?: string | null
      [key: string]: unknown
    }

    const typedRecipients = (recipients as RecipientRow[]) || []

    if (!typedRecipients || typedRecipients.length === 0) {
      return { error: null }
    }

    const stats = {
      total_recipients: typedRecipients.length,
      total_sent: typedRecipients.filter((r) =>
        ['sent', 'delivered', 'opened'].includes((r.status as string) || ''),
      ).length,
      total_delivered: typedRecipients.filter((r) =>
        ['delivered', 'opened'].includes((r.status as string) || ''),
      ).length,
      total_opened: typedRecipients.filter((r) => (r.status as string) === 'opened').length,
      total_failed: typedRecipients.filter(
        (r) => (r.status as string) === 'failed' || (r.status as string) === 'bounced',
      ).length,
    }

    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('communications') as any)
      .update(stats as Record<string, unknown>)
      .eq('id', communicationId)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}
