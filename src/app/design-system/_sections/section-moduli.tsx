'use client'

import { ChevronRight, LayoutGrid } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

const cardFrameClass =
  'overflow-hidden !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

const variantBg: Record<string, string> = {
  default: '#1A1A1A',   // Rich Black
  elevated: '#212121',  // Material Black
  outlined: '#000000',  // Pure Black
  athlete: '#36454F',   // Charcoal
  trainer: '#343434',   // Jet Black
  admin: '#1A1A1A',     // Rich Black
  glass: '#212121',     // Material Black
}

export function SectionModuli() {
  return (
    <section id="moduli" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <LayoutGrid className="h-6 w-6 text-primary" />
        Moduli (Card)
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Componente <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">Card</code> e sotto-componenti (Header, Title, Description, Content, Footer). Riempimento unico e bordo con sfumatura. Varianti: default, elevated, outlined, athlete, trainer, admin, glass. Prop <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">hoverable</code>.
      </p>
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Varianti Card</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card variant="default" className={cardFrameClass} hoverable style={{ backgroundColor: variantBg.default }}>
              <CardHeader>
                <CardTitle>default</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Hoverable. Base dashboard/app.</p>
              </CardContent>
            </Card>
            <Card variant="elevated" className={cardFrameClass} style={{ backgroundColor: variantBg.elevated }}>
              <CardHeader>
                <CardTitle>elevated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Ombra più marcata.</p>
              </CardContent>
            </Card>
            <Card variant="outlined" className={cardFrameClass} style={{ backgroundColor: variantBg.outlined }}>
              <CardHeader>
                <CardTitle>outlined</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Bordo evidenziato.</p>
              </CardContent>
            </Card>
            <Card variant="athlete" className={cardFrameClass} style={{ backgroundColor: variantBg.athlete }}>
              <CardHeader>
                <CardTitle>athlete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Pagine atleta /home/*.</p>
              </CardContent>
            </Card>
            <Card variant="trainer" className={cardFrameClass} style={{ backgroundColor: variantBg.trainer }}>
              <CardHeader>
                <CardTitle>trainer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Vista PT/trainer.</p>
              </CardContent>
            </Card>
            <Card variant="admin" className={cardFrameClass} style={{ backgroundColor: variantBg.admin }}>
              <CardHeader>
                <CardTitle>admin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Vista admin.</p>
              </CardContent>
            </Card>
            <Card variant="glass" className={cardFrameClass} style={{ backgroundColor: variantBg.glass }}>
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
          <div className="grid gap-6 sm:grid-cols-2">
            <Card variant="default" className={cardFrameClass}>
              <CardHeader padding="sm">
                <CardTitle size="sm">Title sm</CardTitle>
                <CardDescription>Descrizione default.</CardDescription>
              </CardHeader>
              <CardContent padding="sm">Content padding sm.</CardContent>
            </Card>
            <Card variant="default" className={cardFrameClass}>
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
          <Card variant="default" className={cardFrameClass}>
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
          <Card variant="default" className={`p-4 ${cardFrameClass}`} hoverable>
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
