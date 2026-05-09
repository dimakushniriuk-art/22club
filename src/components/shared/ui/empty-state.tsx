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

import type { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { dk } from '@/config/dkdesign'
import { cn } from '@/lib/utils'

type EmptyStateDensity = 'default' | 'compact' | 'inline'
type EmptyStateAlign = 'center' | 'left'
type EmptyStateSurface = 'card' | 'transparent' | 'subtle'

interface EmptyStateProps {
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
   * Mostra il gradient overlay (default: true). Ha effetto solo con `surface="card"`.
   */
  showGradient?: boolean

  /**
   * Densità verticale e tipografica (default: default — comportamento storico).
   */
  density?: EmptyStateDensity

  /**
   * Allineamento del blocco (default: center — comportamento storico).
   */
  align?: EmptyStateAlign

  /**
   * Contenitore visivo (default: card — comportamento storico).
   */
  surface?: EmptyStateSurface

  /**
   * Classi aggiuntive sul wrapper dell’icona (merge con token dk).
   */
  iconWrapperClassName?: string
}

const SUBTLE_SURFACE_CLASS =
  'overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

function emptyStateBody({
  Icon,
  iconSize,
  title,
  description,
  action,
  useDesignSystemTypography,
  density,
  align,
  iconWrapperClassName,
}: {
  Icon: LucideIcon
  iconSize: 'small' | 'medium' | 'large'
  title: string
  description?: string
  action?: ReactNode
  useDesignSystemTypography: boolean
  density: EmptyStateDensity
  align: EmptyStateAlign
  iconWrapperClassName?: string
}): ReactNode {
  const iconSizes = {
    small: 'h-8 w-8 p-4',
    medium: 'h-10 w-10 p-5',
    large: 'h-12 w-12 p-6',
  }

  const iconOuterClass = useDesignSystemTypography
    ? dk.emptyState.icon
    : cn(
        'flex',
        density === 'default' && 'mb-6',
        density === 'compact' && 'mb-4',
        density === 'inline' && 'mb-3',
        align === 'center' && 'justify-center',
        align === 'left' && 'justify-start',
      )

  const titleClass = useDesignSystemTypography
    ? dk.emptyState.title
    : cn(
        'text-text-primary mb-2 font-semibold',
        density === 'default' && 'text-xl',
        density === 'compact' && 'text-lg',
        density === 'inline' && 'text-base',
      )

  const descriptionClass = useDesignSystemTypography
    ? dk.emptyState.description
    : cn(
        'text-text-secondary mb-4 max-w-md',
        density === 'inline' ? 'text-xs' : 'text-sm',
        align === 'center' && 'mx-auto',
        align === 'left' && 'mr-auto',
      )

  const actionWrapClass = density === 'default' ? 'mt-6' : density === 'compact' ? 'mt-4' : 'mt-3'

  return (
    <>
      <div className={iconOuterClass}>
        <div className={cn(dk.emptyState.iconWrapper, iconSizes[iconSize], iconWrapperClassName)}>
          <Icon
            className={cn(
              iconSize === 'small' && 'h-8 w-8',
              iconSize === 'medium' && 'h-10 w-10',
              iconSize === 'large' && 'h-12 w-12',
            )}
          />
        </div>
      </div>

      <h3 className={titleClass}>{title}</h3>

      {description ? <p className={descriptionClass}>{description}</p> : null}

      {action ? <div className={actionWrapClass}>{action}</div> : null}
    </>
  )
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
  density = 'default',
  align = 'center',
  surface = 'card',
  iconWrapperClassName,
}: EmptyStateProps) {
  const isLegacyExactLayout = density === 'default' && align === 'center' && surface === 'card'

  const useDesignSystemTypography = density === 'default' && align === 'center'

  const showOverlay = surface === 'card' && showGradient

  const cardContentClassName = isLegacyExactLayout
    ? cn(dk.emptyState.container, 'relative')
    : cn(
        'relative px-4 sm:px-5',
        density === 'default' && 'py-16',
        density === 'compact' && 'py-10',
        density === 'inline' && 'py-6',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
      )

  const body = emptyStateBody({
    Icon,
    iconSize,
    title,
    description,
    action,
    useDesignSystemTypography,
    density,
    align,
    iconWrapperClassName,
  })

  if (surface === 'card') {
    return (
      <Card variant={variant} className={cn('relative overflow-hidden', className)}>
        {showOverlay ? <div className={dk.card.gradientOverlay} /> : null}

        <CardContent
          className={isLegacyExactLayout ? cardContentClassName : cn('p-0', cardContentClassName)}
        >
          {body}
        </CardContent>
      </Card>
    )
  }

  if (surface === 'subtle') {
    return (
      <div
        className={cn(
          'relative',
          SUBTLE_SURFACE_CLASS,
          align === 'center' && 'text-center',
          align === 'left' && 'text-left',
          className,
        )}
      >
        <div className={cn('relative', cardContentClassName)}>{body}</div>
      </div>
    )
  }

  /* surface === 'transparent' */
  return (
    <div
      className={cn(
        'relative',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      <div className={cn('relative', cardContentClassName)}>{body}</div>
    </div>
  )
}
