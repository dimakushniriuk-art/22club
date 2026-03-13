'use client'

import { ChevronRight, LayoutGrid } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'
import { DS_CARD_FRAME_CLASS, DS_CODE_CLASS, DS_SECTION_TITLE_CLASS, DS_SECTION_INTRO_CLASS } from './helpers'

export function SectionModuli() {
  return (
    <section id="moduli" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <LayoutGrid className="h-6 w-6 text-primary" />
        Moduli (Card)
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Componente <code className={DS_CODE_CLASS}>Card</code> e sotto-componenti (Header, Title, Description, Content, Footer). Riempimento unico e bordo con sfumatura. Varianti: default, elevated, outlined, athlete, trainer, admin, glass. Prop <code className={DS_CODE_CLASS}>hoverable</code>.
      </p>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Varianti Card</h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card variant="default" className={DS_CARD_FRAME_CLASS} hoverable>
              <CardHeader>
                <CardTitle>default</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Hoverable. Base dashboard/app.</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className={DS_CARD_FRAME_CLASS}>
              <CardHeader>
                <CardTitle>elevated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Ombra più marcata.</p>
              </CardContent>
            </Card>
            <Card variant="outlined" className={DS_CARD_FRAME_CLASS}>
              <CardHeader>
                <CardTitle>outlined</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Bordo evidenziato.</p>
              </CardContent>
            </Card>
            <Card variant="athlete" className={DS_CARD_FRAME_CLASS}>
              <CardHeader>
                <CardTitle>athlete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Pagine atleta /home/*.</p>
              </CardContent>
            </Card>
            <Card variant="trainer" className={DS_CARD_FRAME_CLASS}>
              <CardHeader>
                <CardTitle>trainer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Vista PT/trainer.</p>
              </CardContent>
            </Card>
            <Card variant="admin" className={DS_CARD_FRAME_CLASS}>
              <CardHeader>
                <CardTitle>admin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Vista admin.</p>
              </CardContent>
            </Card>
            <Card variant="glass" className={DS_CARD_FRAME_CLASS}>
              <CardHeader>
                <CardTitle>glass</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Header / overlay. Sfondo unico + bordo.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">CardHeader, CardTitle, CardDescription</h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <Card variant="default" className={DS_CARD_FRAME_CLASS}>
              <CardHeader padding="sm">
                <CardTitle size="sm">Title sm</CardTitle>
                <CardDescription>Descrizione default.</CardDescription>
              </CardHeader>
              <CardContent padding="sm">Content padding sm.</CardContent>
            </Card>
            <Card variant="default" className={DS_CARD_FRAME_CLASS}>
              <CardHeader padding="lg">
                <CardTitle size="lg">Title lg</CardTitle>
                <CardDescription variant="muted">Descrizione muted.</CardDescription>
              </CardHeader>
              <CardContent padding="lg">Content padding lg.</CardContent>
            </Card>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">CardFooter (justify)</h3>
          <Card variant="default" className={DS_CARD_FRAME_CLASS}>
            <CardHeader>
              <CardTitle>Card con footer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">Contenuto.</p>
            </CardContent>
            <CardFooter justify="between">
              <Button variant="ghost" size="sm">Annulla</Button>
              <Button variant="primary" size="sm">Salva</Button>
            </CardFooter>
          </Card>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Layout compatto (custom)</h3>
          <Card variant="default" className={DS_CARD_FRAME_CLASS} hoverable>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modulo compatto</p>
                <p className="text-sm text-text-secondary">Sottotitolo</p>
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
