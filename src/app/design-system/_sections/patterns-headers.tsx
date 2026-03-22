'use client'

import { Activity, BarChart3, Layout, Dumbbell, TrendingUp } from 'lucide-react'
import { PageHeaderGlass, PageHeaderCompact, PageHeaderFixed } from '@/components/layout'
import { CardMetric } from '@/components/ui/card-metric'
import {
  DS_CARD_FRAME_CLASS,
  DS_SECTION_TITLE_CLASS,
  DS_SECTION_INTRO_CLASS,
  DS_BLOCK_TITLE_CLASS,
  DS_LABEL_CLASS,
} from './helpers'

export function PatternsHeaders() {
  return (
    <section id="headers" className="scroll-mt-24">
      <h2 className={DS_SECTION_TITLE_CLASS}>
        <Layout className="h-6 w-6 text-primary" />
        Headers
      </h2>
      <p className={DS_SECTION_INTRO_CLASS}>
        Header di pagina per area atleta e dashboard: Glass (teal), Compatto (cyan), Fisso (nero +
        linea). CardMetric per KPI.
      </p>

      <div className="space-y-6">
        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>PageHeaderGlass</h3>
          <p className={DS_LABEL_CLASS}>Teal, glass. Uso: /home, profilo, progressi.</p>
          <div className={DS_CARD_FRAME_CLASS}>
            <PageHeaderGlass
              title="Titolo pagina"
              subtitle="Sottotitolo"
              icon={<BarChart3 className="h-6 w-6 text-primary" />}
            />
          </div>
        </div>

        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>PageHeaderCompact</h3>
          <p className={DS_LABEL_CLASS}>Cyan, variante compatta.</p>
          <div className={DS_CARD_FRAME_CLASS}>
            <PageHeaderCompact
              title="Titolo"
              subtitle="Sottotitolo"
              icon={<Activity className="h-5 w-5 text-cyan-400" />}
            />
          </div>
        </div>

        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>PageHeaderFixed</h3>
          <p className={DS_LABEL_CLASS}>
            Nero, linea cyan in basso. Allenamenti, Appuntamenti, Foto.
          </p>
          <div className={DS_CARD_FRAME_CLASS}>
            <PageHeaderFixed
              title="I miei Allenamenti"
              subtitle="Programma e monitora i tuoi progressi"
              onBack={() => {}}
              icon={<Dumbbell className="h-5 w-5 text-cyan-400" />}
              static
            />
          </div>
        </div>

        <div>
          <h3 className={DS_BLOCK_TITLE_CLASS}>CardMetric</h3>
          <p className={DS_LABEL_CLASS}>KPI con barra accent (cyan, teal).</p>
          <div className={`${DS_CARD_FRAME_CLASS} space-y-4`}>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
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
      </div>
    </section>
  )
}
