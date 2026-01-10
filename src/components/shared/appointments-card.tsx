import React from 'react'

interface AppointmentInfo {
  date: string
  title?: string
  subtitle?: string
}

interface AppointmentsCardProps {
  role: 'atleta' | 'staff'
  data?: AppointmentInfo | null
}

export const AppointmentsCard: React.FC<AppointmentsCardProps> = React.memo(({ role, data }) => {
  const backgroundClass = role === 'atleta' ? 'bg-teal-950' : 'bg-indigo-950'
  const heading = role === 'atleta' ? 'Prossimo allenamento' : 'Prossimo appuntamento'
  const dateLabel = data?.date ?? 'Nessun appuntamento programmato'

  return (
    <div className={`rounded-2xl p-4 shadow-md ${backgroundClass}`}>
      <h3 className="text-lg font-semibold mb-2">{heading}</h3>
      <p className="text-sm opacity-80">{dateLabel}</p>
      {data?.title && <p className="text-sm text-white/80 mt-1">{data.title}</p>}
      {data?.subtitle && <p className="text-xs text-white/60">{data.subtitle}</p>}
    </div>
  )
})

AppointmentsCard.displayName = 'AppointmentsCard'
