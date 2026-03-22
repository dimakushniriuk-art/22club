'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Box,
  Calendar,
  CircleDot,
  Dumbbell,
  Hand,
  Heart,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Palette,
  PanelTop,
  Smartphone,
  Square,
  User,
  Utensils,
} from 'lucide-react'
import { PageHeaderFixed } from '@/components/layout'
import {
  Button,
  Card,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Label,
  Progress,
  SimpleSelect,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { HOME_BLOCCHI_DATA, HOME_ICONS_DATA, RUOLI_CARD } from '@/lib/design-system-data'
import { cn } from '@/lib/utils'
import {
  DS_CARD_FRAME_CLASS,
  DS_CODE_CLASS,
  DS_SECTION_TITLE_CLASS,
  DS_SECTION_INTRO_CLASS,
  DS_BLOCK_TITLE_CLASS,
  DS_LABEL_CLASS,
  ColorSwatch,
} from './helpers'

export interface HomePageDesignItem {
  path: string
  label: string
  colori: string[]
  tipografia: string[]
  icone: string[]
  moduli: string[]
  radius: string[]
  spacing: string[]
}

export interface PathMetaItem {
  tokenTable: Array<{ token: string; value: string }>
  header?: 'glass' | 'compact'
  accent?: string
}

export interface AccentiAtletaItem {
  border: string
  bar: string
  label: string
  iconBg?: string
}

interface DesignHomeSectionProps {
  homePagesDesign: HomePageDesignItem[]
  pathMeta: Record<string, PathMetaItem>
  accentiAtleta: Record<string, AccentiAtletaItem>
  accentHex: Record<string, string>
  radiusPx: Record<string, string>
  iconByName: Record<string, LucideIcon>
}

const TOKEN_ICONS: Record<string, LucideIcon> = {
  Layout: LayoutDashboard,
  Container: Box,
  'Griglia blocchi': LayoutGrid,
  'Blocco (card)': Square,
  'Header Benvenuto': PanelTop,
  Breakpoint: Smartphone,
  Focus: CircleDot,
  'Header pagina': PanelTop,
  Accenti: Palette,
  Tabs: User,
  'Card / blocchi': LayoutGrid,
}

export function DesignHomeSection({ pathMeta, accentiAtleta, iconByName }: DesignHomeSectionProps) {
  const homeMeta = pathMeta['/home']
  const tealAccent = accentiAtleta['teal']
  const barHex = tealAccent?.bar ?? '#02b3bf'
  const _borderRgba = tealAccent?.border ?? 'rgba(2,179,191,0.4)'

  const baseTokenRows = homeMeta?.tokenTable ?? []
  const variantRows: Array<{ token: string; value: string }> = [
    {
      token: 'Header pagina',
      value:
        'Glass (primary), Compatto (primary) o Fisso nero + linea cyan (Allenamenti, Appuntamenti, Foto)',
    },
    { token: 'Accenti', value: 'teal, cyan, green, emerald, amber (barra sinistra e bordo card)' },
    { token: 'Tabs', value: 'Anagrafica, Medico, Fitness, Nutrizione, Massaggi (Profilo)' },
    {
      token: 'Card / blocchi',
      value: 'rounded-2xl o rounded-xl, bordo accento (no cornice bianca)',
    },
  ]
  const allTokenRows = [...baseTokenRows, ...variantRows]
  const tabsItems: { value: string; label: string; Icon: LucideIcon }[] = [
    { value: 'anagrafica', label: 'Anagrafica', Icon: User },
    { value: 'medica', label: 'Medico', Icon: Heart },
    { value: 'fitness', label: 'Fitness', Icon: Dumbbell },
    { value: 'nutrizione', label: 'Nutrizione', Icon: Utensils },
    { value: 'massaggio', label: 'Massaggi', Icon: Hand },
  ]
  const [dialogOpen, setDialogOpen] = useState(false)
  const selectOptions = [
    { value: 'referto', label: 'Referto medico' },
    { value: 'fattura', label: 'Fattura' },
    { value: 'dossier', label: 'Dossier onboarding' },
  ]

  return (
    <section id="home" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Home className="h-6 w-6 text-primary" />
        Design Home
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Token ed elementi per <code className={DS_CODE_CLASS}>/home/*</code>: header, accenti,
        blocchi griglia, tab profilo, card KPI, dialog, empty state.
      </p>

      <div className="space-y-6 sm:space-y-8">
        {/* Token — Base Design System (elementi grafici) */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Token area atleta</h3>
          <p className={DS_LABEL_CLASS}>Layout, header, accenti, tabs, card.</p>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allTokenRows.map((row, i) => {
              const Icon = TOKEN_ICONS[row.token] ?? Box
              return (
                <div
                  key={i}
                  className={`flex gap-3 p-4 ${DS_CARD_FRAME_CLASS} transition-colors hover:border-white/20`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{row.token}</p>
                    <p className={cn(DS_LABEL_CLASS, 'mt-1')}>{row.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Header Benvenuto */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Header Benvenuto</h3>
          <p className={DS_LABEL_CLASS}>Glass primary, solo su /home. Accento teal discreto.</p>
          <div className={cn('relative overflow-hidden p-4', DS_CARD_FRAME_CLASS)}>
            <div
              className="absolute inset-0 rounded-lg opacity-60"
              style={{
                background:
                  'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.1) 0%, transparent 65%)',
              }}
              aria-hidden
            />
            <div className="relative z-10">
              <h1 className="mb-1 text-lg font-bold tracking-tight text-text-primary">
                Benvenuto 👋
              </h1>
              <p className="text-xs text-text-secondary">
                Gestisci i tuoi allenamenti, progressi e molto altro
              </p>
              <p className="mt-2 text-xs font-medium text-primary">
                Pronto per l&apos;allenamento?
              </p>
            </div>
          </div>
        </div>

        {/* Blocchi griglia */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Blocchi griglia</h3>
          <p className={DS_LABEL_CLASS}>
            Accento per id: teal, cyan, green, emerald, amber. Card default, accento su barra
            sinistra e icon box.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 min-[400px]:grid-cols-2 lg:grid-cols-3">
            {HOME_BLOCCHI_DATA.map((b) => {
              const accent = accentiAtleta[b.accentKey]
              const BloccoIcon = iconByName[b.iconId]
              if (!accent || !BloccoIcon) return null
              return (
                <div
                  key={b.id}
                  className={cn(
                    DS_CARD_FRAME_CLASS,
                    'flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-lg border-l-4 px-4 py-4',
                  )}
                  style={{ borderLeftColor: accent.bar }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white"
                    style={{ backgroundColor: accent.iconBg }}
                  >
                    <BloccoIcon className="h-4 w-4" strokeWidth={2.25} />
                  </div>
                  <span className="text-center text-xs font-semibold uppercase tracking-wider text-text-primary">
                    {b.label}
                  </span>
                  <span className="line-clamp-2 text-center text-[11px] text-text-muted">
                    {b.desc}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Header pagina — Glass, Compatto, Fisso */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 min-[900px]:grid-cols-3">
          <div>
            <h3 className={DS_BLOCK_TITLE_CLASS}>Header pagina — Glass</h3>
            <p className={DS_LABEL_CLASS}>
              Profilo, Progressi, Nutrizionista, Massaggiatore, Documenti. Accento su icon box.
            </p>
            {tealAccent && (
              <div className={cn('relative overflow-hidden p-3', DS_CARD_FRAME_CLASS)}>
                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 rounded-lg p-0 text-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-primary"
                    style={{ backgroundColor: tealAccent.iconBg }}
                  >
                    <BarChart3 className="h-5 w-5" style={{ color: barHex }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-base font-bold tracking-tight text-text-primary">
                      Titolo pagina
                    </h4>
                    <p className={cn(DS_LABEL_CLASS, 'truncate mt-0.5')}>Sottotitolo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 className={DS_BLOCK_TITLE_CLASS}>Header pagina — Compatto</h3>
            <p className={DS_LABEL_CLASS}>
              Variante per contesti secondari. Vedi Patterns Headers.
            </p>
            {tealAccent && (
              <header className={cn('relative overflow-hidden p-3', DS_CARD_FRAME_CLASS)}>
                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 rounded-lg text-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-primary"
                    style={{ backgroundColor: tealAccent.iconBg }}
                  >
                    <Activity className="h-4 w-4" style={{ color: barHex }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-xl font-semibold text-text-primary">Titolo</h4>
                    <p className={cn(DS_LABEL_CLASS, 'mt-0.5')}>Sottotitolo</p>
                  </div>
                </div>
              </header>
            )}
          </div>
          <div>
            <h3 className={DS_BLOCK_TITLE_CLASS}>Header pagina — Fisso (nero + linea cyan)</h3>
            <p className={DS_LABEL_CLASS}>
              Allenamenti, Appuntamenti, Foto. PageHeaderFixed. Vedi Patterns Headers.
            </p>
            <PageHeaderFixed
              title="I miei Allenamenti"
              subtitle="Programma e monitora i tuoi progressi"
              onBack={() => {}}
              icon={<Dumbbell className="h-5 w-5 text-cyan-400" />}
              static
            />
          </div>
        </div>

        {/* Card con accento (icon + valore) */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Card con accento</h3>
          <p className={DS_LABEL_CLASS}>Card default, accento su icon box e valore.</p>
          {tealAccent && (
            <div className={cn('relative overflow-hidden p-4', DS_CARD_FRAME_CLASS)}>
              <div className="relative z-10 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-primary"
                  style={{ backgroundColor: tealAccent.iconBg }}
                >
                  <Activity className="h-4 w-4" style={{ color: barHex }} />
                </div>
                <div>
                  <p className={cn(DS_LABEL_CLASS, 'mb-0 uppercase tracking-wide')}>Label</p>
                  <p className="text-lg font-bold text-text-primary" style={{ color: barHex }}>
                    42
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modulo Tabs */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Modulo Tabs</h3>
          <p className={DS_LABEL_CLASS}>
            Es. Profilo: TabsList con bordo e inset DS. Tab attivo: bg-primary text-white.
          </p>
          <Tabs defaultValue="anagrafica" className="w-full">
            <TabsList
              className={cn(
                DS_CARD_FRAME_CLASS,
                'h-auto grid w-full grid-cols-2 min-[500px]:grid-cols-3 lg:grid-cols-5 gap-2 p-2 min-h-[44px]',
              )}
            >
              {tabsItems.map(({ value, label, Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-xs px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[40px] min-w-0"
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Componenti in uso atleta */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Componenti in uso atleta</h3>
          <p className={DS_LABEL_CLASS}>
            Badge, Progress, Dialog, Skeleton, Empty state, Input/Label, SimpleSelect.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className={DS_LABEL_CLASS}>Badge</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full px-2.5 py-1 text-xs font-medium text-state-valid bg-gradient-to-r from-state-valid/25 to-state-valid/10">
                  Completato
                </span>
                <span className="rounded-full px-2.5 py-1 text-xs font-medium text-warning-foreground bg-gradient-to-r from-state-warn/25 to-state-warn/10">
                  In scadenza
                </span>
                <span className="rounded-full px-2.5 py-1 text-xs font-medium text-state-info bg-gradient-to-r from-state-info/25 to-state-info/10">
                  Attiva
                </span>
                <span className="rounded-full px-2.5 py-1 text-xs font-medium text-primary bg-gradient-to-r from-primary/25 to-primary/10">
                  Valido
                </span>
              </div>
            </div>
            <div>
              <p className={DS_LABEL_CLASS}>Progress</p>
              <Progress value={75} className="h-1.5 w-32" />
              <span className={cn(DS_LABEL_CLASS, 'mt-1 block')}>Allenamenti/riepilogo</span>
            </div>
            <div>
              <p className={DS_LABEL_CLASS}>Dialog</p>
              <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
                Apri dialog
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-background border-primary/30 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-text-primary">Titolo</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                      Descrizione esempio. Usato in Allenamenti/oggi, Documenti,
                      Foto-risultati/aggiungi.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                      Chiudi
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <p className={DS_LABEL_CLASS}>Skeleton</p>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
              </div>
              <span className={cn(DS_LABEL_CLASS, 'mt-1 block')}>
                Progressi/allenamenti (loading)
              </span>
            </div>
            <div>
              <p className={DS_LABEL_CLASS}>Empty state</p>
              <EmptyState
                icon={Calendar}
                title="Nessun appuntamento"
                description="Controlla più tardi o contatta il tuo personal trainer."
                variant="default"
                iconSize="medium"
                showGradient={false}
              />
            </div>
            <div>
              <p className={DS_LABEL_CLASS}>Input + Label</p>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Es. Progressi/nuovo, Documenti" className="text-sm" />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className={DS_LABEL_CLASS}>SimpleSelect</p>
              <SimpleSelect
                placeholder="Seleziona categoria..."
                options={selectOptions}
                className="max-w-xs"
              />
              <span className={cn(DS_LABEL_CLASS, 'mt-1 block')}>Documenti (categoria upload)</span>
            </div>
          </div>
        </div>

        {/* Moduli specifici atleta (riferimento, senza demo per dipendenze) */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Moduli specifici atleta</h3>
          <p className={DS_LABEL_CLASS}>
            Componenti con dipendenze da dati/hook; usati nelle pagine indicate.
          </p>
          <Card variant="default" className={DS_CARD_FRAME_CLASS}>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <strong className="text-text-primary">RestTimer</strong> — Allenamenti/oggi (timer
                recupero tra esercizi)
              </li>
              <li>
                <strong className="text-text-primary">MessageList / MessageInput</strong> — Chat
                (lista messaggi, input invio)
              </li>
              <li>
                <strong className="text-text-primary">ProgressPhotoImage</strong> — Progressi/foto,
                Foto-risultati (galleria, upload, anteprima)
              </li>
            </ul>
          </Card>
        </div>

        {/* Fondazioni in uso (riferimento, no duplicati) */}
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>Fondazioni in uso</h3>
          <Card variant="default" className={`${DS_CARD_FRAME_CLASS} sm:col-span-2`}>
            <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
              Colori, Tipografia, Icone, Radius, Spacing, Moduli
            </CardTitle>
            <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
              Le pagine <code className={DS_CODE_CLASS}>/home/*</code> usano gli stessi token delle
              sezioni dedicate. Colori, Tipografia, Icone, Radius & Spacing, Componenti e Moduli.
              Card trainer/admin:{' '}
              <code className={DS_CODE_CLASS}>@/lib/design-tokens (roleThemes)</code>.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <p className={DS_BLOCK_TITLE_CLASS}>Card Trainer / Admin (ruoli)</p>
                <p className={DS_LABEL_CLASS}>Token: roleThemes.trainer / roleThemes.admin.</p>
                <div className="flex flex-wrap gap-3">
                  {(
                    Object.entries(RUOLI_CARD) as Array<
                      ['trainer' | 'admin', typeof RUOLI_CARD.trainer]
                    >
                  ).map(([key, role]) => (
                    <div
                      key={key}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3',
                        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
                      )}
                    >
                      <div
                        className={cn(
                          'h-10 w-10 rounded-lg border shadow-sm',
                          role.gradientPrimary,
                          role.borderPrimary,
                        )}
                        title={role.primary}
                      />
                      <span className="text-sm font-medium text-text-primary">{role.label}</span>
                      <span className="font-mono text-xs text-text-muted">{role.primary}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className={DS_BLOCK_TITLE_CLASS}>Accenti atleta (blocchi / card)</p>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(accentiAtleta) as Array<keyof typeof accentiAtleta>).map((key) => {
                    const accent = accentiAtleta[key]
                    if (!accent) return null
                    return <ColorSwatch key={key} label={key} color={accent.bar} />
                  })}
                </div>
              </div>
              <div>
                <p className={DS_BLOCK_TITLE_CLASS}>Icone blocchi Home</p>
                <div className="flex flex-wrap gap-2">
                  {HOME_ICONS_DATA.map(({ id, iconId, accentKey }) => {
                    const Icon = iconByName[iconId]
                    const accent = accentiAtleta[accentKey]
                    if (!Icon || !accent) return null
                    const label = id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    return (
                      <div
                        key={id}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2',
                          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
                        )}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white"
                          style={{ backgroundColor: accent.iconBg }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.25} />
                        </div>
                        <span className="text-xs font-medium text-text-primary">{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
