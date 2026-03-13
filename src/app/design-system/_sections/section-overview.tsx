'use client'

import { Palette, Type, Square, Zap, Sparkles, Box, LayoutGrid, Layout, Globe, Home, LogIn } from 'lucide-react'
import Link from 'next/link'
import { DS_CARD_FRAME_CLASS } from './helpers'

const BLOCKS = [
  {
    title: 'Fondazioni',
    description: 'Colori, tipografia, spacing, motion e icone. Base visiva dell’interfaccia.',
    links: [
      { href: '#colori', label: 'Colori', icon: Palette },
      { href: '#tipografia', label: 'Tipografia', icon: Type },
      { href: '#radius', label: 'Radius & Spacing', icon: Square },
      { href: '#motion', label: 'Motion', icon: Zap },
      { href: '#icone', label: 'Icone', icon: Sparkles },
    ],
  },
  {
    title: 'Componenti',
    description: 'Elementi UI riutilizzabili: Button, Card, Input, Badge, Tabs, Dialog, Table.',
    links: [
      { href: '#componenti', label: 'Componenti', icon: Box },
      { href: '#moduli', label: 'Moduli (Card)', icon: LayoutGrid },
    ],
  },
  {
    title: 'Pattern',
    description: 'Layout e header condivisi tra le pagine.',
    links: [
      { href: '#layouts', label: 'Layouts', icon: Layout },
      { href: '#headers', label: 'Headers', icon: Layout },
    ],
  },
  {
    title: 'Aree prodotto',
    description: 'Pattern e elementi specifici per Auth, Area atleta e Dashboard.',
    links: [
      { href: '#aree-route', label: 'Mappa route', icon: Globe },
      { href: '#home', label: 'Area atleta', icon: Home },
      { href: '#auth', label: 'Auth', icon: LogIn },
    ],
  },
]

export function SectionOverview() {
  return (
    <section id="overview" className="scroll-mt-24">
      <h2 className="mb-2 text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
        22Club Design System
      </h2>
      <p className="mb-6 sm:mb-8 text-xs sm:text-sm text-text-secondary">
        Riferimento unico per colori, tipografia, componenti e pattern dell’app. Usa le fondazioni e i componenti in modo coerente in tutte le aree (pubbliche, atleta, dashboard).
      </p>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BLOCKS.map((block) => (
          <div key={block.title} className={`${DS_CARD_FRAME_CLASS} border-l-4 border-l-primary/50`}>
            <h3 className="mb-1.5 text-sm font-semibold text-text-primary">{block.title}</h3>
            <p className="mb-3 sm:mb-4 text-xs text-text-secondary leading-relaxed">{block.description}</p>
            <ul className="space-y-1.5">
              {block.links.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
