'use client'

import { Image } from 'lucide-react'
import { ProgressiNavCard } from '@/components/home/progressi-nav-card'
import { useAuth } from '@/providers/auth-provider'

const ICON_CLASS = 'h-4 w-4 sm:h-5 sm:w-5'
const CTA_ICON_CLASS = 'h-3 w-3 group-hover:translate-x-0.5 transition-transform'

interface AthleteProgressiNavSectionProps {
  athleteProfileId: string
  athleteDisplayName?: string
}

/** Solo “Foto progressi” (ruoli non trainer): misurazioni/statistiche nel card Riepilogo; storico nel tab Storico. */
export function AthleteProgressiNavSection({
  athleteProfileId,
  athleteDisplayName,
}: AthleteProgressiNavSectionProps) {
  const { role } = useAuth()
  const base = `/dashboard/atleti/${athleteProfileId}/progressi`

  if (role === 'trainer') {
    return null
  }

  const subtitle = athleteDisplayName
    ? `Stessa galleria disponibile per ${athleteDisplayName} in app.`
    : 'Stessa galleria disponibile per l’atleta in app.'

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="space-y-1">
        <h2 className="text-text-primary text-base sm:text-lg font-semibold tracking-tight">
          Foto progressi
        </h2>
        <p className="text-text-secondary text-sm leading-snug max-w-3xl">{subtitle}</p>
      </div>
      <div className="max-w-xl">
        <ProgressiNavCard
          href={`${base}/foto`}
          accent="emerald"
          icon={
            /* eslint-disable-next-line jsx-a11y/alt-text -- Lucide */
            <Image className={`${ICON_CLASS} text-emerald-400`} aria-hidden />
          }
          title="Foto progressi"
          description="Galleria e confronto per angolo di ripresa."
          ctaText="Apri foto"
          ctaIcon={
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image className={CTA_ICON_CLASS} aria-hidden />
          }
          density="compact"
        />
      </div>
    </section>
  )
}
