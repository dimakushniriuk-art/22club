# STEP 3–4 — Interventi applicati (2026-03-30)

## Batch 1

### `src/hooks/appointments/useStaffAppointmentsTable.ts`
- Profilo staff da **`useAuth`**, con **`staffSource = isImpersonating && actorProfile ? actorProfile : authUser`** (equivalente a vecchia `getUser` + riga profilo attore).
- Reset stato quando `authLoading` finito senza utente.
- **Batch** `profiles.in('id', athleteIds)` al posto di N query per appuntamento.

### `src/components/shared/ui/transition-wrapper.tsx`
- `TransitionWrapper`: **`mode="sync"`**, durata ~**0.22s**, varianti più leggere.
- `FadeInWrapper`: **`initial={false}`** per evitare flash opacity 0 dopo primo paint.

## Verifica
- `npm run typecheck` ✓
- `npm run lint` ✓

## Batch 2 (2026-03-30)

### `src/hooks/calendar/use-calendar-page.ts`
- Profilo staff da **`useAuth`** con stesso **`staffSource`** (impersonation → `actorProfile`).
- Rimosso `getCurrentStaffProfileClient` da questo hook; reset liste/boolean loading e `calendarBlocks` a logout.

### `src/hooks/use-staff-today-agenda.ts`
- **`staffProfileId`** da `staffAuth` (attore se impersonation) — allineato alle altre viste staff.
- **`visibilitychange`**: refetch solo se il tab è stato in background ≥ **3s** (evita doppio carico su alt-tab veloci).

## Batch 3 (2026-03-30)

### `src/hooks/calendar/use-staff-calendar-settings.ts`
- Caricamento `staff_profile_id` / `org_id` e fetch `staff_calendar_settings` da **`useAuth`** + **`staffSource`** (stesso modello impersonation).
- Nessun import di `getCurrentStaffProfileClient`.

## Batch 4 (2026-03-30)

### `src/hooks/use-clienti.ts`
- **`useAuth`** + `supabase` da `@/lib/supabase/client` al posto di **`useSupabase`** (un solo canale auth con AuthProvider).
- Gate: `userId = authProfile?.user_id ?? authProfile?.id` (compatibile con sessione + RLS).
- Dipendenze hook: rimosso `supabase` dagli array (singleton, warning eslint).

### `src/hooks/__tests__/use-clienti.test.ts`
- Mock `useAuth` + `supabase`; `vi.hoisted` per `mockSupabase`.

## Batch 5 (2026-03-30)

### `src/app/dashboard/layout.tsx`
- Rimosse **`useAppointmentsRealtime`** e **`useDocumentsRealtime`**: callback erano vuoti (nessun aggiornamento UI), solo canali Supabase attivi su ogni vista staff.

### `src/hooks/useRealtimeChannel.ts`
- Eliminati export **`useAppointmentsRealtime`** e **`useDocumentsRealtime`** (dead code).

### `tests/unit/realtime-hooks.test.tsx`
- Rimossi test sugli hook eliminati.

Resta **`useRealtimeChannel('notifications', …)`** nel layout (toast su INSERT).

## Batch 6 (2026-03-30)

- Rimosso **`src/lib/supabase/get-current-staff-profile-client.ts`** (nessun import in `src/`; sostituito da `useAuth` nei hook calendario/settings/appuntamenti/agenda).

## Batch 7 (2026-03-30)

### `src/hooks/use-staff-today-agenda.ts`
- Rimosso **`getSession()`** prima di `fetchStaffTodayAgenda` (mount, visibility refetch, `reload`): una round-trip in meno; sessione JWT già sul client dopo `AuthProvider`.

## Batch 8 (2026-03-30) — Realtime appuntamenti utile

### `src/lib/staff-cross-tab-events.ts` (nuovo)
- Costante evento window **`STAFF_APPOINTMENTS_INVALIDATE_EVENT`** + tipo `detail`.

### `src/app/dashboard/layout.tsx`
- **`useRealtimeChannel('appointments')`**: se `org_id` della riga coincide con `useAuth().org_id`, dopo throttle **~450ms** → `queryClient.invalidateQueries(queryKeys.appointments.all)` + `CustomEvent` per hook non–React Query.

### Hook che ascoltano l’evento
- `use-staff-today-agenda.ts` → `reload()`
- `use-calendar-page.ts` → `fetchAppointments()`
- `useStaffAppointmentsTable.ts` → `fetchAppointments()`

## Batch 9 (2026-03-30) — Clienti / `profiles` realtime

- `staff-cross-tab-events.ts`: **`STAFF_CLIENTI_INVALIDATE_EVENT`**.
- `dashboard/layout.tsx`: **`useRealtimeChannel('profiles')`**, filtro `org_id` + ruolo `athlete` / `atleta`, throttle 600ms, **`CustomEvent` solo** (nessun `invalidateQueries` su `clienti.*`: lista usa ancora stato locale).
- `use-clienti.ts`: opzione **`subscribeOrgAthleteProfilesRefresh`** (default false); listener refetch.
- `dashboard/clienti/page.tsx`: **`subscribeOrgAthleteProfilesRefresh: true`** (solo lista principale, non i modal).

## Batch 10 (2026-03-30) — Shell staff più reattiva

### `src/components/shared/dashboard/role-layout.tsx`
- **`FadeInWrapper`**: `delay` da 0.1/0.2 a **0**, `duration` **0.2** (meno attesa percepita sidebar/main).

## Batch 11 (2026-03-30) — Chunk `.in` / insert massivi

- **Calendario staff** (`use-calendar-page`): insert ricorrenti resta **monolitico** (atomicità); dimensione batch limitata dal prodotto (≤100 slot / ~53 settimane anno). Se i cap cambiano, rivalutare body gateway o RPC.
- **Recipients / schede**: note in codice su **stato intermedio** se fallisce un chunk a metà sequenza (`createCommunicationRecipients`, `use-workout-plans` create+update).

## Non ancora fatto (vedi backlog)
- Opzionale: filtro postgres su notifiche per utente, se il volume è alto.
