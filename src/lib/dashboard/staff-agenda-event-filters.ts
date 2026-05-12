export function isMassageAgendaEvent(description: string | undefined): boolean {
  const d = (description ?? '').toLowerCase()
  return d === 'massaggio' || d.includes('massaggio')
}

export function isNutritionAgendaEvent(description: string | undefined): boolean {
  const d = (description ?? '').toLowerCase()
  return d === 'nutrizionista' || d.includes('nutriz')
}
