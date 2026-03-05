import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clienti | 22Club Dashboard',
  description:
    'Gestisci i tuoi atleti, monitora i progressi e le iscrizioni dalla dashboard clienti 22Club.',
}

export default function ClientiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
