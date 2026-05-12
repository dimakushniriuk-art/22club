export function formatStaffAthleteDisplayName(athlete: {
  nome?: string | null
  cognome?: string | null
}): string {
  return [athlete.nome, athlete.cognome].filter(Boolean).join(' ').trim()
}

export function staffAthleteProgressTabBackHref(profileId: string): string {
  return `/dashboard/atleti/${profileId}?tab=progressi`
}

export function staffAthleteProgressBasePath(profileId: string): string {
  return `/dashboard/atleti/${profileId}/progressi`
}
