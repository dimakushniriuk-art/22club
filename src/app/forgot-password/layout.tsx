import type { Metadata } from 'next'
import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

export const metadata: Metadata = {
  title: 'Password dimenticata | 22Club',
  description: 'Recupera l’accesso al tuo account 22Club con il link inviato via email.',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <NonHomeViewportShell>{children}</NonHomeViewportShell>
}
