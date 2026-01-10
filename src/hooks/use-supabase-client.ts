/**
 * @fileoverview Hook stabile per client Supabase
 * @description Ritorna un client Supabase stabile per sessione, evitando ricreazioni non necessarie
 * @module hooks/use-supabase-client
 */

'use client'

import { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

/**
 * Hook che ritorna un client Supabase stabile per sessione
 * Il client viene creato una sola volta e riutilizzato per tutta la durata del componente
 *
 * @returns Client Supabase stabile
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
  // useRef garantisce che il client sia creato una sola volta e riutilizzato
  // anche se il componente viene ri-renderizzato
  const clientRef = useRef<SupabaseClient<Database> | null>(null)

  if (!clientRef.current) {
    clientRef.current = createClient()
  }

  return clientRef.current
}
