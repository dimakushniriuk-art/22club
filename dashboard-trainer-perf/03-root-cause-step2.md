# STEP 2 — Root cause (sintesi)

| # | Problema | File principale | Categoria | Impatto |
|---|----------|-----------------|-----------|---------|
| 1 | Transizione `wait` tra route | `transition-wrapper.tsx` | Navigation / Rendering | Alto |
| 2 | Fade-in da opacity 0 dopo load framer | `FadeInWrapper` in `transition-wrapper.tsx` | Layout/UI | Alto |
| 3 | Ripetute risoluzioni sessione/profilo | auth + hook vari | Data fetching | Alto |
| 4 | N+1 `profiles` tab appuntemeti | `useStaffAppointmentsTable.ts` | Data / Supabase | Alto |
| 5 | Waterfall agenda → lesson usage | `use-staff-today-agenda.ts` | Data fetching | Medio |
| 6 | Refetch su `visibilitychange` | `use-staff-today-agenda.ts` | Data / State | Medio |
| 7 | Calendario: multi-effetto + molte query | `use-calendar-page.ts` | Data / State | Alto |
| 8 | Realtime senza invalidazione UI | `dashboard/layout` + hook | Supabase | Medio |
| 9 | Suspense globale spinner | `dashboard/layout.tsx` | Layout | Medio |
| 10 | StrictMode solo in prod | `next.config.ts` | Rendering | Medio |

RLS: nessuna evidenza specifica di policy lenta in questa analisi statica.
