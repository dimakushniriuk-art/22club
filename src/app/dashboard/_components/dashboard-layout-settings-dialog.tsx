'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Dumbbell, Gauge, MessageSquare, Settings } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Switch,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_QUICK_ACTION_CARD_CLASS,
} from './dashboard-quick-actions-config'
import { DASHBOARD_COLUMN_PANEL_CLASS } from './dashboard-widget-columns'
import type {
  StaffDashboardLayoutPrefs,
  StaffDashboardQuickActionId,
  StaffDashboardWidgetId,
} from '@/lib/dashboard/staff-dashboard-layout-prefs'

const WIDGET_BLOCKS: {
  id: StaffDashboardWidgetId
  title: string
  hint: string
  icon: LucideIcon
  iconBoxClass: string
}[] = [
  {
    id: 'agendaToday',
    title: 'Agenda di oggi',
    hint: 'Appuntamenti e timeline della giornata',
    icon: CalendarDays,
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    id: 'expiringPrograms',
    title: 'Schede in scadenza',
    hint: 'Schede in chiusura o ciclo sessioni critico',
    icon: Dumbbell,
    iconBoxClass: 'border-amber-500/30 bg-amber-500/20 text-amber-400',
  },
  {
    id: 'lowLessons',
    title: 'Lezioni in esaurimento',
    hint: 'Atleti con poche lezioni training residue',
    icon: Gauge,
    iconBoxClass: 'border-orange-500/30 bg-orange-500/20 text-orange-300',
  },
  {
    id: 'unreadChats',
    title: 'Messaggi non letti',
    hint: 'Chat con messaggi da leggere',
    icon: MessageSquare,
    iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
  },
]

function stopSwitchBubble(e: React.SyntheticEvent) {
  e.stopPropagation()
}

type DashboardLayoutSettingsDialogProps = {
  prefs: StaffDashboardLayoutPrefs
  setQuickVisible: (id: StaffDashboardQuickActionId, visible: boolean) => void
  setWidgetVisible: (id: StaffDashboardWidgetId, visible: boolean) => void
  resetLayout: () => void
}

export function DashboardLayoutSettingsDialog({
  prefs,
  setQuickVisible,
  setWidgetVisible,
  resetLayout,
}: DashboardLayoutSettingsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-text-secondary hover:bg-white/10 hover:text-text-primary"
        aria-label="Personalizza dashboard"
        title="Personalizza dashboard"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-5 w-5" aria-hidden />
      </Button>
      <DialogContent className="max-h-[min(90dvh,52rem)] max-w-[min(36rem,calc(100vw-2rem))] overflow-y-auto">
        <DialogHeader className="space-y-1 pr-8">
          <DialogTitle>Personalizza dashboard</DialogTitle>
          <DialogDescription>
            Stesso aspetto delle tile e dei pannelli: tocca una card o usa l’interruttore. Salvato su
            questo dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 pb-1">
          <section aria-labelledby="dash-settings-quick-heading">
            <div className="mb-3 flex items-end justify-between gap-2 border-b border-white/[0.08] pb-2.5">
              <h2
                id="dash-settings-quick-heading"
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/90 sm:text-xs"
              >
                Blocchi scorciatoie
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {DASHBOARD_QUICK_ACTIONS.map((item) => {
                const on = prefs.quick[item.id]
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    onClick={() => setQuickVisible(item.id, !on)}
                    className={cn(
                      DASHBOARD_QUICK_ACTION_CARD_CLASS,
                      'relative cursor-pointer select-none touch-manipulation pt-7 sm:pt-8',
                      on
                        ? 'ring-1 ring-cyan-500/30 border-white/[0.12]'
                        : 'opacity-[0.38] saturate-[0.65] border-white/[0.06]',
                    )}
                  >
                    <div
                      className="absolute right-1.5 top-1.5 z-10 sm:right-2 sm:top-2"
                      onClick={stopSwitchBubble}
                    >
                      <Switch
                        checked={on}
                        onCheckedChange={(v) => setQuickVisible(item.id, v)}
                        aria-label={`${item.label}, ${on ? 'visibile' : 'nascosto'}`}
                      />
                    </div>
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                        item.iconBoxClass,
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <span className="mt-1.5 block px-1 text-[10px] font-semibold leading-tight text-text-primary sm:mt-2 sm:text-[11px]">
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="dash-settings-panels-heading">
            <div className="mb-3 flex items-end justify-between gap-2 border-b border-white/[0.08] pb-2.5">
              <h2
                id="dash-settings-panels-heading"
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/90 sm:text-xs"
              >
                Blocchi pannelli
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {WIDGET_BLOCKS.map((block) => {
                const on = prefs.widgets[block.id]
                const Icon = block.icon
                return (
                  <div
                    key={block.id}
                    onClick={() => setWidgetVisible(block.id, !on)}
                    className={cn(
                      DASHBOARD_COLUMN_PANEL_CLASS,
                      'relative min-h-[5.75rem] cursor-pointer select-none p-3 text-left touch-manipulation sm:min-h-[6rem] sm:p-4',
                      on
                        ? 'ring-1 ring-cyan-500/25 border-white/[0.12]'
                        : 'opacity-[0.38] saturate-[0.65] border-white/[0.06]',
                    )}
                  >
                    <div
                      className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3"
                      onClick={stopSwitchBubble}
                    >
                      <Switch
                        checked={on}
                        onCheckedChange={(v) => setWidgetVisible(block.id, v)}
                        aria-label={`${block.title}, ${on ? 'visibile' : 'nascosto'}`}
                      />
                    </div>
                    <div className="flex min-w-0 items-start gap-2.5 pr-10">
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10',
                          block.iconBoxClass,
                        )}
                      >
                        <Icon className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="text-[11px] font-semibold uppercase leading-snug tracking-[0.06em] text-text-secondary/95 sm:text-xs">
                          {block.title}
                        </h3>
                        <p className="mt-1 text-[10px] leading-snug text-text-tertiary sm:text-[11px]">
                          {block.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <DialogFooter className="mt-6 flex-col gap-2 border-t border-white/[0.06] pt-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => resetLayout()}
          >
            Ripristina predefinito
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={() => setOpen(false)}>
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
