'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Calendar, CreditCard, Dumbbell, LayoutDashboard, TableIcon } from 'lucide-react'
import { MetricCard } from '@/components'
import { Button } from '@/components/ui'
import {
  DashboardColumnEmpty,
  DashboardColumnPanel,
  DASHBOARD_ROW_LINK_CLASS,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import {
  DS_CARD_FRAME_CLASS,
  DS_LABEL_CLASS,
  DS_SECTION_INTRO_CLASS,
  DS_SECTION_TITLE_CLASS,
} from './helpers'

type ScreenDef = {
  id: string
  title: string
  route: string
  pattern: string
  preview: ReactNode
}

export function SectionScreens() {
  const screens: ScreenDef[] = [
    {
      id: 'screen-dashboard',
      title: 'Dashboard',
      route: '/dashboard',
      pattern: 'Pattern / Dashboard / Base',
      preview: (
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
          <MetricCard
            label="Oggi"
            value={6}
            icon={<Calendar className="h-4 w-4" />}
            tone="teal"
            variant="glass"
            compact
          />
          <div className="col-span-2 min-h-[88px] min-w-0 sm:col-span-2">
            <DashboardColumnPanel title="Agenda" badge={2}>
              <ul className="max-h-[72px] space-y-1 overflow-hidden py-0.5">
                {['Slot 09:00', 'Slot 11:30'].map((t) => (
                  <li key={t}>
                    <div className={`${DASHBOARD_ROW_LINK_CLASS} !py-1.5 text-xs`}>{t}</div>
                  </li>
                ))}
              </ul>
            </DashboardColumnPanel>
          </div>
        </div>
      ),
    },
    {
      id: 'screen-abbonamenti',
      title: 'Abbonamenti',
      route: '/dashboard/abbonamenti',
      pattern: 'Pattern / Table / Base',
      preview: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              title="Incasso mese"
              value="€ 0"
              icon={<CreditCard className="h-4 w-4" />}
              tone="emerald"
              variant="trainer"
              compact
            />
            <MetricCard
              title="Crediti"
              value={42}
              icon={<TableIcon className="h-4 w-4" />}
              tone="blue"
              variant="trainer"
              compact
            />
          </div>
          <DashboardColumnPanel title="Tabella atleti" badge={0}>
            <div className="text-xs">
              <DashboardColumnEmpty>Anteprima elenco</DashboardColumnEmpty>
            </div>
          </DashboardColumnPanel>
        </div>
      ),
    },
    {
      id: 'screen-pagamenti',
      title: 'Pagamenti',
      route: '/dashboard/pagamenti',
      pattern: 'Pattern / Table / Base + Pattern / Detail / Drawer',
      preview: (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            <MetricCard
              title="Entrate"
              value="€ 1.2k"
              icon={<CreditCard className="h-3.5 w-3.5" />}
              tone="emerald"
              variant="trainer"
              compact
            />
            <MetricCard
              title="Lezioni"
              value={24}
              icon={<TableIcon className="h-3.5 w-3.5" />}
              tone="blue"
              variant="trainer"
              compact
            />
            <MetricCard
              title="Movimenti"
              value={18}
              icon={<CreditCard className="h-3.5 w-3.5" />}
              tone="purple"
              variant="trainer"
              compact
            />
          </div>
          <p className="text-[10px] text-text-muted">Dettaglio riga → drawer (lazy)</p>
        </div>
      ),
    },
    {
      id: 'screen-calendario',
      title: 'Calendario',
      route: '/dashboard/calendario',
      pattern: 'Pattern / Dashboard / Base + Pattern / Detail / Drawer + Pattern / Form / Base',
      preview: (
        <div className="space-y-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2 text-center text-[10px] text-text-secondary">
            Vista calendario + filtri (sidebar / drawer)
          </div>
          <p className="text-[10px] text-text-muted">Popover / form appuntamento = Detail + Form</p>
        </div>
      ),
    },
    {
      id: 'screen-workouts',
      title: 'Workouts',
      route: '/dashboard/workouts',
      pattern: 'Pattern / Dashboard / Base + Pattern / Table / Base (slot)',
      preview: (
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <DashboardColumnPanel title="Colonna 1">
            <div className="text-xs">
              <DashboardColumnEmpty>Scheda / sessione</DashboardColumnEmpty>
            </div>
          </DashboardColumnPanel>
          <DashboardColumnPanel title="Colonna 2">
            <div className="text-xs">
              <DashboardColumnEmpty>Scheda / sessione</DashboardColumnEmpty>
            </div>
          </DashboardColumnPanel>
          <div className="col-span-2 flex items-center gap-2 text-[10px] text-text-muted">
            <Dumbbell className="h-3.5 w-3.5 shrink-0" />
            Agenda compatta sotto (stesso stack dashboard)
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="screens" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <LayoutDashboard className="h-6 w-6 text-primary" />
        Screens (prodotto)
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Cinque schermate core staff: route reali allineate ai pattern Fase 4 e ai componenti Fase 3
        (nessun nuovo primitive UI). Anteprima = composizione dimostrata, non iframe.
      </p>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {screens.map((s) => (
          <div
            key={s.id}
            className={`${DS_CARD_FRAME_CLASS} flex min-w-0 flex-col gap-3 p-3 sm:p-4`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{s.title}</h3>
                <p className={DS_LABEL_CLASS}>{s.pattern}</p>
                <code className="mt-1 block truncate text-[11px] text-primary/90">{s.route}</code>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href={s.route}>Apri</Link>
              </Button>
            </div>
            <div className="min-w-0 overflow-hidden rounded-md border border-white/5 bg-black/20 p-2">
              {s.preview}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
