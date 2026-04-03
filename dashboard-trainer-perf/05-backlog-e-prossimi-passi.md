# Backlog e prossimi passi

## In corso / priorità
1. _(Fatto 2026-03-30)_ **`useClienti`** → React Query + `src/lib/clienti/fetch-clienti-data.ts`; layout invalida `queryKeys.clienti` su realtime `profiles`.

## Completato in questa sessione
- **Verifica DB (MCP):** publication `supabase_realtime` senza tabelle `public` → realtime appuntamenti/profili non attivo; evidenza in **`07-supabase-realtime.md`** (SQL `ALTER PUBLICATION` da applicare a mano).
- Chunk `.in` su **`dashboard/nutrizionista`** (home, atleti, analisi, progressi, impostazioni, documenti, piani + storage folder UUID), **`piani/nuovo`**, **`massaggiatore`**, hook **`use-athlete-calendar-page`**.
- Chunk precedente: tab appuntamenti, calendario, widget lezioni, abbonamenti, **`use-workout-plans`**, **`use-chat-conversations`**.

## Completato in sessioni precedenti
- `use-calendar-page.ts` — profilo da `useAuth` + reset a logout.
- `use-staff-today-agenda.ts` — staff attore sotto impersonation; soglia 3s su visibility refetch.
- `use-staff-calendar-settings.ts` — stesso `staffSource` da `useAuth`.
- `use-clienti.ts` — `useAuth` + client `supabase` singleton; test aggiornato.
- Layout dashboard: rimossi realtime appointments/documents no-op.
- File `get-current-staff-profile-client.ts` rimosso.
- Agenda oggi: niente `getSession` prima della query appuntamenti.
- Realtime `appointments` nel layout: invalidate + evento cross-hook.
- Realtime `profiles` (atleti stessa org): refetch lista `/dashboard/clienti`.
- `RoleLayout`: `FadeInWrapper` senza delay artificiale.

## Rischi residui
- `.in(...)` ancora senza chunk: home allenamenti riepilogo, `use-allenamenti`, `use-workout-*`, API calendar/comms, `lib/communications/recipients.ts`, `lib/recurrence-management.ts`, ecc.
- `mode="sync"` sulle transizioni: crossfade; rollback locale se UX confusa su una route.

## STEP 5 Supabase/RLS
- Da fare con `EXPLAIN` / log su query lente in produzione (non eseguito in questa analisi).
- **Realtime publication:** applicata su 22Club-NEW + script **`supabase/manual_realtime_publication_dashboard.sql`**; dettaglio **`07-supabase-realtime.md`**.

## STEP 6 Validazione manuale
- Apertura / navigazione / refresh / impersonation admin.
