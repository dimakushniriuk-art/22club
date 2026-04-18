import type { Metadata } from 'next'
import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

export const metadata: Metadata = {
  title: 'Accedi | 22Club',
  description: 'Accedi al tuo account 22Club per gestire allenamenti, appuntamenti e profilo.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <NonHomeViewportShell>{children}</NonHomeViewportShell>
}
