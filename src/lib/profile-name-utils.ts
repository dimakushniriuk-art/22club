// 👤 Profile Name Utilities — 22Club
// Risolve naming confusion tra nome/cognome e first_name/last_name (P4-011)

/**
 * Interfaccia per nome completo profilo
 */
export interface ProfileFullName {
  firstName: string
  lastName: string
  fullName: string
}

/**
 * Estrae nome completo da profilo gestendo sia nome/cognome che first_name/last_name
 * Priorità: nome/cognome > first_name/last_name
 */
export function getProfileFullName(profile: {
  nome?: string | null
  cognome?: string | null
  first_name?: string | null
  last_name?: string | null
}): ProfileFullName {
  const firstName = (profile.nome || profile.first_name || '').trim()
  const lastName = (profile.cognome || profile.last_name || '').trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Utente'

  return {
    firstName,
    lastName,
    fullName,
  }
}

/**
 * Normalizza profilo sincronizzando nome/cognome con first_name/last_name
 * Se nome/cognome esiste, copia in first_name/last_name
 * Se first_name/last_name esiste ma nome/cognome no, copia in nome/cognome
 */
export function normalizeProfileNames(profile: {
  nome?: string | null
  cognome?: string | null
  first_name?: string | null
  last_name?: string | null
}): {
  nome: string | null
  cognome: string | null
  first_name: string | null
  last_name: string | null
} {
  const nome = profile.nome || profile.first_name || null
  const cognome = profile.cognome || profile.last_name || null
  const first_name = profile.first_name || profile.nome || null
  const last_name = profile.last_name || profile.cognome || null

  return {
    nome,
    cognome,
    first_name,
    last_name,
  }
}

/**
 * Formatta nome per visualizzazione
 */
export function formatProfileName(
  profile: {
    nome?: string | null
    cognome?: string | null
    first_name?: string | null
    last_name?: string | null
  },
  format: 'full' | 'first' | 'last' | 'initials' = 'full',
): string {
  const { firstName, lastName, fullName } = getProfileFullName(profile)

  switch (format) {
    case 'full':
      return fullName
    case 'first':
      return firstName
    case 'last':
      return lastName
    case 'initials':
      return [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'U'
    default:
      return fullName
  }
}
