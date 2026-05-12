export const MARKETING_LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  trial: 'Prova',
  converted: 'Convertito',
  lost: 'Perso',
}

export const MARKETING_LEAD_PIPELINE_STATUSES = [
  'new',
  'contacted',
  'trial',
  'converted',
  'lost',
] as const

export const MARKETING_LEAD_PIPELINE_MOVABLE_STATUSES = [
  'new',
  'contacted',
  'trial',
  'lost',
] as const

export const MARKETING_FUNNEL_LABELS: Record<string, string> = {
  new: 'Nuovi',
  contacted: 'Contattati',
  trial: 'Trial',
  converted: 'Convertiti',
  lost: 'Persi',
}

export const MARKETING_CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: 'Bozza',
  active: 'Attiva',
  paused: 'In pausa',
  ended: 'Terminata',
}

export const MARKETING_CAMPAIGN_CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  social: 'Social',
  web: 'Web',
  other: 'Altro',
}

export const MARKETING_AUTOMATION_ACTION_LABELS: Record<string, string> = {
  create_campaign_suggestion: 'Suggerimento campagna',
  log_event: 'Log evento',
  tag_leads: 'Tag lead',
}
