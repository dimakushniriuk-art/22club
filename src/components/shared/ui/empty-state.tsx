/**
 * 🎨 Empty State Component - DK Design System
 *
 * Componente riutilizzabile per stati vuoti che segue il design system.
 *
 * @example
 * <EmptyState
 *   icon={Calendar}
 *   title="Nessun appuntamento"
 *   description="Non hai appuntamenti programmati per oggi."
 *   action={
 *     <Button variant="primary" onClick={onAdd}>
 *       <Plus className="mr-2 h-4 w-4" />
 *       Nuovo Appuntamento
 *     </Button>
 *   }
 * />
 */

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { dk } from '@/config/dkdesign'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  /**
   * Icona da mostrare (componente Lucide)
   */
  icon: LucideIcon

  /**
   * Titolo dello stato vuoto
   */
  title: string

  /**
   * Descrizione opzionale
   */
  description?: string

  /**
   * Azione opzionale (bottone o link)
   */
  action?: React.ReactNode

  /**
   * Variante del card (default: trainer)
   */
  variant?: 'trainer' | 'athlete' | 'default'

  /**
   * Dimensione icona (default: large)
   */
  iconSize?: 'small' | 'medium' | 'large'

  /**
   * Classi aggiuntive per il container
   */
  className?: string

  /**
   * Mostra il gradient overlay (default: true)
   */
  showGradient?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'trainer',
  iconSize = 'large',
  className,
  showGradient = true,
}: EmptyStateProps) {
  const iconSizes = {
    small: 'h-8 w-8 p-4',
    medium: 'h-10 w-10 p-5',
    large: 'h-12 w-12 p-6',
  }

  return (
    <Card variant={variant} className={cn('relative overflow-hidden', className)}>
      {showGradient && <div className={dk.card.gradientOverlay} />}

      <CardContent className={cn(dk.emptyState.container, 'relative')}>
        <div className={dk.emptyState.icon}>
          <div className={cn(dk.emptyState.iconWrapper, iconSizes[iconSize])}>
            <Icon
              className={cn(
                iconSize === 'small' && 'h-8 w-8',
                iconSize === 'medium' && 'h-10 w-10',
                iconSize === 'large' && 'h-12 w-12',
              )}
            />
          </div>
        </div>

        <h3 className={dk.emptyState.title}>{title}</h3>

        {description && <p className={dk.emptyState.description}>{description}</p>}

        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  )
}
