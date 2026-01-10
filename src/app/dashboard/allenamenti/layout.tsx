import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Allenamenti | 22Club Dashboard',
  description:
    'Monitora, gestisci e analizza le sessioni di allenamento dei tuoi atleti. Dashboard con statistiche real-time, filtri avanzati ed export dati.',
  keywords: [
    'allenamenti',
    'workout tracking',
    'fitness management',
    'personal training',
    '22club',
    'dashboard allenamenti',
  ],
  openGraph: {
    title: 'Gestione Allenamenti | 22Club',
    description:
      'Dashboard completa per il monitoraggio degli allenamenti degli atleti con statistiche in tempo reale.',
    type: 'website',
  },
}

export default function AllenamentiLayout({ children }: { children: React.ReactNode }) {
  return children
}
