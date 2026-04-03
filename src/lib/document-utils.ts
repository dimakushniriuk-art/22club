// Nota: Document type potrebbe essere usato in futuro per type checking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Document } from '@/types/document'

export function getStatusColor(
  status: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido',
): 'primary' | 'success' | 'warning' | 'neutral' | 'outline' | 'secondary' {
  switch (status) {
    case 'valido':
      return 'success'
    case 'in_scadenza':
      return 'warning'
    case 'scaduto':
      return 'warning'
    case 'non_valido':
      return 'warning'
    case 'in-revisione':
      return 'neutral'
    default:
      return 'neutral'
  }
}

export function getStatusText(
  status: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido',
): string {
  switch (status) {
    case 'valido':
      return 'Valido'
    case 'in_scadenza':
      return 'In scadenza'
    case 'scaduto':
      return 'Scaduto'
    case 'non_valido':
      return 'Non valido'
    case 'in-revisione':
      return 'In revisione'
    default:
      return 'Sconosciuto'
  }
}

export function getStatusIcon(
  status: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido',
): string {
  switch (status) {
    case 'valido':
      return '✅'
    case 'in_scadenza':
      return '⚠️'
    case 'scaduto':
      return '❌'
    case 'non_valido':
      return '❌'
    case 'in-revisione':
      return '🔄'
    default:
      return '❓'
  }
}

export function getCategoryText(category: string | undefined): string {
  if (!category) return 'Non specificato'
  switch (category) {
    case 'certificato':
      return 'Certificato'
    case 'liberatoria':
      return 'Liberatoria'
    case 'contratto':
      return 'Contratto'
    case 'altro':
      return 'Altro'
    case 'referto':
      return 'Referto medico'
    case 'fattura':
      return 'Fattura'
    case 'dossier_onboarding':
    case 'onboarding':
      return 'Dossier onboarding'
    case 'nutrition_plan':
    case 'piano_nutrizionale':
    case 'diet_plan':
      return 'Piano nutrizionale'
    case 'allegato_chat':
      return 'Allegato chat'
    default:
      return category
  }
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDocumentDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
