# STEP 0 — Baseline (da codice, non misure runtime)

## Pattern trasversale

- Quasi tutte le route dashboard trainer: `use client` → dati dopo hydration + fetch.
- Nessun `loading.tsx` sotto `src/app/dashboard/`.
- `dashboard/layout.tsx`: `Suspense` + spinner; `useRealtimeChannel('notifications')` (aggiornato: niente subscribe no-op su appointments/documents).

## Evidenze file

- `src/app/dashboard/layout.tsx` — Suspense fallback, realtime.
- `src/components/shared/dashboard/role-layout.tsx` — `TransitionWrapper` + `FadeInWrapper` (delay 0, duration breve).
- `src/components/shared/ui/transition-wrapper.tsx` — `AnimatePresence` + `key={pathname}`, framer-motion lazy.
- `next.config.ts` — `reactStrictMode: process.env.NODE_ENV === 'production'` (Strict in prod, motivazione Supabase auth in dev).

## Dashboard home

- `src/app/dashboard/page.tsx` — `useStaffTodayAgenda`.
- `src/hooks/use-staff-today-agenda.ts` — `getSession` → `fetchStaffTodayAgenda` (1 query `appointments`); poi `useLessonUsageByAthleteIds`; `visibilitychange` → refetch.

## Calendario

- `src/hooks/calendar/use-calendar-page.ts` — profilo staff async, settings, `fetchAppointments` + merge, `Promise.all` profili + 3 usage, atleti, blocchi.

## Note

- TTFB / React Profiler: solo con DevTools su ambiente reale.
