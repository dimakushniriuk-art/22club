# Resoconto: Pagina /dashboard/marketing/athletes

**Data:** 2026-02-28  
**Obiettivo:** Pagina reale che usa esclusivamente la view `public.marketing_athletes`.

---

## 1) File creati/modificati

| File | Modifica |
|------|----------|
| `src/app/dashboard/marketing/athletes/page.tsx` | **Nuovo.** Pagina client: fetch da `marketing_athletes`, KPI cards, tabella, search client-side, loading/empty. |
| `src/lib/supabase/types.ts` | Aggiunta view `marketing_athletes` in `Views` con Row: athlete_id, first_name, last_name, email, workouts_7d_coached, workouts_7d_solo, workouts_30d_coached, workouts_30d_solo, last_workout_at. |
| `src/middleware.ts` | Aggiunto path `/dashboard/marketing/athletes` alla allowlist per ruolo marketing/admin. |
| `src/components/shared/dashboard/sidebar.tsx` | Voce "Atleti" con icona Users, href `/dashboard/marketing/athletes`. |
| `src/components/shared/dashboard/dashboard-mobile-nav.tsx` | Voce "Atleti" con icona Users, href `/dashboard/marketing/athletes`. |

---

## 2) Query usate

**Unica fonte dati (client Supabase, RLS):**

```ts
supabase
  .from('marketing_athletes')
  .select('*')
  .order('last_workout_at', { ascending: false, nullsFirst: false })
```

- Nessuna query su `workout_logs`, `workout_plans`, `athlete_*_data` o altre tabelle raw.
- Nessuna API route dedicata: la pagina usa solo il client Supabase standard (RLS attiva sulla view / sottostante).

---

## 3) Funzionalità implementate

- **Fetch:** Dati dalla view `marketing_athletes`; ordinamento `last_workout_at DESC NULLS LAST`.
- **Filtro periodo:** 7 giorni / 30 giorni; influenza solo quale colonna "Workout Xd" è mostrata nella prima colonna dati (la colonna "Workout 30d" resta fissa).
- **KPI cards:** Totale atleti; Totale workout con trainer (30d); Totale workout da solo (30d); Atleti inattivi (last_workout_at null o > 30 giorni).
- **Tabella:** Nome (first_name + last_name), Email, Workout 7d (coach/solo), Workout 30d (coach/solo), Ultimo workout, Stato (ATTIVO / INATTIVO).
- **Search:** Client-side su nome e email.
- **Loading:** Spinner durante il fetch.
- **Empty state:** Messaggio se nessun atleta o nessun risultato di ricerca.

---

## 4) Controllo assenza dati raw

- **Non usati:** `workout_logs`, `workout_plans`, `athlete_*_data`, `profiles` (direct), qualsiasi altra tabella raw.
- **Usato solo:** `public.marketing_athletes` (view) via `supabase.from('marketing_athletes').select(...)`.
- **Client:** `useSupabaseClient()`; nessun service role lato client.

---

## 5) Prerequisito view

La view `public.marketing_athletes` deve esistere e esporre (almeno) le colonne:

- `athlete_id`, `first_name`, `last_name`, `email`
- `workouts_coached_7d`, `workouts_solo_7d`, `workouts_coached_30d`, `workouts_solo_30d`
- `last_workout_at`

Se la view usa nomi diversi (es. `nome`/`cognome`), aggiornare i tipi in `types.ts` e il mapping nella pagina (first_name/last_name) di conseguenza.

---

## 6) Fix allineamento nomi colonne (DB reale)

La view DB espone: `workouts_coached_7d`, `workouts_solo_7d`, `workouts_coached_30d`, `workouts_solo_30d` (non `workouts_7d_coached` ecc.). Sono stati aggiornati `types.ts` (Views.marketing_athletes.Row) e la pagina atleti per usare questi nomi. La query resta solo su `marketing_athletes`.
