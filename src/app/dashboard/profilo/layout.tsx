import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profilo | 22Club Dashboard',
  description: 'Gestisci il tuo profilo, notifiche e impostazioni dalla dashboard 22Club.',
}

export default function ProfiloLayout({ children }: { children: React.ReactNode }) {
  return children
}
