'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface RefreshButtonProps {
  /**
   * Funzione chiamata quando il pulsante viene cliccato
   */
  onRefresh: () => void

  /**
   * Se true, il pulsante è disabilitato e mostra animazione di loading
   */
  isLoading?: boolean

  /**
   * Label ARIA per accessibilità
   * @default "Ricarica dati"
   */
  ariaLabel?: string

  /**
   * Variante del pulsante
   * @default "outline"
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'default'

  /**
   * Dimensione del pulsante
   * @default "sm"
   */
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'

  /**
   * Mostra testo "Ricarica" accanto all'icona
   * @default true
   */
  showLabel?: boolean

  /**
   * Classi CSS aggiuntive
   */
  className?: string
}

/**
 * Componente standardizzato per refresh manuale dei dati
 *
 * Usa questo componente per aggiungere un pulsante di refresh
 * in tutte le pagine che necessitano di ricaricare dati manualmente.
 *
 * @example
 * ```tsx
 * <RefreshButton
 *   onRefresh={() => refetch()}
 *   isLoading={isLoading}
 *   ariaLabel="Ricarica appuntamenti"
 * />
 * ```
 */
export function RefreshButton({
  onRefresh,
  isLoading = false,
  ariaLabel = 'Ricarica dati',
  variant = 'outline',
  size = 'sm',
  showLabel = true,
  className,
}: RefreshButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onRefresh}
      disabled={isLoading}
      aria-label={ariaLabel}
      className={cn(className)}
    >
      <RefreshCw
        className={cn('h-4 w-4', isLoading && 'animate-spin', showLabel && 'mr-2')}
        aria-hidden="true"
      />
      {showLabel && 'Ricarica'}
    </Button>
  )
}
