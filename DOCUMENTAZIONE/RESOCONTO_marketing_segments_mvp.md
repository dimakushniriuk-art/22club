# Resoconto: Marketing Segments (MVP – Punto 11.2.2)

**Data:** 2026-02-28  
**Obiettivo:** Sezione Marketing → Segmenti, MVP completo e sicuro. Solo view `marketing_athletes` e tabella `marketing_segments`.

---

## 1) File creati/modificati

| File | Modifica |
|------|----------|
| `supabase/migrations/20260228230000_marketing_segments.sql` | **Nuovo.** Tabella `marketing_segments`, indici, RLS (SELECT/INSERT/UPDATE/DELETE per admin/marketing stesso org_id). |
| `src/lib/supabase/types.ts` | Aggiunta tabella `marketing_segments` (Row, Insert, Update). |
| `src/lib/marketing/segment-rules.ts` | **Nuovo.** Tipo `SegmentRules`, tipo `MarketingAthleteForFilter`, funzione `applySegmentRules()` (filtro client-side). |
| `src/app/dashboard/marketing/segments/page.tsx` | **Nuovo.** Lista segmenti, #atleti stimati, toggle attivo, pulsante Nuovo segmento. |
| `src/app/dashboard/marketing/segments/new/page.tsx` | **Nuovo.** Form nuovo segmento (nome, descrizione, builder regole), salvataggio su `marketing_segments`. |
| `src/app/dashboard/marketing/segments/[id]/page.tsx` | **Nuovo.** Dettaglio segmento, tabella atleti filtrati (da view), pulsanti Modifica e Disattiva. |
| `src/app/dashboard/marketing/segments/[id]/edit/page.tsx` | **Nuovo.** Form modifica segmento (stesso schema regole), update su `marketing_segments`. |
| `src/components/shared/dashboard/sidebar.tsx` | Voce "Segmenti" (icona Layers) → `/dashboard/marketing/segments`. |
| `src/components/shared/dashboard/dashboard-mobile-nav.tsx` | Voce "Segmenti" (icona Layers) → `/dashboard/marketing/segments`. |
| `src/middleware.ts` | Allowlist marketing: `/dashboard/marketing/segments` (e sotto-path). |

---

## 2) Migration e RLS

**Tabella `marketing_segments`**

- `id` uuid PK default gen_random_uuid()
- `org_id` text NOT NULL
- `name` text NOT NULL
- `description` text NULL
- `rules` jsonb NOT NULL default '{}'
- `is_active` boolean NOT NULL default true
- `created_at`, `updated_at` timestamptz default now()

**Policies (RLS)**

- **SELECT:** `org_id = (SELECT org_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)` e ruolo in ('admin', 'marketing').
- **INSERT:** stesso org_id e ruolo.
- **UPDATE / DELETE:** stesso org_id e ruolo.

---

## 3) Query usate

- **Segmenti:** `supabase.from('marketing_segments').select('*').order('updated_at', { ascending: false })`; update/insert/delete su `marketing_segments`.
- **Atleti (lista e dettaglio):** `supabase.from('marketing_athletes').select('*')`.
- Nessuna lettura da: `workout_logs`, `workout_plans`, `athlete_*_data`, chat, progress_photos. Fonte atleti/KPI solo view `marketing_athletes`. Filtro segmento applicato client-side con `applySegmentRules(athletes, segment.rules)`.

---

## 4) Regole segmento (rules jsonb)

- `inactivity_days`: number (es. 30)
- `min_workouts_coached_7d`, `min_workouts_solo_7d`, `min_workouts_coached_30d`, `min_workouts_solo_30d`: number
- `last_workout_exists`: boolean

Logica: atleta incluso se rispetta tutte le regole impostate (AND). Conteggio atleti stimato e lista in dettaglio ottenuti filtrando client-side i risultati della view.

---

## 5) Checklist test (admin / marketing)

- [ ] **Crea segmento:** Login come admin o marketing → Segmenti → Nuovo segmento → compila nome, opzionale descrizione e regole → Salva. Il segmento compare in lista.
- [ ] **Lista:** Verificare nome, stato (Attivo/Disattivo), #atleti stimati, data aggiornamento. Toggle attivo/disattivo funziona.
- [ ] **Dettaglio:** Dal segmento in lista → Dettaglio. Tabella atleti mostra solo quelli che rispettano le regole (stessi dati della view, filtrati in client). Pulsanti Modifica e Disattiva funzionano.
- [ ] **Modifica:** Da dettaglio → Modifica → cambia nome/descrizione/regole → Salva. Dettaglio aggiornato; conteggio e lista atleti coerenti con le nuove regole.
- [ ] **RLS – org:** Con utente di org A non si vedono segmenti di org B. Creare segmento richiede org_id dell’utente (RLS INSERT); segmenti visibili solo con stesso org_id (RLS SELECT).
