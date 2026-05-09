/**
 * Errori Supabase quando `SUPABASE_SERVICE_ROLE_KEY` è sbagliata, troncata,
 * di un altro progetto, o coincide per errore con l'anon key.
 */
export function isServiceRoleOrStorageKeyErrorMessage(message: string | undefined): boolean {
  if (!message) return false
  const m = message.toLowerCase()
  return (
    m.includes('invalid api key') ||
    m.includes('invalid compact jws') ||
    (m.includes('jwt') && (m.includes('invalid') || m.includes('malformed')))
  )
}

export const SERVICE_ROLE_KEY_CONFIG_ERROR_IT =
  'SUPABASE_SERVICE_ROLE_KEY non valida o di un altro progetto. In Supabase: Settings → API → copia il secret "service_role" (non l\'anon key) per lo stesso progetto di NEXT_PUBLIC_SUPABASE_URL. In .env.local senza virgolette e senza spazi a inizio/fine. Poi riavvia il server.'
