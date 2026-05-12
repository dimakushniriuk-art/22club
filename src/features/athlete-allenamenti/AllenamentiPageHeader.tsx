'use client'

import { PageHeaderFixed } from '@/components/layout'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { cn } from '@/lib/utils'

interface AllenamentiPageHeaderProps {
  title?: string
  subtitle?: string
  onBack: () => void
  /** Se true aggiunge mb-4. Default false. */
  withBottomMargin?: boolean
}

const DEFAULT_TITLE = 'I miei Allenamenti'
const DEFAULT_SUBTITLE = 'Programma e monitora i tuoi progressi'

export function AllenamentiPageHeader({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  onBack,
  withBottomMargin = false,
}: AllenamentiPageHeaderProps) {
  const { isPreview } = useAthleteAllenamentiPaths()
  return (
    <PageHeaderFixed
      variant="chat"
      title={title}
      subtitle={isPreview ? undefined : subtitle}
      onBack={onBack}
      embedStatic={isPreview}
      className={cn(withBottomMargin && !isPreview && 'mb-4')}
    />
  )
}
