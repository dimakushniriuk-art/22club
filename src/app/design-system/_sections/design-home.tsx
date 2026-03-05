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

const cardFrameClass =
  'overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

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
  const borderRgba = tealAccent?.border ?? 'rgba(2,179,191,0.4)'

  const baseTokenRows = homeMeta?.tokenTable ?? []
  const variantRows: Array<{ token: string; value: string }> = [
    { token: 'Header pagina', value: 'Glass (primary) o Compatto (primary)' },
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
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Home className="h-6 w-6 text-primary" />
        Design Home
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Token ed elementi per le pagine atleta{' '}
        <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">/home/*</code>.
        Stessa struttura e qualità delle sezioni Colori, Tipografia, Layouts. Fondazioni (colori,
        tipografia, radius, spacing) in uso: vedi sezioni dedicate sopra.
      </p>

      <div className="space-y-8">
        {/* Token — Base Design System (elementi grafici) */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">
            Token — Base Design System
          </h3>
          <p className="mb-4 text-xs text-text-muted">
            Layout, container, griglia, header, accenti, focus.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allTokenRows.map((row, i) => {
              const Icon = TOKEN_ICONS[row.token] ?? Box
              return (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border border-primary/20 bg-gradient-to-br from-background-secondary to-background-secondary/80 p-3 transition-colors hover:border-primary/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-primary">{row.token}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{row.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Header Benvenuto */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Header Benvenuto</h3>
          <p className="mb-3 text-xs text-text-muted">
            Glass primary, rounded-2xl, backdrop-blur-xl. Solo su /home.
          </p>
          <div
            className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl"
            style={{
              border: '1px solid rgba(2, 179, 191, 0.4)',
              background:
                'linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.06) 100%)',
              boxShadow: '0 4px 28px rgba(0,0,0,0.22), 0 0 0 1px rgba(2,179,191,0.12) inset',
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-70"
              style={{
                background:
                  'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)',
              }}
              aria-hidden
            />
            <div className="relative z-10">
              <h1 className="mb-1 text-lg font-bold tracking-tight text-white">Benvenuto 👋</h1>
              <p className="text-xs text-text-secondary">
                Gestisci i tuoi allenamenti, progressi e molto altro
              </p>
              <p className="mt-2 text-[11px] font-medium text-primary">
                Pronto per l&apos;allenamento?
              </p>
            </div>
          </div>
        </div>

        {/* Blocchi griglia (come in /home: nessuna cornice esterna) */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Blocchi griglia</h3>
          <p className="mb-3 text-xs text-text-muted">
            Accento per id: teal, cyan, green, emerald, amber. Link, icon box rounded-xl, label
            uppercase, description line-clamp-2. Bordo e barra sinistra accento, no cornice bianca.
          </p>
          <div className="grid grid-cols-2 gap-2.5 min-[400px]:grid-cols-3">
            {HOME_BLOCCHI_DATA.map((b) => {
              const accent = accentiAtleta[b.accentKey]
              const BloccoIcon = iconByName[b.iconId]
              if (!accent || !BloccoIcon) return null
              return (
                <div
                  key={b.id}
                  className="flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3"
                  style={{
                    border: `1px solid ${accent.border}`,
                    background:
                      'linear-gradient(145deg, rgba(26,26,30,0.88) 0%, rgba(22,22,26,0.92) 100%)',
                    boxShadow: `inset 6px 0 0 0 ${accent.bar}, 0 4px 20px rgba(0,0,0,0.24)`,
                  }}
                >
                  <div className="rounded-xl p-2" style={{ backgroundColor: accent.iconBg }}>
                    <BloccoIcon className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <span className="text-center text-[10px] font-bold uppercase tracking-wider text-white">
                    {b.label}
                  </span>
                  <span className="line-clamp-2 text-center text-[9px] text-white/65">
                    {b.desc}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Header pagina — Glass e Compatto */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-text-secondary">Header pagina — Glass</h3>
            <p className="mb-3 text-xs text-text-muted">
              Profilo, Progressi, Nutrizionista, Massaggiatore, Documenti. Accento teal/cyan/…
            </p>
            {tealAccent && (
              <div
                className="relative overflow-hidden rounded-2xl p-3 backdrop-blur-xl"
                style={{
                  border: `1px solid ${borderRgba}`,
                  background: `linear-gradient(135deg, ${barHex}17 0%, ${barHex}05 50%, ${barHex}0f 100%)`,
                }}
              >
                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 rounded-xl p-0 text-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: tealAccent.iconBg,
                      border: `1px solid ${borderRgba}`,
                    }}
                  >
                    <BarChart3 className="h-5 w-5 text-primary" style={{ color: barHex }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-base font-bold tracking-tight text-text-primary">
                      Titolo pagina
                    </h4>
                    <p className="truncate text-[10px] text-text-tertiary">Sottotitolo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-text-secondary">
              Header pagina — Compatto
            </h3>
            <p className="mb-3 text-xs text-text-muted">
              Allenamenti, Appuntamenti, Foto risultati. Stesso stile Glass (teal, rounded-2xl,
              backdrop-blur-xl).
            </p>
            {tealAccent && (
              <header
                className="relative overflow-hidden rounded-2xl p-3 backdrop-blur-xl"
                style={{
                  border: `1px solid ${borderRgba}`,
                  background: `linear-gradient(135deg, ${barHex}17 0%, ${barHex}05 50%, ${barHex}0f 100%)`,
                }}
              >
                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: tealAccent.iconBg,
                      border: `1px solid ${borderRgba}`,
                    }}
                  >
                    <Activity className="h-4 w-4 text-primary" style={{ color: barHex }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-xl font-semibold text-text-primary">Titolo</h4>
                    <p className="text-[10px] text-text-tertiary">Sottotitolo</p>
                  </div>
                </div>
              </header>
            )}
          </div>
        </div>

        {/* Card con accento (icon + label) */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Card con accento</h3>
          <p className="mb-3 text-xs text-text-muted">
            Accento teal/cyan/green/emerald/amber. Bordo accento, icon box rounded-lg.
          </p>
          {tealAccent && (
            <div
              className="relative overflow-hidden rounded-xl bg-background-secondary/50"
              style={{ border: `1px solid ${borderRgba}` }}
            >
              <div className="relative z-10 flex items-center gap-2 p-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 border border-primary/30"
                  style={{ borderColor: borderRgba, backgroundColor: `${barHex}22` }}
                >
                  <Activity className="h-4 w-4 text-primary" style={{ color: barHex }} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Label
                  </div>
                  <div className="text-lg font-bold" style={{ color: barHex }}>
                    42
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modulo Tabs (come in Profilo: TabsList + TabsTrigger con icona, tab attivo bg-primary) */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Modulo Tabs</h3>
          <p className="mb-3 text-xs text-text-muted">
            Es. Profilo: TabsList con border primary/20, TabsTrigger con icona. Tab attivo:
            bg-primary text-white.
          </p>
          <Tabs defaultValue="anagrafica" className="w-full">
            <TabsList className="h-auto grid w-full grid-cols-2 min-[500px]:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 border border-primary/20 bg-background-tertiary/50 p-1.5 sm:p-2 rounded-xl min-h-[44px]">
              {tabsItems.map(({ value, label, Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-[11px] px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] min-w-0"
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Componenti in uso atleta (Badge, Progress, Dialog, Skeleton, EmptyState, Input, SimpleSelect) */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Componenti in uso atleta</h3>
          <p className="mb-4 text-xs text-text-muted">
            Badge, Progress, Dialog, Skeleton, Empty state, Input/Label, SimpleSelect. Usati in
            Allenamenti, Appuntamenti, Documenti, Progressi, Chat, Profilo.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-text-tertiary">Badge</p>
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
              <p className="mb-2 text-xs font-medium text-text-tertiary">Progress</p>
              <Progress value={75} className="h-1.5 w-32" />
              <span className="mt-1 block text-[10px] text-text-muted">Allenamenti/riepilogo</span>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-text-tertiary">Dialog</p>
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
              <p className="mb-2 text-xs font-medium text-text-tertiary">Skeleton</p>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
              </div>
              <span className="mt-1 block text-[10px] text-text-muted">
                Progressi/allenamenti (loading)
              </span>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-text-tertiary">Empty state</p>
              <EmptyState
                icon={Calendar}
                title="Nessun appuntamento"
                description="Controlla più tardi o contatta il tuo personal trainer."
                variant="athlete"
                iconSize="medium"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-text-tertiary">Input + Label</p>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Es. Progressi/nuovo, Documenti" className="text-sm" />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="mb-2 text-xs font-medium text-text-tertiary">SimpleSelect</p>
              <SimpleSelect
                placeholder="Seleziona categoria..."
                options={selectOptions}
                className="max-w-xs"
              />
              <span className="mt-1 block text-[10px] text-text-muted">
                Documenti (categoria upload)
              </span>
            </div>
          </div>
        </div>

        {/* Moduli specifici atleta (riferimento, senza demo per dipendenze) */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Moduli specifici atleta</h3>
          <p className="mb-3 text-xs text-text-muted">
            Componenti con dipendenze da dati/hook; usati nelle pagine indicate.
          </p>
          <Card variant="default" className={cardFrameClass}>
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
          <h3 className="mb-3 text-sm font-medium text-text-secondary">Fondazioni in uso</h3>
          <Card variant="default" className={`${cardFrameClass} sm:col-span-2`}>
            <CardTitle className="mb-3 text-sm font-medium text-text-secondary">
              Colori, Tipografia, Icone, Radius, Spacing, Moduli
            </CardTitle>
            <p className="mb-4 text-xs text-text-muted">
              Le pagine{' '}
              <code className="rounded bg-surface-300 px-1 py-0.5 font-mono text-[10px]">
                /home/*
              </code>{' '}
              usano gli stessi token delle sezioni dedicate. Riferimento:{' '}
              <strong className="text-text-primary">Colori</strong> (background, surface, primary,
              accenti atleta, <strong className="text-text-primary">Card trainer/admin</strong>),{' '}
              <strong className="text-text-primary">Tipografia</strong> (text-lg, text-xs,
              text-text-*), <strong className="text-text-primary">Icone</strong> (Lucide),{' '}
              <strong className="text-text-primary">Radius & Spacing</strong> (rounded-xl,
              rounded-2xl, gap-3, py-4, min-h-[44px]),{' '}
              <strong className="text-text-primary">Componenti</strong> e{' '}
              <strong className="text-text-primary">Moduli</strong> (Card, Button, Tabs, ecc.).
              Pagine come Progressi usano più accenti (verde, cyan, viola) per card diverse. Card
              trainer/admin: token in{' '}
              <code className="rounded bg-surface-300 px-1 py-0.5 font-mono text-[10px]">
                @/lib/design-tokens (roleThemes)
              </code>
              . Vedi sezioni sopra per scale e varianti.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-text-tertiary">
                  Card Trainer / Admin (ruoli)
                </p>
                <p className="mb-2 text-[10px] text-text-muted">
                  Token: roleThemes.trainer / roleThemes.admin. Moduli, dashboard.
                </p>
                <div className="flex flex-wrap gap-3">
                  {(
                    Object.entries(RUOLI_CARD) as Array<
                      ['trainer' | 'admin', typeof RUOLI_CARD.trainer]
                    >
                  ).map(([key, role]) => (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-10 w-10 rounded-xl border shadow-sm ${role.gradientPrimary} ${role.borderPrimary}`}
                      />
                      <span className="text-[10px] text-text-muted">{role.label}</span>
                      <span className="font-mono text-[9px] text-text-muted" title={role.primary}>
                        {role.primary}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-text-tertiary">
                  Accenti atleta (blocchi / card)
                </p>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(accentiAtleta) as Array<keyof typeof accentiAtleta>).map((key) => {
                    const accent = accentiAtleta[key]
                    if (!accent) return null
                    return (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <div
                          className="h-8 w-8 rounded-lg border-2 shadow-inner"
                          style={{ borderColor: accent.border, backgroundColor: `${accent.bar}18` }}
                        />
                        <span className="text-[10px] text-text-muted">{key}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-text-tertiary">Icone blocchi Home</p>
                <div className="flex flex-wrap gap-1.5">
                  {HOME_ICONS_DATA.map(({ id, iconId, accentKey }) => {
                    const Icon = iconByName[iconId]
                    const accent = accentiAtleta[accentKey]
                    if (!Icon || !accent) return null
                    return (
                      <div
                        key={id}
                        className="flex flex-col items-center gap-0.5 rounded-lg p-1.5"
                        style={{ backgroundColor: accent.iconBg }}
                      >
                        <Icon className="h-4 w-4 text-white" strokeWidth={2.25} />
                        <span className="font-mono text-[8px] text-white/80">{id}</span>
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
