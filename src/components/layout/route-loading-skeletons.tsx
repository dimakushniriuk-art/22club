/**
 * Skeleton riutilizzabili per `loading.tsx` dei segmenti App Router (Server Components).
 */

/**
 * Staff — scheda atleta (`/dashboard/atleti/[id]/*`): header compatto + area contenuto.
 * Usato da `loading.tsx` del segmento e da pagine client durante fetch profilo.
 */
export function StaffAthleteSegmentSkeleton() {
  return (
    <div
      className="relative min-h-0 flex-1 flex flex-col bg-transparent"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="mx-auto flex w-full min-w-0 max-w-[min(100%,2160px)] flex-1 flex-col space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 min-h-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.06] animate-pulse"
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <div className="h-5 sm:h-6 w-[min(320px,70vw)] rounded-md bg-white/[0.08] animate-pulse" />
              <div className="h-3.5 w-[min(480px,85vw)] rounded-md bg-white/[0.05] animate-pulse" />
            </div>
          </div>
          <div
            className="hidden h-9 w-32 rounded-lg bg-white/[0.06] animate-pulse sm:block"
            aria-hidden
          />
        </div>
        <div className="min-h-[min(40dvh,360px)] rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-white/[0.08]" />
          <div className="h-32 rounded-lg bg-white/[0.05]" />
          <div className="h-24 rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    </div>
  )
}

/** Allineato a StaffContentLayout + griglia tipo dashboard/prenotazioni. */
export function StaffDashboardSegmentSkeleton() {
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col bg-transparent"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div
        className={[
          'mx-auto flex w-full min-w-0 max-w-[min(100%,2160px)] flex-1 flex-col space-y-4 px-3 py-3 sm:space-y-6 sm:px-4 sm:py-4 md:space-y-8 md:px-6 md:py-6',
          'pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]',
          'pb-[max(1rem,env(safe-area-inset-bottom))]',
        ].join(' ')}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-x-2 sm:gap-x-2.5">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 sm:h-6 md:h-7 w-[min(280px,55vw)] rounded-md bg-white/[0.08] animate-pulse" />
              <div className="h-3 sm:h-4 w-[min(420px,80vw)] rounded-md bg-white/[0.05] animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-full sm:w-36 rounded-lg bg-white/[0.06] animate-pulse" />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="lg:col-span-1 min-h-[min(52dvh,440px)] rounded-xl border border-white/10 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-32 rounded bg-white/[0.08] mb-4" />
              <div className="space-y-2">
                <div className="h-14 rounded-lg bg-white/[0.05]" />
                <div className="h-14 rounded-lg bg-white/[0.05]" />
                <div className="h-14 rounded-lg bg-white/[0.05]" />
              </div>
            </div>
            <div className="min-h-[min(52dvh,440px)] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
            <div className="min-h-[min(52dvh,440px)] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 min-h-[200px] animate-pulse">
            <div className="h-4 w-24 rounded bg-white/[0.08] mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-white/[0.06]" />
                  <div className="mt-3 h-3 w-2/3 mx-auto rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Staff — marketing (`/dashboard/marketing/*`): allineato a padding e `bg-background` delle pagine marketing.
 */
export function StaffMarketingSegmentSkeleton() {
  return (
    <div
      className="min-h-[min(70dvh,560px)] space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="space-y-2">
        <div className="h-7 w-[min(280px,70vw)] rounded-md bg-white/[0.08] animate-pulse sm:h-8" />
        <div className="h-4 w-[min(420px,90vw)] rounded-md bg-white/[0.06] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse"
            aria-hidden
          />
        ))}
      </div>
      <div
        className="min-h-[min(35dvh,280px)] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse"
        aria-hidden
      />
    </div>
  )
}

/**
 * Staff — area admin (`/dashboard/admin/*`): allineato a `container mx-auto p-6` delle pagine admin.
 */
