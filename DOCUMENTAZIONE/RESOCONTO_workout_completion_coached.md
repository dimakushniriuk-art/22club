# Resoconto: Workout completato – Con trainer / Da solo

**Data:** 2026-02-28  
**Obiettivo:** Distinguere in DB e UX gli allenamenti "Eseguito con Trainer" vs "Eseguito da Solo".

---

## 1) File modificati

| File | Modifica |
|------|----------|
| `supabase/migrations/20260228220000_workout_logs_completion_coached.sql` | **Nuovo.** Colonne `is_coached`, `coached_by_profile_id`, `completed_at`; backfill; indici; trigger UPDATE atleta. |
| `src/app/home/allenamenti/oggi/page.tsx` | Chiamata `get_my_trainer_profile` se "Con trainer"; payload insert con `is_coached`, `coached_by_profile_id`, `completed_at`. |
| `src/components/workout/trainer-session-modal.tsx` | Nessuna modifica (già modal obbligatoria "Con trainer" / "Eseguito da solo"). |
| `src/app/home/progressi/storico/page.tsx` | Select `is_coached`, `completed_at`; interfaccia `WorkoutLog`; badge "Con trainer" / "Da solo". |
| `src/hooks/use-allenamenti.ts` | Select `is_coached`; mapping `is_coached` (con fallback `execution_mode === 'coached'`) in `Allenamento`. |
| `src/types/allenamento.ts` | Campo opzionale `is_coached?: boolean` in `Allenamento`. |
| `src/lib/supabase/types.ts` | `workout_logs`: Row/Insert/Update con `is_coached`, `coached_by_profile_id`, `completed_at`; relazione FK `coached_by_profile_id`. |

---

## 2) Migration creata

**File:** `supabase/migrations/20260228220000_workout_logs_completion_coached.sql`

- **Colonne:**  
  - `is_coached` boolean NOT NULL DEFAULT false  
  - `coached_by_profile_id` uuid NULL REFERENCES profiles(id) ON DELETE RESTRICT  
  - `completed_at` timestamptz NULL  
- **Backfill:**  
  - `is_coached` da `execution_mode = 'coached'`  
  - `completed_at` da `updated_at`/`created_at` per log completati  
- **Indici:**  
  - `(atleta_id, completed_at)` WHERE completed_at IS NOT NULL  
  - `(coached_by_profile_id, completed_at)` WHERE coached_by_profile_id IS NOT NULL AND completed_at IS NOT NULL  
- **Trigger:**  
  - `workout_logs_athlete_update_guard`: BEFORE UPDATE; se l’utente è l’atleta del log, vengono ripristinati da OLD i campi non consentiti (`atleta_id`, `athlete_id`, `scheda_id`, `data`, `stato`, `esercizi_totali`, `created_at`). Restano modificabili: `is_coached`, `coached_by_profile_id`, `completed_at`, `note`, `durata_minuti`, `esercizi_completati`, `volume_totale`, `execution_mode`, `updated_at`.

---

## 3) Strategia RLS/trigger e motivazione

- **Problema:** In Postgres le policy RLS non possono limitare *quali colonne* sono aggiornabili, solo quali righe.
- **Scelta:** **Trigger BEFORE UPDATE** (e non RPC/view) perché:
  - Un’unica funzione gestisce la restrizione: per le righe il cui atleta è l’utente corrente si sovrascrivono su NEW i campi non consentiti con i valori OLD.
  - Le policy UPDATE esistenti (atleta solo propri log; staff/admin pieni permessi) restano invariate; il trigger non cambia chi può fare UPDATE, solo *cosa* può essere modificato quando è l’atleta.
  - Nessuna view aggiuntiva e nessun cambio di API: il client continua a usare `.update()` su `workout_logs`; la sicurezza è garantita lato DB.

---

## 4) UX

- **Completa allenamento:** Il pulsante "Completa allenamento" apre già la modal obbligatoria (Con trainer / Eseguito da solo). Alla conferma si invia l’insert con `is_coached`, `coached_by_profile_id` (da `get_my_trainer_profile().pt_id` se "Con trainer"), `completed_at = now()`.
- **Storico:** In `/home/progressi/storico` ogni allenamento completato mostra il badge "Con trainer" o "Da solo" in base a `is_coached`.

---

## 5) Checklist test

- [ ] **Atleta:** Apri "Allenamento di oggi" → completa tutti gli esercizi → "Completa allenamento" → scegli "Eseguito da solo" → verifica toast e redirect; in Storico compare badge "Da solo".
- [ ] **Atleta:** Ripeti scegliendo "Con trainer" → in Storico compare badge "Con trainer"; in DB `workout_logs` ha `is_coached = true` e `coached_by_profile_id` = profile id del PT assegnato.
- [ ] **Atleta:** Verifica che non si possano modificare `atleta_id`, `scheda_id`, `data`, `stato` sui propri log (trigger ripristina OLD).
- [ ] **Trainer/Admin:** Verifica che la lista/storico workout_logs degli atleti mostri correttamente i badge e che gli update consentiti dalla policy restino funzionanti.

---

## 6) Cleanup RLS UPDATE (20260301145000)

- **Migration:** `20260301145000_workout_logs_update_policies_cleanup.sql`
- **Rimosse:** policy legacy `workout_logs_update_own_or_org` e `workout_logs_update_policy` (contenevano ruoli 'pt' o logica org-wide duplicata).
- **Policy UPDATE finali:** solo `Athletes can update own workout logs` (atleta, proprie righe) e `Trainers can update assigned athlete workout logs` (admin/trainer via `is_admin()` / `get_current_trainer_profile_id()`). Nessun riferimento a 'pt' o 'atleta' in qual/with_check.

---

## 7) Note

- `execution_mode` resta per compatibilità (KPI marketing/view); i nuovi campi canonici sono `is_coached` e `coached_by_profile_id`.
- I dati "con/senza trainer" restano per atleta/trainer/admin; non esposti in raw al ruolo marketing (come da vincolo).
- **Verifica policy UPDATE:** `SELECT policyname, qual, with_check FROM pg_policies WHERE tablename = 'workout_logs' AND cmd = 'UPDATE';` — devono figurare solo le due policy sopra; nessun 'pt'/'atleta' in qual/with_check.
