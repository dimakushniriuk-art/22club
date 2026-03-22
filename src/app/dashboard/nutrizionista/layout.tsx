import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nutrizionista | 22Club Dashboard',
  description:
    'Area nutrizionista: gestisci clienti, chat, calendario e profilo dalla tua dashboard 22Club.',
}

export default function NutrizionistaLayout({ children }: { children: React.ReactNode }) {
  return children
}
