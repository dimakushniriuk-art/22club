'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Globe,
  Home,
  LayoutDashboard,
  Lock,
  LogIn,
  Mail,
  Salad,
  Scale,
  Shield,
  Sparkles,
  TrendingUp,
  UserPlus,
  FileText,
  BarChart3,
  Users,
  Target,
  Megaphone,
  Hand,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { FadeIn } from '@/components/ui/animations'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ProgressiNavCard } from '@/components/home/progressi-nav-card'
import { RUOLI_CARD } from '@/lib/design-system-data'
import { colors } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import {
  DS_CARD_FRAME_CLASS,
  DS_CODE_CLASS,
  DS_SECTION_TITLE_CLASS,
  DS_SECTION_INTRO_CLASS,
  DS_BLOCK_TITLE_CLASS,
  DS_LABEL_CLASS,
} from './helpers'

type RouteGroup = {
  id: string
  label: string
  icon: LucideIcon
  designNote: string
  routes: Array<{ path: string; label?: string }>
}

const ROUTE_GROUPS: RouteGroup[] = [
  {
    id: 'pubbliche-auth',
    label: 'Pubbliche / Auth',
    icon: LogIn,
    designNote:
      'Layout centrato, AthleteBackground (teal/cyan). Card backdrop-blur, form space-y-5, Input min-h-[44px], Button gradient. Pagine legali: layout semplice.',
    routes: [
      { path: '/', label: 'Home pubblica' },
      { path: '/login' },
      { path: '/registrati' },
      { path: '/forgot-password' },
      { path: '/reset-password' },
      { path: '/post-login' },
      { path: '/welcome' },
      { path: '/privacy' },
      { path: '/termini' },
    ],
  },
  {
    id: 'home-atleta',
    label: 'Area atleta (home)',
    icon: Home,
    designNote:
      'Layout flex-col. Header: Glass (Benvenuto su /home), Compatto (profilo/progressi/documenti), Fisso nero+cyan (allenamenti/appuntamenti/foto). Accenti teal/cyan/green/emerald/amber. Card, Tabs, Badge, Progress, Dialog, EmptyState, Skeleton, SimpleSelect.',
    routes: [
      { path: '/home', label: 'Home atleta' },
      { path: '/home/profilo' },
      { path: '/home/appuntamenti' },
      { path: '/home/allenamenti' },
      { path: '/home/allenamenti/oggi' },
      { path: '/home/allenamenti/riepilogo' },
      { path: '/home/allenamenti/[id]', label: 'Dettaglio allenamento' },
      { path: '/home/allenamenti/esercizio/[exerciseId]', label: 'Dettaglio esercizio' },
      { path: '/home/progressi' },
      { path: '/home/progressi/nuovo' },
      { path: '/home/progressi/allenamenti' },
      { path: '/home/progressi/misurazioni' },
      { path: '/home/progressi/foto' },
      { path: '/home/progressi/storico' },
      { path: '/home/foto-risultati' },
      { path: '/home/foto-risultati/aggiungi' },
      { path: '/home/pagamenti' },
      { path: '/home/documenti' },
      { path: '/home/chat' },
      { path: '/home/trainer' },
      { path: '/home/nutrizionista' },
      { path: '/home/massaggiatore' },
    ],
  },
  {
    id: 'dashboard-staff',
    label: 'Dashboard (staff) — Generale',
    icon: LayoutDashboard,
    designNote:
      'Layout: RoleLayout (sidebar + area contenuto). Pagine: StaffContentLayout (title, actions, children). Spacing: gap-4 sm:gap-6 md:gap-8 tra header e contenuto; space-y-4 sm:space-y-6 tra sezioni; space-y-3 tra card in lista. Componenti: Card, Button, Badge, Table, Input, Select, Tabs. Token: fondazioni (colori, tipografia), bordo border-white/10, rounded-lg.',
    routes: [
      { path: '/dashboard' },
      { path: '/dashboard/profilo' },
      { path: '/dashboard/impostazioni' },
      { path: '/dashboard/appuntamenti' },
      { path: '/dashboard/calendario' },
      { path: '/dashboard/calendario/impostazioni' },
      { path: '/dashboard/chat' },
      { path: '/dashboard/documenti' },
      { path: '/dashboard/esercizi' },
      { path: '/dashboard/allenamenti' },
      { path: '/dashboard/schede' },
      { path: '/dashboard/schede/nuova' },
      { path: '/dashboard/schede/[id]/modifica', label: 'Modifica scheda' },
      { path: '/dashboard/atleti/[id]', label: 'Dettaglio atleta' },
      { path: '/dashboard/clienti' },
      { path: '/dashboard/abbonamenti' },
      { path: '/dashboard/pagamenti' },
      { path: '/dashboard/statistiche' },
      { path: '/dashboard/comunicazioni' },
      { path: '/dashboard/comunicazioni/template' },
      { path: '/dashboard/invita-atleta' },
    ],
  },
  {
    id: 'dashboard-admin',
    label: 'Dashboard — Admin',
    icon: Shield,
    designNote:
      'Stesso layout staff (RoleLayout, StaffContentLayout). Accento admin (roleThemes.admin). Pagine: utenti, organizzazioni, ruoli, statistiche. Componenti standard: Card, Table, Button, Badge.',
    routes: [
      { path: '/dashboard/admin' },
      { path: '/dashboard/admin/utenti' },
      { path: '/dashboard/admin/utenti/marketing' },
      { path: '/dashboard/admin/organizzazioni' },
      { path: '/dashboard/admin/ruoli' },
      { path: '/dashboard/admin/statistiche' },
    ],
  },
  {
    id: 'dashboard-marketing',
    label: 'Dashboard — Marketing',
    icon: Mail,
    designNote:
      'Layout staff. Sezioni: analytics, report, athletes, leads, segments, campaigns, automations, impostazioni. Card, tabelle, filtri, form. Stessi token fondazioni.',
    routes: [
      { path: '/dashboard/marketing' },
      { path: '/dashboard/marketing/analytics' },
      { path: '/dashboard/marketing/report' },
      { path: '/dashboard/marketing/athletes' },
      { path: '/dashboard/marketing/leads' },
      { path: '/dashboard/marketing/leads/[id]', label: 'Dettaglio lead' },
      { path: '/dashboard/marketing/segments' },
      { path: '/dashboard/marketing/segments/new' },
      { path: '/dashboard/marketing/segments/[id]', label: 'Dettaglio segmento' },
      { path: '/dashboard/marketing/segments/[id]/edit', label: 'Modifica segmento' },
      { path: '/dashboard/marketing/campaigns' },
      { path: '/dashboard/marketing/campaigns/new' },
      { path: '/dashboard/marketing/campaigns/[id]', label: 'Dettaglio campagna' },
      { path: '/dashboard/marketing/campaigns/[id]/edit', label: 'Modifica campagna' },
      { path: '/dashboard/marketing/automations' },
      { path: '/dashboard/marketing/automations/new' },
      { path: '/dashboard/marketing/automations/[id]', label: 'Dettaglio automazione' },
      { path: '/dashboard/marketing/impostazioni' },
    ],
  },
  {
    id: 'dashboard-nutrizionista',
    label: 'Dashboard — Nutrizionista',
    icon: Salad,
    designNote:
      'Layout staff. Accento emerald/verde. Pagine: atleti, calendario, chat, check-in, piani, progressi, analisi, abbonamenti, documenti, impostazioni. StaffContentLayout, Card, form, tabelle.',
    routes: [
      { path: '/dashboard/nutrizionista' },
      { path: '/dashboard/nutrizionista/atleti' },
      { path: '/dashboard/nutrizionista/atleti/[id]', label: 'Dettaglio atleta' },
      { path: '/dashboard/nutrizionista/calendario' },
      { path: '/dashboard/nutrizionista/chat' },
      { path: '/dashboard/nutrizionista/checkin' },
      { path: '/dashboard/nutrizionista/checkin/[id]', label: 'Dettaglio check-in' },
      { path: '/dashboard/nutrizionista/piani' },
      { path: '/dashboard/nutrizionista/piani/nuovo' },
      { path: '/dashboard/nutrizionista/progressi' },
      { path: '/dashboard/nutrizionista/analisi' },
      { path: '/dashboard/nutrizionista/abbonamenti' },
      { path: '/dashboard/nutrizionista/documenti' },
      { path: '/dashboard/nutrizionista/impostazioni' },
    ],
  },
  {
    id: 'dashboard-massaggiatore',
    label: 'Dashboard — Massaggiatore',
    icon: Sparkles,
    designNote:
      'Layout staff. Pagine: profilo, calendario, appuntamenti, chat, abbonamenti, statistiche, impostazioni. StaffContentLayout, Card, stessi token.',
    routes: [
      { path: '/dashboard/massaggiatore' },
      { path: '/dashboard/massaggiatore/profilo' },
      { path: '/dashboard/massaggiatore/calendario' },
      { path: '/dashboard/massaggiatore/appuntamenti' },
      { path: '/dashboard/massaggiatore/chat' },
      { path: '/dashboard/massaggiatore/abbonamenti' },
      { path: '/dashboard/massaggiatore/statistiche' },
      { path: '/dashboard/massaggiatore/impostazioni' },
    ],
  },
]

