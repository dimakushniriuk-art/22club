'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'
import type { Json } from '@/lib/supabase/types'
import type { RecipientFilter } from '@/lib/communications/service'
import { createLogger } from '@/lib/logger'
import { apiGet } from '@/lib/api-client'

const logger = createLogger('useCommunications')

type CommunicationRow = Tables<'communications'>
type CommunicationRecipientRow = Tables<'communication_recipients'>

export interface Communication extends CommunicationRow {
  recipients?: CommunicationRecipientRow[]
}

export interface CreateCommunicationInput {
  title: string
  message: string
  type: 'email' | 'all'
  recipient_filter: RecipientFilter
  scheduled_for?: string | null
  metadata?: Record<string, unknown>
}

export interface UpdateCommunicationInput {
  title?: string
  message?: string
  type?: 'email' | 'all'
  recipient_filter?: RecipientFilter
  scheduled_for?: string | null
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}

interface UseCommunicationsOptions {
  /** Filtro per stato: singolo o multiplo (es. ['draft','scheduled','sending'] per "In attesa") */
  status?: CommunicationRow['status'] | CommunicationRow['status'][]
  type?: CommunicationRow['type']
  limit?: number
  offset?: number
  autoRefresh?: boolean
}

export function useCommunications(options: UseCommunicationsOptions = {}) {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch comunicazioni
  const fetchCommunications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Usa API route su web, Supabase client su mobile
      const queryParams: Record<string, string> = {}
      if (options.status) {
        queryParams.status = Array.isArray(options.status)
          ? options.status.join(',')
          : options.status
      }
      if (options.type) queryParams.type = options.type
      if (options.limit) queryParams.limit = options.limit.toString()
      if (options.offset !== undefined) queryParams.offset = options.offset.toString()

      const result = await apiGet<{ data: Communication[]; count: number }>(
        '/api/communications/list',
        queryParams,
        // Fallback Supabase (usato su mobile o se API fallisce)
        async (): Promise<{ data: Communication[]; count: number }> => {
          let query = supabase
            .from('communications')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })

          if (options.status) {
            if (Array.isArray(options.status)) {
              query = query.in('status', options.status)
            } else {
              query = query.eq('status', options.status)
            }
          }

          if (options.type && options.type !== 'all') {
            query = query.eq('type', options.type)
          }

          if (options.limit) {
            if (options.offset !== undefined) {
              query = query.range(options.offset, options.offset + options.limit - 1)
            } else {
              query = query.limit(options.limit)
            }
          }

          const { data, error: fetchError, count } = await query

          if (fetchError) {
            throw fetchError
          }

          return {
            data: (data || []) as Communication[],
            count: count ?? 0,
          }
        },
      )

      setCommunications(result.data || [])
      setTotalCount(result.count ?? null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      logger.error('Error fetching communications', error)
      setCommunications([])
      setTotalCount(null)
    } finally {
      setLoading(false)
    }
  }, [options.status, options.type, options.limit, options.offset])

  // Fetch comunicazione singola con recipients
  const fetchCommunicationById = useCallback(async (id: string): Promise<Communication | null> => {
    try {
      const { data: communication, error: commError } = await supabase
        .from('communications')
        .select('*')
        .eq('id', id)
        .single()

      if (commError) {
        throw new Error(commError.message)
      }

      const { data: recipients, error: recipientsError } = await supabase
        .from('communication_recipients')
        .select('*')
        .eq('communication_id', id)
        .order('created_at', { ascending: false })

      if (recipientsError) {
        throw new Error(recipientsError.message)
      }

      // Type assertion per communication
      const typedCommunication = communication as CommunicationRow

      return {
        ...typedCommunication,
        recipients: recipients || [],
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      logger.error('Error fetching communication', error, { communicationId: id })
      return null
    }
  }, [])

  // Crea comunicazione
  const createCommunication = useCallback(
    async (input: CreateCommunicationInput): Promise<Communication | null> => {
      try {
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('User not authenticated')
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!profile?.id) {
          throw new Error('Profilo non trovato')
        }

        const communicationData: Record<string, unknown> = {
          created_by_profile_id: profile.id,
          title: input.title,
          message: input.message,
          type: input.type,
          status: input.scheduled_for ? 'scheduled' : 'draft',
          scheduled_for: input.scheduled_for || null,
          recipient_filter: input.recipient_filter as unknown as Json,
          metadata: (input.metadata || {}) as Json,
          total_recipients: 0,
          total_sent: 0,
          total_delivered: 0,
          total_opened: 0,
          total_failed: 0,
        }

        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: createError } = await (supabase.from('communications') as any)
          .insert(communicationData as Record<string, unknown>)
          .select()
          .single()

        if (createError) {
          throw new Error(createError.message)
        }

        // Refresh lista
        await fetchCommunications()

        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        logger.error('Error creating communication', error, { input })
        return null
      }
    },
    [fetchCommunications],
  )

  // Aggiorna comunicazione
  const updateCommunication = useCallback(
    async (id: string, input: UpdateCommunicationInput): Promise<Communication | null> => {
      try {
        setError(null)

        const updateData: Partial<CommunicationRow> = {}

        if (input.title !== undefined) updateData.title = input.title
        if (input.message !== undefined) updateData.message = input.message
        if (input.type !== undefined) updateData.type = input.type
        if (input.status !== undefined) updateData.status = input.status
        if (input.scheduled_for !== undefined) updateData.scheduled_for = input.scheduled_for
        if (input.recipient_filter !== undefined)
          updateData.recipient_filter = input.recipient_filter as unknown as Json
        if (input.metadata !== undefined) updateData.metadata = input.metadata as Json

        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: updateError } = await (supabase.from('communications') as any)
          .update(updateData as Record<string, unknown>)
          .eq('id', id)
          .select()
          .single()

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Refresh lista
        await fetchCommunications()

        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        logger.error('Error updating communication', error, { communicationId: id, input })
        return null
      }
    },
    [fetchCommunications],
  )

  // Elimina comunicazione
  const deleteCommunication = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)

        const { error: deleteError } = await supabase.from('communications').delete().eq('id', id)

        if (deleteError) {
          throw new Error(deleteError.message)
        }

        // Refresh lista
        await fetchCommunications()

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        logger.error('Error deleting communication', error, { communicationId: id })
        return false
      }
    },
    [fetchCommunications],
  )

  // Invia comunicazione (crea recipients + invia effettivamente)
  const sendCommunication = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string; message?: string }> => {
      try {
        setError(null)

        // Chiama API route per gestire invio completo (creazione recipients + invio)
        const response = await fetch('/api/communications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ communicationId: id }),
        })

        const text = await response.text()
        if (!text || text.trim().length === 0) {
          const errorMessage = 'Risposta vuota dal server'
          setError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage }
        }

        if (text.trimStart().startsWith('<')) {
          const errorMessage = response.ok
            ? 'Risposta non valida dal server'
            : `Errore ${response.status}`
          setError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage }
        }

        let result: { success?: boolean; error?: string; message?: string }
        try {
          result = JSON.parse(text)
        } catch {
          setError(new Error('Risposta non valida dal server'))
          logger.error('Error sending communication', null, { communicationId: id })
          return { success: false, error: 'Risposta non valida dal server' }
        }

        if (!response.ok) {
          const errorMessage = result.error || result.message || 'Failed to send communication'
          setError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage }
        }

        if (!result.success) {
          const errorMessage = result.message || result.error || 'Failed to send communication'
          setError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage, message: result.message }
        }

        // Refresh lista
        await fetchCommunications()

        return { success: true, message: result.message }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        logger.error('Error sending communication', error, { communicationId: id })
        return { success: false, error: error.message }
      }
    },
    [fetchCommunications],
  )

  // Reset comunicazione bloccata (riporta a draft)
  const resetCommunication = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)

        // Workaround necessario per inferenza tipo Supabase
        const { error: updateError } =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('communications') as any)
            .update({ status: 'draft' } as Record<string, unknown>)
            .eq('id', id)
            .in('status', ['sending', 'failed'])

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Refresh lista
        await fetchCommunications()

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        logger.error('Error resetting communication', error, { communicationId: id })
        return false
      }
    },
    [fetchCommunications],
  )

  // Cancella comunicazione programmata
  const cancelCommunication = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)

        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('communications') as any)
          .update({ status: 'cancelled' } as Record<string, unknown>)
          .eq('id', id)
          .in('status', ['draft', 'scheduled'])

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Refresh lista
        await fetchCommunications()

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        logger.error('Error cancelling communication', error, { communicationId: id })
        return false
      }
    },
    [fetchCommunications],
  )

  // Effetto per fetch iniziale e auto-refresh
  useEffect(() => {
    fetchCommunications()

    if (options.autoRefresh) {
      const interval = setInterval(() => {
        fetchCommunications()
      }, 90 * 1000) // Refresh ogni 90 secondi (evita aggiornamenti troppo frequenti)

      return () => clearInterval(interval)
    }

    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.status, options.type, options.limit, options.offset, options.autoRefresh])

  return {
    communications,
    totalCount,
    loading,
    error,
    fetchCommunications,
    fetchCommunicationById,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    sendCommunication,
    resetCommunication,
    cancelCommunication,
  }
}
