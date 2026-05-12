import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '22Club',
  description: 'Accedi a 22Club per gestire allenamenti, appuntamenti e profilo.',
}

export default function HomePage() {
  redirect('/login')
}