export function StaffAdminSegmentSkeleton() {
  return (
    <div
      className="container mx-auto w-full max-w-[min(100%,2160px)] space-y-6 p-6"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="space-y-2">
        <div className="h-8 w-[min(280px,70vw)] rounded-md bg-white/[0.08] animate-pulse sm:h-9" />
        <div className="h-4 w-[min(400px,85vw)] rounded-md bg-white/[0.05] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse"
            aria-hidden
          />
        ))}
      </div>
      <div
        className="min-h-[min(45dvh,400px)] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse"
        aria-hidden
      />
    </div>
  )
}

/** Area dati sotto header già visibile (liste/KPI marketing). */
export function StaffMarketingDataBlockSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Caricamento">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse"
            aria-hidden
          />
        ))}
      </div>
      <div
        className="min-h-[min(40dvh,320px)] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse"
        aria-hidden
      />
    </div>
  )
}

/**
 * Durante il guard ruolo staff (massaggiatore / nutrizionista): stesso layout del segmento dashboard,
 * senza schermo vuoto né pannello `bg-background` a tutta pagina.
 */
export function StaffDashboardGuardSkeleton() {
  return <StaffDashboardSegmentSkeleton />
}

/**
 * Solo area contenuto sotto `StaffContentLayout` (tema amber staff): KPI + blocco principale.
 */
export function StaffStaffPageContentSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6" aria-busy="true" aria-label="Caricamento">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="min-h-[6.5rem] sm:min-h-[7.5rem] rounded-xl border-2 border-amber-500/25 bg-white/[0.03] animate-pulse"
            aria-hidden
          />
        ))}
      </div>
      <div
        className="min-h-[min(40dvh,320px)] rounded-xl border-2 border-amber-500/25 bg-white/[0.03] animate-pulse"
        aria-hidden
      />
    </div>
  )
}

/**
 * Solo area sotto `<main>` di `home-layout-client` (chrome già fuori dal fallback Suspense).
 * Usare in `src/app/home/loading.tsx` per evitare doppio header e flash di layout.
 */
export function HomeAthletePageContentSkeleton() {
  return (
    <div
      className="relative flex min-h-[min(45dvh,400px)] flex-1 flex-col bg-background w-full min-w-0"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="mx-auto flex w-full min-w-0 max-w-[1800px] flex-1 flex-col space-y-4 px-3 pb-6 sm:space-y-6 sm:px-4 min-[834px]:px-6">
        <div className="h-36 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse sm:h-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-xl border border-white/10 bg-white/[0.03] animate-pulse"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Shell completa (header finto + main): solo per fallback isolati senza `HomeLayoutClient`.
 * Per navigazione `/home/*` preferire `HomeAthletePageContentSkeleton` in `loading.tsx`.
 */
export function HomeAthleteSegmentSkeleton() {
  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden bg-background"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <header className="sticky top-0 z-50 shrink-0 border-b border-white/10 bg-black">
        <div className="flex items-center gap-3 px-3 sm:px-4 min-[834px]:px-6 py-2.5 sm:py-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-[min(200px,50vw)] rounded-md bg-white/[0.08] animate-pulse" />
            <div className="h-3 w-[min(280px,70vw)] rounded-md bg-white/[0.05] animate-pulse" />
          </div>
          <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.06] animate-pulse" />
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col bg-background px-3 sm:px-4 min-[834px]:px-6 pt-4 sm:pt-6 pb-6">
        <div className="space-y-4 sm:space-y-6 max-w-[1800px] mx-auto w-full min-w-0 flex-1">
          <div className="h-40 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

/** Layout embed minimale. */
export function EmbedSegmentSkeleton() {
  return (
    <div
      className="min-h-dvh bg-background text-text-primary flex flex-col p-3 sm:p-4"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="flex-1 min-h-[50dvh] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
    </div>
  )
}

/**
 * Embed — allenamenti atleta (`/embed/athlete-allenamenti/[athleteProfileId]/*`):
 * header compatto + lista card, allineato alla shell `min-h-dvh` del layout embed.
 */
export function EmbedAthleteAllenamentiPageSkeleton() {
  return (
    <div
      className="min-h-dvh w-full min-w-0 bg-background text-text-primary flex flex-col p-3 sm:p-4 space-y-4"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-10 w-10 rounded-xl bg-white/[0.06] animate-pulse shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-[min(220px,55vw)] rounded-md bg-white/[0.08] animate-pulse" />
          <div className="h-3 w-[min(180px,45vw)] rounded-md bg-white/[0.05] animate-pulse" />
        </div>
      </div>
      <div className="space-y-3 flex-1 min-h-0">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="min-h-[100px] rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse"
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}

/** Login, registrati, forgot/reset password. */
export function AuthCardSegmentSkeleton() {
  return (
    <div
      className="min-h-dvh bg-background flex items-center justify-center p-4 page-login"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="h-8 w-32 mx-auto rounded-lg bg-white/[0.08] animate-pulse" />
        <div className="h-11 w-full rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-11 w-full rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-11 w-full rounded-lg bg-cyan-500/20 animate-pulse" />
      </div>
    </div>
  )
}

/** Privacy, termini — colonna prose (fallback compatto). */
export function SimpleDocumentSegmentSkeleton() {
  return (
    <div
      className="min-h-dvh bg-background px-4 py-8 sm:py-12"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-white/[0.08] animate-pulse" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-full rounded bg-white/[0.05] animate-pulse" />
        ))}
        <div className="h-3 w-4/5 rounded bg-white/[0.05] animate-pulse" />
      </div>
    </div>
  )
}

