import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impostazioni | 22Club Dashboard',
  description:
    'Gestisci le tue preferenze, profilo e configurazioni account dalla dashboard 22Club.',
}

export default function ImpostazioniLayout({ children }: { children: React.ReactNode }) {
  return children
}
