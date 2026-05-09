'use client'

import { useState } from 'react'
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  Layers,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { PageHeaderGlass } from '@/components/layout'
import { MetricCard } from '@/components'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import {
  DashboardColumnEmpty,
  DashboardColumnListSkeleton,
  DashboardColumnPanel,
  DASHBOARD_LIST_SCROLL_CLASS,
  DASHBOARD_ROW_LINK_CLASS,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import {
  DS_BLOCK_TITLE_CLASS,
  DS_CARD_FRAME_CLASS,
  DS_LABEL_CLASS,
  DS_SECTION_INTRO_CLASS,
  DS_SECTION_TITLE_CLASS,
} from './helpers'

export function PatternsComposition() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <section id="patterns" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Layers className="h-6 w-6 text-primary" />
        03 — Patterns
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Strutture riutilizzabili: solo composizione di componenti già definiti (nessun nuovo
        componente UI). Layout flex/colonne responsive come nel prodotto.
      </p>

      <div className="flex min-w-0 flex-col gap-10 sm:gap-12">
        {/* 1. Dashboard */}
        <div className="min-w-0 space-y-3">
          <h3 className={DS_BLOCK_TITLE_CLASS}>Pattern / Dashboard / Base</h3>
          <p className={DS_LABEL_CLASS}>
            PageHeader + riga KPI (MetricCard) + griglia colonne (DashboardColumnPanel). Base per
            dashboard, home staff, overview.
          </p>
          <div className={`${DS_CARD_FRAME_CLASS} flex min-w-0 flex-col gap-4 sm:gap-5`}>
            <PageHeaderGlass
              title="Overview"
              subtitle="Esempio struttura"
              icon={<BarChart3 className="h-6 w-6 text-primary" />}
            />
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Totale"
                value={128}
                icon={<Users className="h-5 w-5" />}
                tone="teal"
                variant="glass"
              />
              <MetricCard
                label="Attivi"
                value={94}
                icon={<Activity className="h-5 w-5" />}
                tone="emerald"
                variant="glass"
              />
              <MetricCard
                label="In scadenza"
                value={12}
                icon={<TrendingUp className="h-5 w-5" />}
                tone="amber"
                variant="glass"
              />
              <MetricCard
                label="Incassi"
                value="€ 4.2k"
                icon={<CreditCard className="h-5 w-5" />}
                tone="blue"
                variant="glass"
              />
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(40vh,360px)]">
                <DashboardColumnPanel title="Colonna A" badge={3}>
                  <ul className={DASHBOARD_LIST_SCROLL_CLASS}>
                    {['Voce uno', 'Voce due', 'Voce tre'].map((t) => (
                      <li key={t}>
                        <div className={DASHBOARD_ROW_LINK_CLASS}>
                          <span className="text-sm font-medium text-text-primary">{t}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DashboardColumnPanel>
              </div>
              <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(40vh,360px)]">
                <DashboardColumnPanel title="Colonna B" badge={0}>
                  <DashboardColumnEmpty>Nessun elemento in questa colonna.</DashboardColumnEmpty>
                </DashboardColumnPanel>
              </div>
              <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(40vh,360px)]">
                <DashboardColumnPanel title="Colonna C">
                  <DashboardColumnListSkeleton />
                </DashboardColumnPanel>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Table page */}
        <div className="min-w-0 space-y-3">
          <h3 className={DS_BLOCK_TITLE_CLASS}>Pattern / Table / Base</h3>
          <p className={DS_LABEL_CLASS}>
            PageHeader + filtri (Input + Button) + pannello con tabella, empty e paginazione
            (Button). Base per abbonamenti, pagamenti, clienti.
          </p>
          <div className={`${DS_CARD_FRAME_CLASS} flex min-w-0 flex-col gap-4`}>
            <PageHeaderGlass
              title="Elenco"
              subtitle="Filtri e tabella"
              icon={<Users className="h-6 w-6 text-primary" />}
            />
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-xs">
                <Label htmlFor="pattern-table-search">Cerca</Label>
                <Input id="pattern-table-search" placeholder="Nome o email…" />
              </div>
              <Button variant="secondary" className="w-full shrink-0 gap-2 sm:w-auto">
                <Filter className="h-4 w-4" />
                Filtri
              </Button>
              <Button variant="primary" className="w-full shrink-0 gap-2 sm:w-auto">
                <Search className="h-4 w-4" />
                Cerca
              </Button>
            </div>
            <DashboardColumnPanel title="Risultati" badge={2}>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
                <div className="min-w-0 overflow-x-auto rounded-lg border border-white/5">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Rossi Marco</TableCell>
                        <TableCell>Attivo</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Apri
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Bianchi Laura</TableCell>
                        <TableCell>In attesa</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Apri
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-text-muted">1–10 di 48</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" aria-label="Pagina precedente">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" aria-label="Pagina successiva">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DashboardColumnPanel>
            <DashboardColumnPanel title="Stesso schema, lista vuota">
              <DashboardColumnEmpty>Nessun risultato con i filtri attuali.</DashboardColumnEmpty>
            </DashboardColumnPanel>
          </div>
        </div>

        {/* 3. Detail drawer */}
        <div className="min-w-0 space-y-3">
          <h3 className={DS_BLOCK_TITLE_CLASS}>Pattern / Detail / Drawer</h3>
          <p className={DS_LABEL_CLASS}>
            Drawer + header + sezioni Card + azioni footer. Base per dettaglio atleta, pagamento,
            abbonamento.
          </p>
          <div className={DS_CARD_FRAME_CLASS}>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Apri drawer dettaglio
            </Button>
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} side="right" size="md">
              <DrawerContent onClose={() => setDrawerOpen(false)}>
                <DrawerHeader>Dettaglio record</DrawerHeader>
                <DrawerBody className="flex min-h-0 flex-col gap-4">
                  <Card variant="default" className="border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle size="sm">Riepilogo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-text-secondary">
                      <p>Campo: valore esempio</p>
                      <p>Aggiornato: oggi</p>
                    </CardContent>
                  </Card>
                  <Card variant="default" className="border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle size="sm">Note</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-text-secondary">
                      Testo sezione secondaria.
                    </CardContent>
                  </Card>
                </DrawerBody>
                <DrawerFooter>
                  <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                    Chiudi
                  </Button>
                  <Button variant="primary" onClick={() => setDrawerOpen(false)}>
                    Salva
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* 4. Form dialog */}
        <div className="min-w-0 space-y-3">
          <h3 className={DS_BLOCK_TITLE_CLASS}>Pattern / Form / Base</h3>
          <p className={DS_LABEL_CLASS}>
            Dialog (modale) + campi form + footer azioni. Base per creazione, modifica, onboarding.
          </p>
          <div className={DS_CARD_FRAME_CLASS}>
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Apri form (dialog)
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuovo elemento</DialogTitle>
                  <DialogDescription>Compila i campi e conferma.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pattern-form-name">Nome</Label>
                    <Input id="pattern-form-name" placeholder="Nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pattern-form-email">Email</Label>
                    <Input id="pattern-form-email" type="email" placeholder="email@esempio.it" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button variant="primary" onClick={() => setDialogOpen(false)}>
                    Salva
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 5. Empty + loading */}
        <div className="min-w-0 space-y-3">
          <h3 className={DS_BLOCK_TITLE_CLASS}>Pattern / States / Skeleton list empty</h3>
          <p className={DS_LABEL_CLASS}>
            Stesso pannello colonna: skeleton → lista → empty. Gestione stati coerente.
          </p>
          <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
            <DashboardColumnPanel title="Loading">
              <DashboardColumnListSkeleton />
            </DashboardColumnPanel>
            <DashboardColumnPanel title="Con dati" badge={2}>
              <ul className={DASHBOARD_LIST_SCROLL_CLASS}>
                {['Elemento A', 'Elemento B'].map((t) => (
                  <li key={t}>
                    <div className={DASHBOARD_ROW_LINK_CLASS}>
                      <span className="text-sm text-text-primary">{t}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </DashboardColumnPanel>
            <DashboardColumnPanel title="Vuoto">
              <DashboardColumnEmpty>Nessun dato da mostrare.</DashboardColumnEmpty>
            </DashboardColumnPanel>
          </div>
        </div>
      </div>
    </section>
  )
}