/** Privacy / termini — allineato a header + card `max-w-3xl` delle pagine legali. */
export function LegalDocumentPageSkeleton() {
  return (
    <div
      className="flex min-h-full min-w-0 w-full flex-1 flex-col bg-background text-text-primary"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <div className="h-5 w-28 rounded-md bg-white/[0.08] animate-pulse" />
        <div className="h-10 w-[120px] rounded-md bg-white/[0.06] animate-pulse" />
        <div className="w-24 shrink-0" aria-hidden />
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl min-h-[min(50dvh,420px)] animate-pulse space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="h-7 w-3/4 max-w-sm rounded-lg bg-white/[0.08]" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 w-full rounded bg-white/[0.05]" />
          ))}
        </div>
      </main>
    </div>
  )
}

/** Root `/` durante redirect a login (stesso feedback della vecchia `page` client). */
export function RootRedirectSegmentSkeleton() {
  return (
    <div
      className="flex min-h-full w-full flex-1 items-center justify-center bg-background"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent mx-auto mb-4" />
        <p className="text-text-secondary text-sm">Caricamento...</p>
      </div>
    </div>
  )
}

/** `/welcome` — onboarding (gradient + spinner, allineato a `WelcomePageFallback` in page). */
export function WelcomeOnboardingSegmentSkeleton() {
  return (
    <div
      className="flex min-h-full w-full flex-1 flex-col items-center justify-center bg-gradient-to-br from-background via-background-secondary to-background text-text-primary"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div
        className="h-8 w-8 rounded-full border-2 border-white/20 border-t-primary animate-spin"
        aria-hidden
      />
      <p className="mt-3 text-sm text-text-secondary">Caricamento...</p>
    </div>
  )
}

/** Design system — griglia sezioni. */
export function DesignSystemSegmentSkeleton() {
  return (
    <div
      className="min-h-dvh bg-background px-4 py-6 sm:px-6"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-64 rounded-lg bg-white/[0.08] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Pagine generiche / debug. */
export function GenericPageSegmentSkeleton() {
  return (
    <div className="min-h-dvh bg-background px-4 py-8" aria-busy="true" aria-label="Caricamento">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="h-7 w-48 rounded-lg bg-white/[0.08] animate-pulse" />
        <div className="h-24 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
      </div>
    </div>
  )
}

/** Fallback compatto per `Suspense` attorno a chunk lazy (tab, modali, drawer). */
export function StaffLazyChunkFallback({
  className = '',
  label = 'Caricamento…',
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={[
        'flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-zinc-950/85 p-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-cyan-500/35 border-t-cyan-400"
        aria-hidden
      />
      <p className="text-center text-xs text-text-secondary">{label}</p>
    </div>
  )
}
