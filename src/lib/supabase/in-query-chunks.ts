/**
 * PostgREST: `.in('id', ids)` con centinaia/migliaia di valori può superare limiti URL o proxy;
 * anche insert multi-riga molto grandi possono superare limiti di body/gateway.
 * Usare chunk espliciti per batch `.in` e per `insert([...])` massicci.
 */

export const SUPABASE_IN_QUERY_CHUNK_SIZE = 150

export function chunkForSupabaseIn<T>(
  values: readonly T[],
  chunkSize: number = SUPABASE_IN_QUERY_CHUNK_SIZE,
): T[][] {
  if (values.length === 0) return []
  const out: T[][] = []
  for (let i = 0; i < values.length; i += chunkSize) {
    out.push(values.slice(i, i + chunkSize) as T[])
  }
  return out
}
