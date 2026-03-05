import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Massaggiatore | 22Club Dashboard',
  description:
    'Area massaggiatore: gestisci clienti, chat, calendario e profilo dalla tua dashboard 22Club.',
}

export default function MassaggiatoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
