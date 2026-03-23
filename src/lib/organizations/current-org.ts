/**
 * Consolidamento org_id: fonte canonica = profiles.org_id (esposta da auth /api/auth/context e useAuth).
 * - Nessun fallback implicito a default-org quando l’organizzazione è ignota.
 * - org_id_text / slug legacy: usare solo compatibilità esplicita (vedi isLegacyOrgText).
 */

/** Valore storico usato come placeholder; non va assunto come verità se manca il profilo. */
export const LEGACY_ORG_PLACEHOLDER = 'default-org' as const

/** True se assente, vuoto o pari al placeholder legacy (tipico da default Zod / vecchi form). */
export function isLegacyOrgText(value: string | null | undefined): boolean {
  if (value == null) return true
  const t = String(value).trim()
  return t === '' || t === LEGACY_ORG_PLACEHOLDER
}

/**
 * org_id dal profilo (Supabase profiles.org_id). Restituisce stringa non vuota o null.
 * Non interpreta org_id_text: passare solo il campo canonico.
 */
export function getCurrentOrgIdFromProfile(
  profile: { org_id?: string | null } | null | undefined,
): string | null {
  if (!profile || profile.org_id == null) return null
  const t = String(profile.org_id).trim()
  return t === '' ? null : t
}

/**
 * Risolve org per scrittura appuntamenti: prima il profilo, poi un org_id esplicito dal form
 * (ignora placeholder legacy sul form così il profilo vince su default Zod).
 */
export function resolveOrgIdForAppointmentWrite(input: {
  profileOrgId: string | null | undefined
  formOrgId?: string | null
}): string | null {
  const fromProfile = getCurrentOrgIdFromProfile({ org_id: input.profileOrgId })
  const raw = input.formOrgId?.trim() ?? null
  const fromForm = raw && !isLegacyOrgText(raw) ? raw : null
  return fromProfile ?? fromForm ?? null
}

/** org_id obbligatorio per operazioni che non possono procedere senza organizzazione. */
export function requireCurrentOrgId(
  orgId: string | null | undefined,
  message = 'Organizzazione non disponibile. Verifica il profilo (org_id) o contatta un amministratore.',
): string {
  const v = orgId?.trim()
  if (!v) {
    throw new Error(message)
  }
  return v
}

/**
 * Context minimale per write legacy-safe:
 * - org_id: canonico (profiles.org_id)
 * - org_id_text: derivato solo per compatibilità
 */
export function buildLegacyOrgWriteContext(input: {
  profile: { org_id?: string | null } | null | undefined
  message?: string
}): { org_id: string; org_id_text: string } {
  const orgId = requireCurrentOrgId(getCurrentOrgIdFromProfile(input.profile), input.message)
  return {
    org_id: orgId,
    org_id_text: orgId,
  }
}
