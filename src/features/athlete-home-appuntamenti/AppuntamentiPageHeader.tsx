'use client'

import { PageHeaderFixed } from '@/components/layout'

interface AppuntamentiPageHeaderProps {
  title?: string
  subtitle?: string
  onBack: () => void
}

const DEFAULT_TITLE = 'I miei Appuntamenti'
const DEFAULT_SUBTITLE = 'Visualizza i tuoi appuntamenti programmati'

export function AppuntamentiPageHeader({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  onBack,
}: AppuntamentiPageHeaderProps) {
  return <PageHeaderFixed variant="chat" title={title} subtitle={subtitle} onBack={onBack} />
}
