'use client'

export function ProfiloPageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Profilo
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          Gestisci il tuo profilo, notifiche e impostazioni
        </p>
      </div>
    </div>
  )
}
