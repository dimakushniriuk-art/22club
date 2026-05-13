import type {
  AnamnesiState,
  LiberatoriaState,
  ManlevaState,
  ProfileRow,
} from '@/features/welcome-onboarding/types'

export type WelcomeQuestionnaireRow = {
  anamnesi?: unknown
  manleva?: unknown
  liberatoria_media?: unknown
}

export function mapWelcomeQuestionnaireRow(qRow: WelcomeQuestionnaireRow | null | undefined): {
  anamnesi: Partial<AnamnesiState>
  manleva: Partial<ManlevaState>
  liberatoria: Partial<LiberatoriaState>
} | null {
  if (!qRow) return null

  const anamnesi = (qRow.anamnesi as Partial<AnamnesiState>) ?? {}
  const manleva = (qRow.manleva as Partial<ManlevaState>) ?? {}
  const liberatoriaRaw = (qRow.liberatoria_media as Record<string, unknown>) ?? {}
  const authorized =
    liberatoriaRaw.authorized !== undefined
      ? !!liberatoriaRaw.authorized
      : liberatoriaRaw.autorizzazione !== undefined
        ? !!liberatoriaRaw.autorizzazione
        : undefined
  const channelsRaw = liberatoriaRaw.channels
  const channels = Array.isArray(channelsRaw)
    ? channelsRaw.filter((x): x is string => typeof x === 'string')
    : typeof liberatoriaRaw.canali_consentiti === 'string' && liberatoriaRaw.canali_consentiti
      ? [liberatoriaRaw.canali_consentiti]
      : []
  const duration =
    ((liberatoriaRaw.duration ?? liberatoriaRaw.durata) as
      | LiberatoriaState['duration']
      | undefined) ?? undefined
  const place = (liberatoriaRaw.place ?? liberatoriaRaw.luogo ?? '') as string
  const firma = (liberatoriaRaw.signature_text ?? liberatoriaRaw.firma_nome_cognome ?? '') as string

  return {
    anamnesi,
    manleva,
    liberatoria: {
      ...(authorized !== undefined ? { authorized } : {}),
      ...(channels.length ? { channels } : {}),
      ...(duration ? { duration } : {}),
      ...(place ? { place } : {}),
      ...(firma ? { firma_nome_cognome: firma } : {}),
    },
  }
}

export function mapProfileConsentDefaults(row: ProfileRow): {
  manleva: Partial<ManlevaState>
  liberatoria: Partial<LiberatoriaState>
} {
  const nomeCognome = [row.nome, row.cognome].filter(Boolean).join(' ').trim()
  const residenzaStr = [row.indirizzo_residenza, row.cap, row.citta, row.provincia]
    .filter(Boolean)
    .join(', ')

  return {
    manleva: {
      nome_cognome: nomeCognome,
      data_nascita: row.data_nascita ?? '',
      residenza: residenzaStr,
      firma_nome_cognome: nomeCognome,
    },
    liberatoria: {
      firma_nome_cognome: nomeCognome,
    },
  }
}
