'use client'

import { Activity, BarChart3, Dumbbell, TrendingUp } from 'lucide-react'
import { PageHeaderGlass, PageHeaderCompact, PageHeaderFixed } from '@/components/layout'
import { CardMetric } from '@/components/ui/card-metric'

const cardFrameClass =
  'mb-10 space-y-8 overflow-hidden p-4 min-[834px]:p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] bg-surface-200/60 !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

export function PatternsHeaders() {
  return (
    <div className={cardFrameClass}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
        Elementi reali in uso
      </h3>
      <div>
        <p className="mb-1.5 text-xs font-medium text-text-tertiary">
          Header pagina — Variante Glass (teal)
        </p>
        <PageHeaderGlass
          title="Titolo pagina"
          subtitle="Sottotitolo"
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
        />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-text-tertiary">
          Header pagina — Variante Compatto (cyan)
        </p>
        <PageHeaderCompact
          title="Titolo"
          subtitle="Sottotitolo"
          icon={<Activity className="h-5 w-5 text-cyan-400" />}
        />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-text-tertiary">
          Header pagina — Fisso (Allenamenti, Appuntamenti, Foto). Nero, linea cyan in basso.
        </p>
        <PageHeaderFixed
          title="I miei Allenamenti"
          subtitle="Programma e monitora i tuoi progressi"
          onBack={() => {}}
          icon={<Dumbbell className="h-5 w-5 text-cyan-400" />}
          static
        />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-text-tertiary">
          Card con barra sinistra — 2 varianti (cyan, teal)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <CardMetric
            label="Label"
            value="42"
            accent="cyan"
            icon={<Activity className="h-4 w-4" />}
          />
          <CardMetric
            label="Altro"
            value="12"
            accent="teal"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  )
}
