'use client'

import { LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui'
import { Button, Input, Label } from '@/components/ui'

const cardFrameClass =
  'overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

export function PatternsLayouts() {
  return (
    <section id="layouts" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <LayoutGrid className="h-6 w-6 text-primary" />
        Layouts
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Esempi di layout: section, lista, form. Componenti e spacing da token.
      </p>
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">
            Section (titolo + contenuto)
          </h3>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-text-primary">Titolo sezione</h4>
            <p className="text-sm text-text-secondary">
              Contenuto della sezione. Padding e radius da token.
            </p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Lista (card ripetute)</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="default" className={cardFrameClass}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">Elemento {i}</span>
                  <span className="text-xs text-text-muted">Dettaglio</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Form (label + input)</h3>
          <Card variant="default" className={cardFrameClass}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Inserisci nome" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@esempio.it" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm">
                  Annulla
                </Button>
                <Button variant="primary" size="sm">
                  Salva
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
