'use client'

import { LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui'
import { Button, Input, Label } from '@/components/ui'
import { DS_CARD_FRAME_CLASS, DS_SECTION_TITLE_CLASS, DS_SECTION_INTRO_CLASS, DS_BLOCK_TITLE_CLASS } from './helpers'

export function PatternsLayouts() {
  return (
    <section id="layouts" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <LayoutGrid className="h-6 w-6 text-primary" />
        Layouts
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Esempi di layout: section, lista, form. Componenti e spacing da token.
      </p>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>
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
          <h3 className={DS_BLOCK_TITLE_CLASS}>Lista (card ripetute)</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="default" className={DS_CARD_FRAME_CLASS}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">Elemento {i}</span>
                  <span className="text-xs text-text-muted">Dettaglio</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Form (label + input)</h3>
          <Card variant="default" className={DS_CARD_FRAME_CLASS}>
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
