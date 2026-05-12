import type { Metadata } from 'next'
import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

export const metadata: Metadata = {
  title: 'Registrati | 22Club',
  description: 'Crea il tuo account atleta 22Club con il codice invito ricevuto dal club.',
}

export default function RegistratiLayout({ children }: { children: React.ReactNode }) {
  return <NonHomeViewportShell>{children}</NonHomeViewportShell>
}
