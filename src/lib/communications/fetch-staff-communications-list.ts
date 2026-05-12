import { apiGet } from '@/lib/api-client'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'

type CommunicationRow = Tables<'communications'>
export type StaffCommunicationListItem = CommunicationRow

export type StaffCommunicationsListFilters = {
  status?: CommunicationRow['status'] | CommunicationRow['status'][]
  type?: CommunicationRow['type']
  limit?: number
  offset?: number
}

export type StaffCommunicationsListResult = {
  communications: StaffCommunicationListItem[]
  count: number
}

export async function fetchStaffCommunicationsList(
  filters: StaffCommunicationsListFilters,
): Promise<StaffCommunicationsListResult> {
  const queryParams: Record<string, string> = {}
  if (filters.status) {
    queryParams.status = Array.isArray(filters.status)
      ? filters.status.join(',')
      : filters.status
  }
  if (filters.type) queryParams.type = filters.type
  if (filters.limit) queryParams.limit = filters.limit.toString()
  if (filters.offset !== undefined) queryParams.offset = filters.offset.toString()

  return apiGet<{ communications: StaffCommunicationListItem[]; count: number }>(
    '/api/communications/list',
    queryParams,
    async (): Promise<StaffCommunicationsListResult> => {
      let query = supabase
        .from('communications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status)
        } else {
          query = query.eq('status', filters.status)
        }
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters.limit) {
        if (filters.offset !== undefined) {
          query = query.range(filters.offset, filters.offset + filters.limit - 1)
        } else {
          query = query.limit(filters.limit)
        }
      }

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        throw new Error(fetchError.message || String(fetchError))
      }

      return {
        communications: (data || []) as StaffCommunicationListItem[],
        count: count ?? 0,
      }
    },
  )
}
