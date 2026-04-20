/**
 * Estrae l'id invito dalla risposta JSON delle RPC crea_invito_cliente / crea_invito_cliente_esterno.
 * Il payload reale dipende da Supabase; gestiamo varianti comuni.
 */
export function extractInvitoClienteIdFromRpcResult(data: unknown): string | null {
  if (data == null) return null
  let parsed: unknown = data
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data) as unknown
    } catch {
      return null
    }
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const o = parsed as Record<string, unknown>
  if (typeof o.invito_id === 'string' && o.invito_id.length > 0) return o.invito_id
  if (typeof o.id === 'string' && o.id.length > 0 && o.success === true) return o.id
  const nested = o.data
  if (nested && typeof nested === 'object') {
    const n = nested as Record<string, unknown>
    if (typeof n.invito_id === 'string' && n.invito_id.length > 0) return n.invito_id
    if (typeof n.id === 'string' && n.id.length > 0) return n.id
  }
  return null
}
