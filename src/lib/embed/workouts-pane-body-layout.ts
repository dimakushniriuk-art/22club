import { type ClassValue } from 'clsx'
import { cn } from '@/lib/utils'

/** Shell colonna /dashboard/workouts: niente `flex-1` che limita l’altezza al viewport. */
export function workoutsPaneEmbedRootClass(inPane: boolean): string {
  return cn('flex min-h-0 flex-col bg-background', inPane ? 'w-full flex-none' : 'flex-1')
}

type EmbedBodyOpts = {
  /** Vista allenamento “oggi” usa scroll verticale dedicato su mobile. */
  overflow?: 'y' | 'auto'
}

/**
 * Area sotto header allenamenti: in pane staff altezza naturale (`overflow-y-visible`);
 * fuori pane resta `flex-1` + scroll interno.
 */
export function workoutsPaneEmbedBodyClass(
  inPane: boolean,
  opts: EmbedBodyOpts | undefined,
  ...rest: ClassValue[]
): string {
  const mode = opts?.overflow ?? 'auto'
  return cn(
    'overflow-x-hidden',
    ...rest,
    inPane
      ? 'w-full min-w-0 flex-none overflow-y-visible'
      : cn('min-h-0 flex-1', mode === 'y' ? 'overflow-y-auto' : 'overflow-auto'),
  )
}
