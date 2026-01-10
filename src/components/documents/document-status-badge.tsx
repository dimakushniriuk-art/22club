'use client'

import type { ReactNode } from 'react'
import { Badge } from '@/components/ui'
import { CheckIcon, AlertTriangleIcon, XIcon } from '@/components/ui/professional-icons'
import { CheckCircle, Clock, XCircle, AlertTriangle, FileText } from 'lucide-react'

interface DocumentStatusBadgeProps {
  status: 'valido' | 'in_scadenza' | 'scaduto' | 'non_valido' | 'in-revisione'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DocumentStatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className = '',
}: DocumentStatusBadgeProps) {
  const getStatusConfig = (
    status: string,
  ): {
    variant: 'primary' | 'success' | 'warning' | 'neutral' | 'outline' | 'secondary'
    text: string
    icon: React.ReactNode
    tooltip: string
  } => {
    switch (status) {
      case 'valido':
        return {
          variant: 'success' as const,
          text: 'Valido',
          icon: <CheckCircle className="h-4 w-4" />,
          tooltip: 'Documento valido e in regola',
        }
      case 'in_scadenza':
        return {
          variant: 'warning' as const,
          text: 'In scadenza',
          icon: <Clock className="h-4 w-4" />,
          tooltip: 'Documento in scadenza entro 7 giorni',
        }
      case 'scaduto':
        return {
          variant: 'warning' as const,
          text: 'Scaduto',
          icon: <XCircle className="h-4 w-4" />,
          tooltip: 'Documento scaduto - carica nuovo file',
        }
      case 'non_valido':
        return {
          variant: 'warning' as const,
          text: 'Non valido',
          icon: <AlertTriangle className="h-4 w-4" />,
          tooltip: 'Documento segnalato come non valido dallo staff',
        }
      case 'in-revisione':
        return {
          variant: 'neutral' as const,
          text: 'In revisione',
          icon: <FileText className="h-4 w-4" />,
          tooltip: 'Documento in revisione dallo staff',
        }
      default:
        return {
          variant: 'neutral' as const,
          text: 'Sconosciuto',
          icon: <FileText className="h-4 w-4" />,
          tooltip: 'Stato sconosciuto',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={`${className} ${showIcon ? 'flex items-center gap-1' : ''}`}
      title={config.tooltip}
    >
      {showIcon && config.icon}
      {config.text}
    </Badge>
  )
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getDocumentStatusColor(status: string): string {
  switch (status) {
    case 'valido':
      return 'text-state-valid'
    case 'in_scadenza':
      return 'text-state-warn'
    case 'scaduto':
      return 'text-state-error'
    case 'non_valido':
      return 'text-state-error'
    default:
      return 'text-text-tertiary'
  }
}

export function getDocumentStatusIcon(status: string): ReactNode {
  switch (status) {
    case 'valido':
      return <CheckIcon size={14} className="text-green-400" />
    case 'in_scadenza':
      return <AlertTriangleIcon size={14} className="text-yellow-400" />
    case 'scaduto':
      return <XIcon size={14} className="text-red-400" />
    case 'non_valido':
      return <XIcon size={14} className="text-red-400" />
    default:
      return <XIcon size={14} className="text-gray-400" />
  }
}

export function getDocumentStatusText(status: string): string {
  switch (status) {
    case 'valido':
      return 'Valido'
    case 'in_scadenza':
      return 'In scadenza'
    case 'scaduto':
      return 'Scaduto'
    case 'non_valido':
      return 'Non valido'
    default:
      return 'Sconosciuto'
  }
}

export function isDocumentExpiring(expiresAt: string | null): boolean {
  if (!expiresAt) return false

  const expiryDate = new Date(expiresAt)
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= 7 && diffDays > 0
}

export function isDocumentExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false

  const expiryDate = new Date(expiresAt)
  const today = new Date()

  return expiryDate < today
}

export function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null

  const expiryDate = new Date(expiresAt)
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function getExpiryMessage(expiresAt: string | null): string {
  if (!expiresAt) return 'Senza scadenza'

  const days = getDaysUntilExpiry(expiresAt)

  if (days === null) return 'Senza scadenza'
  if (days < 0) return 'Scaduto'
  if (days === 0) return 'Scade oggi'
  if (days === 1) return 'Scade domani'
  if (days <= 7) return `Scade tra ${days} giorni`

  return `Scade tra ${days} giorni`
}
