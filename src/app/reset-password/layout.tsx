import type { Metadata } from 'next'
import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

export const metadata: Metadata = {
  title: 'Reimposta password | 22Club',
  description: 'Imposta una nuova password per il tuo account 22Club.',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <NonHomeViewportShell>{children}</NonHomeViewportShell>
}
