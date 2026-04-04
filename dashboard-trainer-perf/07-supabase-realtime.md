# Supabase Realtime — checklist (dashboard layout)

Il layout staff sottoscrive **`appointments`**, **`profiles`** e **`notifications`** via `useRealtimeChannel`.

## Stato (progetto **22Club-NEW**, 2026-03-30)

- **Script unico (blocchi numerati):** `supabase/manual_realtime_publication_dashboard.sql` — da eseguire nel SQL Editor se replichi su altro ambiente o dopo restore.
- **Produzione:** applicati `ALTER PUBLICATION` per `public.appointments`, `public.profiles`, `public.notifications` — verifica post:

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
ORDER BY tablename;
```

(atteso: `appointments`, `notifications`, `profiles`).

## Verifica in Supabase Dashboard

1. **Database → Publications** → `supabase_realtime` → includere le stesse tabelle `public` se mancanti.

## Nota SQL

Se `ADD TABLE` risponde _already member of publication_, la tabella è già nella publication.

**RLS:** le policy valgono anche per Realtime.

**Layout:** realtime su `profiles` → `invalidateQueries` `queryKeys.clienti` (React Query).
