import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

/**
 * Query key (prefisso TanStack: match su query che iniziano con questa key) con refetch al focus.
 * Resto dell'app resta su refetchOnWindowFocus: false (default QueryProvider).
 */
const LIGHT_REFETCH_DEFAULTS: readonly (readonly string[])[] = [
  queryKeys.lightWindowFocus.clientiStats,
  queryKeys.lightWindowFocus.athleteAiData,
  queryKeys.lightWindowFocus.athleteAnagrafica,
  queryKeys.lightWindowFocus.paymentsLists,
] as const

/**
 * Da chiamare subito dopo `new QueryClient({ defaultOptions })`.
 */
export function applyLightRefetchOnWindowFocusDefaults(queryClient: QueryClient): void {
  for (const queryKey of LIGHT_REFETCH_DEFAULTS) {
    queryClient.setQueryDefaults(queryKey, {
      refetchOnWindowFocus: true,
    })
  }
}
