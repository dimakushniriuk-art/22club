/**
 * @fileoverview Hook stabile per client Supabase
 * @description Ritorna un client Supabase stabile per sessione, evitando ricreazioni non necessarie
 * @module hooks/use-supabase-client
 */

'use client'

import { supabase } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

/**
 * Hook che ritorna un client Supabase stabile per sessione (singleton)
 *
 * @returns Client Supabase singleton (tipizzato con Database)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const supabase = useSupabaseClient()
 *
 *   useEffect(() => {
 *     supabase.from('table').select('*').then(...)
 *   }, [])
 * }
 * ```
 */
export function useSupabaseClient(): SupabaseClient<Database> {
  return supabase
}
