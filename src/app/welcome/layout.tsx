import type { Metadata } from 'next'
import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

export const metadata: Metadata = {
  title: 'Benvenuto | 22Club',
  description: 'Scopri come usare 22Club e chi è il tuo Personal Trainer.',
}

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <NonHomeViewportShell>{children}</NonHomeViewportShell>
}
