// ============================================================
// Componente Header Calendario (FASE C - Split File Lunghi)
// ============================================================
// Estratto da calendario/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CalendarHeaderProps {
  // Nessuna prop necessaria al momento, ma manteniamo l'interfaccia per future estensioni
}

export function CalendarHeader({}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Calendario
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          Visualizza e gestisci i tuoi appuntamenti
        </p>
      </div>
    </div>
  )
}
