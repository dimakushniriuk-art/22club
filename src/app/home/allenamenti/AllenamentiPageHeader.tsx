'use client'

import { PageHeaderFixed } from '@/components/layout'
import { Dumbbell } from 'lucide-react'

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
  return (
    <PageHeaderFixed
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      icon={<Dumbbell className="h-5 w-5 text-cyan-400" />}
      className={withBottomMargin ? 'mb-4' : undefined}
    />
  )
}
