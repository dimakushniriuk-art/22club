'use client'

export function ImpostazioniPageHeader() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-text-primary text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
        Impostazioni
      </h1>
      <p className="text-text-secondary text-base sm:text-lg">
        Gestisci le tue preferenze e configurazioni account
      </p>
    </div>
  )
}
