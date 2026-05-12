export function formatMarketingDate(s: string | null | undefined): string {
  if (!s) return '–'
  return new Date(s).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMarketingDateTime(s: string | null | undefined): string {
  if (!s) return '–'
  return new Date(s).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