export function DesignAreeRoute() {
  return (
    <section id="aree-route" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Globe className="h-6 w-6 text-primary" />
        Design per area
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Route raggruppate per area. Per ogni gruppo: path e note di design (layout, componenti).
        Dettagli visivi nelle sezioni Colori, Tipografia, Layouts, Componenti, Auth, Area atleta.
      </p>

      <div className="space-y-6">
        {ROUTE_GROUPS.map((group) => {
          const Icon = group.icon
          return (
            <Card key={group.id} variant="default" className={DS_CARD_FRAME_CLASS}>
              <CardHeader padding="lg" className="pb-4">
                <CardTitle size="sm" className="flex items-center gap-2 text-text-primary">
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                  {group.label}
                </CardTitle>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {group.designNote}
                </p>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6 pt-0">
                <div>
                  <h4 className={DS_BLOCK_TITLE_CLASS}>Route</h4>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                    <ul className="space-y-1.5 text-xs">
                      {group.routes.map((r) => (
                        <li key={r.path} className="flex items-baseline gap-2">
                          <code className={DS_CODE_CLASS}>{r.path}</code>
                          {r.label != null && <span className="text-text-muted">— {r.label}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Elementi di design presenti in Pubbliche/Auth ma non in altre sezioni del design-system */}
                {group.id === 'pubbliche-auth' && <PubblicheAuthDesignElements />}
                {/* Elementi di design presenti in Area atleta (home) ma non in altre sezioni */}
                {group.id === 'home-atleta' && <HomeAtletaDesignElements />}
                {group.id === 'dashboard-staff' && <DashboardStaffDesignElements />}
                {group.id === 'dashboard-admin' && <DashboardAdminDesignElements />}
                {group.id === 'dashboard-marketing' && <DashboardMarketingDesignElements />}
                {group.id === 'dashboard-nutrizionista' && <DashboardNutrizionistaDesignElements />}
                {group.id === 'dashboard-massaggiatore' && <DashboardMassaggiatoreDesignElements />}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function PubblicheAuthDesignElements() {
  const [showPw, setShowPw] = useState(false)
  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <h4 className={DS_BLOCK_TITLE_CLASS}>
        Elementi di design solo in queste pagine (non ripetuti altrove)
      </h4>
      <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
        Componenti e pattern usati in /, /login, /registrati, /forgot-password, /reset-password,
        /post-login, /welcome, /privacy, /termini.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        {/* 1. Loading full-page (/, post-login) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Loading full-page</h4>
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="text-sm text-text-secondary">Caricamento...</p>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/ e /post-login</p>
        </div>

        {/* 2. Logo in card con drop-shadow + blur */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Logo in card auth</h4>
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/logo.svg"
                alt="22 Club"
                width={120}
                height={120}
                className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(2,179,191,0.25)]"
              />
              <div className="absolute inset-0 -z-10 bg-primary/15 blur-xl" />
            </div>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>drop-shadow + blur-xl</p>
        </div>

        {/* 3. Input con icona a sinistra */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Input con icona a sinistra</h4>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
            <Input
              placeholder="la.tua@email.com"
              className="min-h-[44px] pl-9 rounded-md bg-background border-border text-sm"
              readOnly
            />
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>forgot-password, reset, login</p>
        </div>

        {/* 4. Input password con toggle Eye/EyeOff */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Input password + toggle visibilità</h4>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className="min-h-[44px] pl-9 pr-10 rounded-md bg-background border-border text-sm"
              readOnly
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              aria-label={showPw ? 'Nascondi password' : 'Mostra password'}
            >
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>reset-password</p>
        </div>

        {/* 5. Link "Torna al Login" con freccia + hover */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Link indietro con freccia</h4>
          <Link
            href="#aree-route"
            className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Torna al Login
          </Link>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>forgot-password, reset, reset-password</p>
        </div>

        {/* 6. Stato success: cerchio + CheckCircle2 */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Stato success (icona in cerchio)</h4>
          <div className="flex justify-center py-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 animate-scale-in">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>registrati conferma, forgot-password/reset-password success</p>
        </div>

        {/* 7. Stato errore link: cerchio AlertCircle */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Stato errore (icona in cerchio)</h4>
          <div className="flex justify-center py-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-state-error/20">
              <AlertCircle className="h-7 w-7 text-state-error" />
            </div>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>reset-password link non valido</p>
        </div>

        {/* 8. Box info (bg-background-tertiary) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Box info secondario</h4>
          <div className="rounded-lg border border-white/10 bg-background-tertiary/50 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <p className="text-sm text-text-secondary flex items-start gap-2">
              <Mail className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              Non hai ricevuto l&apos;email? Controlla anche la cartella spam.
            </p>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>forgot-password success</p>
        </div>

        {/* 9. Button outline "Torna al Login" */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Button outline secondario</h4>
          <Button
            variant="outline"
            className="w-full min-h-[44px] rounded-lg border-border text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al Login
          </Button>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>reset-password urlError</p>
        </div>
      </div>

      {/* 10. Layout pagine legali (privacy, termini) */}
      <div>
        <h4 className={DS_BLOCK_TITLE_CLASS}>Layout pagine legali (privacy, termini)</h4>
        <p className={cn(DS_LABEL_CLASS, 'mt-3')}>
          Header: Torna indietro + Logo. Main: Card FadeIn, Accordion.
        </p>
        <div className="relative mt-3 min-h-[140px] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.3)]">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(2,179,191,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(2,179,191,0.12) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 flex items-center justify-between px-4 py-3">
            <Link
              href="#aree-route"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Torna indietro
            </Link>
            <Image
              src="/logo.svg"
              alt=""
              width={80}
              height={32}
              className="h-8 w-auto opacity-90"
            />
          </div>
          <div className="relative z-10 px-4 pb-4">
            <FadeIn>
              <div className="rounded-lg border border-white/10 bg-background-secondary/95 backdrop-blur-sm p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <p className="text-xs text-text-secondary">Card contenuto (FadeIn) + Accordion</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}

function HomeAtletaDesignElements() {
  const trainerRole = RUOLI_CARD.trainer
  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <h4 className={DS_BLOCK_TITLE_CLASS}>
        Elementi di design solo in queste pagine (non ripetuti altrove)
      </h4>
      <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
        Componenti e pattern usati in /home, /home/profilo, /home/appuntamenti, /home/allenamenti,
        /home/progressi, /home/trainer, ecc. Dettaglio completo in sezione &quot;Design Home&quot;.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        {/* 1. Skeleton lista (loading liste) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Skeleton lista</h4>
          <div className="animate-pulse space-y-3">
            <div className="h-12 w-56 rounded-lg bg-background-tertiary" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-background-tertiary" />
              ))}
            </div>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>appuntamenti, allenamenti (loading)</p>
        </div>

        {/* 2. LoadingState (Spinner + messaggio) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>LoadingState</h4>
          <LoadingState message="Caricamento in corso..." size="md" className="py-8" />
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>appuntamenti, trainer, ecc.</p>
        </div>

        {/* 3. ProgressiNavCard (card nav con barra accent) */}
        <div className="sm:col-span-2">
          <h4 className={DS_BLOCK_TITLE_CLASS}>ProgressiNavCard</h4>
          <div className="max-w-sm">
            <ProgressiNavCard
              href="#aree-route"
              accent="primary"
              icon={<Scale className="h-4 w-4 text-primary" />}
              title="Misurazioni del Corpo"
              description="Monitora peso, circonferenze e misure con grafici."
              ctaText="Visualizza misurazioni"
              ctaIcon={
                <TrendingUp className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              }
            />
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/home/progressi</p>
        </div>

        {/* 4. Card lista con Badge (appuntamento / scheda) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Card lista con Badge</h4>
          <Card variant="default" className="rounded-lg border border-white/10 overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">Lunedì 15:00</p>
                  <p className="text-xs text-text-secondary">Sessione PT · 1h</p>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium bg-state-valid/20 text-state-valid">
                  Confermato
                </span>
              </div>
            </CardContent>
          </Card>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>appuntamenti, allenamenti (lista)</p>
        </div>

        {/* 5. Card Trainer (roleThemes.trainer) — stile DS, accento solo su avatar */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Card Trainer</h4>
          <Card variant="default">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2',
                    trainerRole.gradientPrimary,
                    trainerRole.borderPrimary,
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary truncate">Nome Trainer</p>
                  <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 shrink-0" /> Personal Trainer
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/home/trainer, /home/pagamenti</p>
        </div>

        {/* 6. Bottone icona in header Benvenuto (inviti) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Bottone azione header Benvenuto</h4>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-background"
            style={{
              background: `linear-gradient(to right, ${colors.athleteAccents.teal.bar}, ${colors.athleteAccents.cyan.bar})`,
            }}
            aria-label="Inviti"
          >
            <Mail className="h-5 w-5" />
          </button>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/home (inviti in sospeso)</p>
        </div>
      </div>
    </div>
  )
}

function DashboardStaffDesignElements() {
  const quickActions = [
    {
      label: 'Invita Cliente',
      sublabel: 'Invita un atleta',
      iconClass: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
      Icon: UserPlus,
    },
    {
      label: 'Nuova Scheda',
      sublabel: 'Crea workout',
      iconClass: 'border-amber-500/30 bg-amber-500/20 text-amber-400',
      Icon: FileText,
    },
    {
      label: 'Statistiche',
      sublabel: 'KPI & trend',
      iconClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
      Icon: BarChart3,
    },
  ]
  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <h4 className={DS_BLOCK_TITLE_CLASS}>
        Elementi di design solo in queste pagine (non ripetuti altrove)
      </h4>
      <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
        Layout e componenti usati in /dashboard, /dashboard/profilo, /dashboard/appuntamenti,
        calendario, chat, atleti, ecc. RoleLayout (sidebar) + contenuto; spacing da regole progetto.
      </p>

      <div className="space-y-6">
        {/* 1. StaffContentLayout header (teal) — mock */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>StaffContentLayout — Header</h4>
          <div className="rounded-lg border border-white/10 bg-background/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-primary">
                  Esempio pagina staff
                </h1>
                <p className="mt-0.5 text-xs text-text-secondary">Descrizione sotto il titolo.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm">
                  Azione
                </Button>
              </div>
            </div>
            <p className={cn(DS_LABEL_CLASS, 'mt-3')}>Spacing: gap-4 sm:gap-6 md:gap-8</p>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>
            nutrizionista, massaggiatore, pagine con tema teal/amber
          </p>
        </div>

        {/* 2. Quick action cards (dashboard home) — stile DS, accento su icon box */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Quick action cards</h4>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((item) => (
              <div
                key={item.label}
                className="flex min-h-[70px] flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20"
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                    item.iconClass,
                  )}
                >
                  <item.Icon className="h-4 w-4" />
                </div>
                <span className="mt-2 block text-[10px] font-semibold text-text-primary">
                  {item.label}
                </span>
                <span className="text-[9px] text-text-secondary">{item.sublabel}</span>
              </div>
            ))}
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/dashboard (azioni rapide)</p>
        </div>

        {/* 3. Empty state + Error state con CTA */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <div className={DS_CARD_FRAME_CLASS}>
            <h4 className={DS_BLOCK_TITLE_CLASS}>Empty state staff</h4>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <p className="text-sm text-text-secondary">Nessun appuntamento oggi</p>
              <Button variant="primary" size="sm">
                Vai al calendario
              </Button>
            </div>
            <p className={cn(DS_LABEL_CLASS, 'mt-3')}>dashboard (agenda vuota)</p>
          </div>
          <div className={DS_CARD_FRAME_CLASS}>
            <h4 className={DS_BLOCK_TITLE_CLASS}>Error state con Riprova</h4>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <p className="text-sm text-text-secondary">Impossibile caricare i dati.</p>
              <Button variant="primary" size="sm">
                Riprova
              </Button>
            </div>
            <p className={cn(DS_LABEL_CLASS, 'mt-3')}>dashboard (errore caricamento)</p>
          </div>
        </div>

        {/* 4. Spacing token */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Spacing (regole progetto)</h4>
          <ul className="space-y-1 text-xs text-text-muted">
            <li>
              • Tra sezioni: <code className={DS_CODE_CLASS}>space-y-4 sm:space-y-6</code> o{' '}
              <code className={DS_CODE_CLASS}>gap-4 / gap-6</code>
            </li>
            <li>
              • Header ↔ contenuto: <code className={DS_CODE_CLASS}>gap-4 sm:gap-6 md:gap-8</code>{' '}
              (StaffContentLayout)
            </li>
            <li>
              • Liste di card: <code className={DS_CODE_CLASS}>space-y-3</code>
            </li>
            <li>
              • Gruppi pulsanti: <code className={DS_CODE_CLASS}>gap-2</code>; gruppi filtri:{' '}
              <code className={DS_CODE_CLASS}>gap-x-4 gap-y-3</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function DashboardAdminDesignElements() {
  const adminRole = RUOLI_CARD.admin
  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <h4 className={DS_BLOCK_TITLE_CLASS}>
        Elementi di design solo in queste pagine (non ripetuti altrove)
      </h4>
      <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
        Layout e componenti usati in /dashboard/admin, utenti, organizzazioni, ruoli, statistiche.
        Accento roleThemes.admin; Card admin, KPI cards, Badge ruoli, Table.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        {/* 1. Header admin */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Header pagina admin</h4>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-text-primary">Dashboard Amministratore</h1>
            <p className="text-sm text-text-secondary">Gestione completa del sistema 22Club</p>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/dashboard/admin</p>
        </div>

        {/* 2. Card Admin — stile DS, accento solo su avatar */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Card Admin</h4>
          <Card variant="default">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-10 w-10 shrink-0 rounded-lg',
                    adminRole.gradientPrimary,
                    adminRole.borderPrimary,
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">Area Admin</p>
                  <p className="text-xs text-text-secondary">roleThemes.admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>token roleThemes.admin</p>
        </div>

        {/* 3. KPI card — stile DS, accento su icona e valore */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>KPI card (admin dashboard)</h4>
          <Card variant="default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Utenti Totali
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">42</div>
              <p className="mt-1 text-xs text-text-secondary">Utenti registrati nel sistema</p>
            </CardContent>
          </Card>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/dashboard/admin (statistiche)</p>
        </div>

        {/* 4. Badge ruoli (Admin destructive) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Badge ruoli utenti</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive">Admin</Badge>
            <Badge variant="primary">Trainer</Badge>
            <Badge variant="neutral">Atleta</Badge>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>utenti: admin → destructive</p>
        </div>
      </div>

      {/* 5. Riferimento: Table + filtri */}
      <div className={DS_CARD_FRAME_CLASS}>
        <h4 className={DS_BLOCK_TITLE_CLASS}>Pattern: tabella utenti</h4>
        <p className={DS_LABEL_CLASS}>
          Input ricerca, Select (ruolo/stato), Table (TableHeader, TableBody, TableRow, TableCell),
          DropdownMenu azioni (Modifica, Elimina, Reset password, ecc.). Componenti:{' '}
          <code className={DS_CODE_CLASS}>@/components/ui</code> Table, Badge, Button, DropdownMenu.
        </p>
      </div>
    </div>
  )
}

function DashboardMarketingDesignElements() {
  const STATUS_LABELS: Record<string, string> = {
    new: 'Nuovo',
    contacted: 'Contattato',
    trial: 'Prova',
    converted: 'Convertito',
    lost: 'Perso',
  }
  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <h4 className={DS_BLOCK_TITLE_CLASS}>
        Elementi di design solo in queste pagine (non ripetuti altrove)
      </h4>
      <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
        Layout e componenti usati in /dashboard/marketing, analytics, report, leads, segments,
        campaigns, automations. Header con icona cyan, KPI cards, funnel, Table.
      </p>

      <div className="space-y-6">
        {/* 1. Header marketing (icon + titolo + descrizione) */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Header pagina marketing</h4>
          <header>
            <h1 className="flex items-center gap-2 text-xl font-bold text-text-primary">
              <BarChart3 className="h-6 w-6 text-primary" />
              KPI Marketing
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Metriche aggregate allenamenti. Dati dalla vista KPI.
            </p>
          </header>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/dashboard/marketing, analytics</p>
        </div>

        {/* 2. KPI cards — stile DS, accento su valore */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>KPI cards</h4>
          <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="mb-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                <UserPlus className="h-3.5 w-3.5" />
                Leads totali
              </div>
              <p className="text-lg font-bold text-primary">42</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="mb-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                <Target className="h-3.5 w-3.5" />
                Nuovi (7d)
              </div>
              <p className="text-lg font-bold text-cyan-400">8</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="mb-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                <BarChart3 className="h-3.5 w-3.5" />% con trainer
              </div>
              <p className="text-lg font-bold text-emerald-400">65%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="mb-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                <Megaphone className="h-3.5 w-3.5" />
                Campagne
              </div>
              <p className="text-lg font-bold text-amber-400">3</p>
            </div>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>marketing, analytics (grid gap-4)</p>
        </div>

        {/* 3. Error box + Funnel labels */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <div className={DS_CARD_FRAME_CLASS}>
            <h4 className={DS_BLOCK_TITLE_CLASS}>Error box</h4>
            <div className="rounded-lg border border-state-error/40 bg-state-error/10 px-4 py-3 text-sm text-state-error">
              Errore caricamento lead
            </div>
            <p className={cn(DS_LABEL_CLASS, 'mt-3')}>marketing (stato errore)</p>
          </div>
          <div className={DS_CARD_FRAME_CLASS}>
            <h4 className={DS_BLOCK_TITLE_CLASS}>Stati lead (funnel)</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <span
                  key={key}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-text-secondary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className={cn(DS_LABEL_CLASS, 'mt-3')}>
              leads: new, contacted, trial, converted, lost
            </p>
          </div>
        </div>

        {/* 4. Riferimento: tabella con header */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Pattern: tabella con header bar</h4>
          <p className={DS_LABEL_CLASS}>
            <code className={DS_CODE_CLASS}>rounded-lg border border-white/10</code>, header bar,
            corpo scrollabile. Input ricerca + Select filtro.
          </p>
          <div className="rounded-lg border border-white/10 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <div className="border-b border-white/10 bg-background-tertiary/50 px-3 py-2 text-xs font-medium text-text-secondary">
              Riepilogo (es. per atleta / lead)
            </div>
            <div className="p-3 text-[11px] text-text-muted">
              Table thead sticky, tbody con hover:bg-background-tertiary/30
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardNutrizionistaDesignElements() {
  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <h4 className={DS_BLOCK_TITLE_CLASS}>
        Elementi di design solo in queste pagine (non ripetuti altrove)
      </h4>
      <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
        Layout e componenti usati in /dashboard/nutrizionista, atleti, calendario, chat, check-in,
        piani, progressi, analisi, abbonamenti, documenti. StaffContentLayout tema{' '}
        <code className={DS_CODE_CLASS}>teal</code>; accento emerald/teal.
      </p>

      <div className="space-y-6">
        {/* 1. Header StaffContentLayout teal */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>StaffContentLayout — tema teal</h4>
          <div className="rounded-lg border border-white/10 bg-background/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <h1 className="text-lg font-bold tracking-tight text-primary">Area Nutrizionista</h1>
            <p className="mt-0.5 text-xs text-text-secondary">
              Gestione piani, atleti e progressi.
            </p>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>theme=&quot;teal&quot;</p>
        </div>

        {/* 2. Card stile teal — stile DS, accento su valore */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Card stile teal</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="mb-0.5 flex items-center gap-2 text-xs text-text-secondary">
                <Users className="h-3.5 w-3.5" />
                Atleti seguiti
              </div>
              <p className="text-xl font-bold text-teal-400">12</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="mb-0.5 flex items-center gap-2 text-xs text-text-secondary">
                <Salad className="h-3.5 w-3.5" />
                Piani attivi
              </div>
              <p className="text-xl font-bold text-emerald-400">8</p>
            </div>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>icon + label + valore</p>
        </div>
      </div>
    </div>
  )
}

function DashboardMassaggiatoreDesignElements() {
  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      <h4 className={DS_BLOCK_TITLE_CLASS}>
        Elementi di design solo in queste pagine (non ripetuti altrove)
      </h4>
      <p className={cn(DS_LABEL_CLASS, 'mb-4')}>
        Layout e componenti usati in /dashboard/massaggiatore, profilo, calendario, appuntamenti,
        chat, abbonamenti, statistiche. StaffContentLayout tema{' '}
        <code className={DS_CODE_CLASS}>amber</code>.
      </p>

      <div className="space-y-6">
        {/* 1. Header StaffContentLayout amber */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>StaffContentLayout — tema amber</h4>
          <div className="rounded-lg border border-white/10 bg-background/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <h1 className="text-lg font-bold tracking-tight text-primary">Dashboard Massaggio</h1>
            <p className="mt-0.5 text-xs text-text-secondary">
              Clienti, appuntamenti e statistiche.
            </p>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>theme=&quot;amber&quot;</p>
        </div>

        {/* 2. Greeting + KPI box */}
        <div className={DS_CARD_FRAME_CLASS}>
          <h4 className={DS_BLOCK_TITLE_CLASS}>Greeting + KPI box</h4>
          <p className="text-xs font-medium text-text-primary">Buongiorno, Nome!</p>
          <div className="mt-1 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-primary/20">
              <Hand className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-text-primary">I tuoi KPI Massaggio</h2>
              <p className="text-xs text-text-secondary">
                Metriche chiave per i clienti collegati.
              </p>
            </div>
          </div>
          <p className={cn(DS_LABEL_CLASS, 'mt-3')}>/dashboard/massaggiatore</p>
        </div>

        {/* 3. Stats cards + Azioni rapide */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <div className={DS_CARD_FRAME_CLASS}>
            <h4 className={DS_BLOCK_TITLE_CLASS}>Stats cards</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Clienti seguiti
                </p>
                <p className="mt-0.5 tabular-nums text-xl font-bold text-amber-400">6</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Prossimi 7 gg
                </p>
                <p className="mt-0.5 tabular-nums text-xl font-bold text-orange-400">4</p>
              </div>
            </div>
            <p className={cn(DS_LABEL_CLASS, 'mt-3')}>label + valore</p>
          </div>
          <div className={DS_CARD_FRAME_CLASS}>
            <h4 className={DS_BLOCK_TITLE_CLASS}>Azioni rapide</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" className="min-h-[44px] text-xs">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                Calendario
              </Button>
              <Button variant="outline" size="sm" className="min-h-[44px] text-xs">
                Appuntamenti
              </Button>
            </div>
            <p className={cn(DS_LABEL_CLASS, 'mt-3')}>
              DropdownMenu: Chat, Statistiche, Abbonamenti
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
