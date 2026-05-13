'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'
import type { Json } from '@/lib/supabase/types'
import type { RecipientFilter } from '@/lib/communications/service'
import { createLogger } from '@/lib/logger'
import { fetchStaffCommunicationsList } from '@/lib/communications/fetch-staff-communications-list'
import { queryKeys } from '@/lib/query-keys'
import { invalidateStaffCommunicationsListQueries } from '@/lib/react-query/post-mutation-cache'

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

const STALE_MS = 90 * 1000

function communicationsStatusKey(status: UseCommunicationsOptions['status']): string {
  if (!status) return ''
  return Array.isArray(status) ? status.join(',') : status
}

export function useCommunications(options: UseCommunicationsOptions = {}) {
  const queryClient = useQueryClient()
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const statusKey = communicationsStatusKey(options.status)
  const queryKey = useMemo(
    () =>
      queryKeys.communications.staffList(statusKey, options.type, options.limit, options.offset),
    [statusKey, options.type, options.limit, options.offset],
  )

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchStaffCommunicationsList({
        status: options.status,
        type: options.type,
        limit: options.limit,
        offset: options.offset,
      }),
    staleTime: STALE_MS,
    refetchInterval: options.autoRefresh ? STALE_MS : false,
    placeholderData: (previous) => previous,
  })

  const communications = (listQuery.data?.communications ?? []) as Communication[]
  const totalCount = listQuery.data?.count ?? null
  const loading = listQuery.isPending
  const error =
    mutationError ??
    (listQuery.error instanceof Error
      ? listQuery.error
      : listQuery.error
        ? new Error(String(listQuery.error))
        : null)

  const fetchCommunications = useCallback(async () => {
    await invalidateStaffCommunicationsListQueries(queryClient)
  }, [queryClient])

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
        setMutationError(null)

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
        setMutationError(error)
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
        setMutationError(null)

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
        setMutationError(error)
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
        setMutationError(null)

        const { error: deleteError } = await supabase.from('communications').delete().eq('id', id)

        if (deleteError) {
          throw new Error(deleteError.message)
        }

        // Refresh lista
        await fetchCommunications()

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setMutationError(error)
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
        setMutationError(null)

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
          setMutationError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage }
        }

        if (text.trimStart().startsWith('<')) {
          const errorMessage = response.ok
            ? 'Risposta non valida dal server'
            : `Errore ${response.status}`
          setMutationError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage }
        }

        let result: { success?: boolean; error?: string; message?: string }
        try {
          result = JSON.parse(text)
        } catch {
          setMutationError(new Error('Risposta non valida dal server'))
          logger.error('Error sending communication', null, { communicationId: id })
          return { success: false, error: 'Risposta non valida dal server' }
        }

        if (!response.ok) {
          const errorMessage = result.error || result.message || 'Failed to send communication'
          setMutationError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage }
        }

        if (!result.success) {
          const errorMessage = result.message || result.error || 'Failed to send communication'
          setMutationError(new Error(errorMessage))
          logger.error('Error sending communication', null, { errorMessage, communicationId: id })
          return { success: false, error: errorMessage, message: result.message }
        }

        // Refresh lista
        await fetchCommunications()

        return { success: true, message: result.message }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setMutationError(error)
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
        setMutationError(null)

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
        setMutationError(error)
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
        setMutationError(null)

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
        setMutationError(error)
        logger.error('Error cancelling communication', error, { communicationId: id })
        return false
      }
    },
    [fetchCommunications],
  )

  // Effetto per fetch iniziale e auto-refresh
  // Lista gestita da React Query (`listQuery`).

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
