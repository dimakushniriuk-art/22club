# Piano: KPI marketing – execution_mode (solo/coached) e vista aggregata

**Obiettivo:** Conteggio allenamenti “coached” vs “solo”; atleta sceglie al completamento; marketing vede solo aggregati (VIEW), non dettagli.

---

## (1) Dove l’atleta completa il workout log

| Percorso / file | Ruolo |
|-----------------|--------|
| **`/home/allenamenti/oggi`** | Pagina allenamento “oggi”: pulsante “Completa allenamento” → apre modale → atleta sceglie “Con Personal Trainer” o “Da Solo” → `handleTrainerSessionConfirm(withTrainer)` inserisce in `workout_logs`. |
| `src/app/home/allenamenti/oggi/page.tsx` | Logica completamento: ~righe 734–991 (`finishWorkout`, `handleTrainerSessionConfirm`). Insert ~889–916. |
| `src/components/workout/trainer-session-modal.tsx` | Modale con due pulsanti: “Con Personal Trainer” (`withTrainer=true`) e “Da Solo” (`withTrainer=false`). |
| `/home/allenamenti/riepilogo` | Solo lettura: mostra riepilogo dopo completamento (nessuna scelta execution_mode qui). |

La scelta “solo/coached” è già in uso; oggi viene solo messa in `note`. Si aggiunge il campo DB `execution_mode` e si invia in insert.

---

## (2) Patch UI minime

- **oggi/page.tsx:** nell’insert in `workout_logs` aggiungere `execution_mode: withTrainer ? 'coached' : 'solo'`.
- **types.ts:** in `workout_logs` Row/Insert/Update aggiungere `execution_mode: string | null` (e `'solo' | 'coached'` se vuoi stretto).
- **trainer-session-modal.tsx (opzionale):** allineare testi a “Eseguito da solo” / “Con trainer” (attualmente “Da Solo” / “Con Personal Trainer”).

---

## (3) SQL in blocchi (da eseguire manualmente)

### 3.1 – Aggiungere colonna e vincolo su `workout_logs`

```sql
-- 1. Aggiungi colonna execution_mode
ALTER TABLE public.workout_logs
  ADD COLUMN IF NOT EXISTS execution_mode text NOT NULL DEFAULT 'solo';

-- 2. Vincolo valori ammessi
ALTER TABLE public.workout_logs
  DROP CONSTRAINT IF EXISTS workout_logs_execution_mode_check;
ALTER TABLE public.workout_logs
  ADD CONSTRAINT workout_logs_execution_mode_check
  CHECK (execution_mode IN ('solo', 'coached'));

-- 3. (Opzionale) Backfill: righe già completate senza valore → 'solo'
UPDATE public.workout_logs
SET execution_mode = 'solo'
WHERE execution_mode IS NULL
   OR execution_mode NOT IN ('solo', 'coached');
```

### 3.2 – Vista aggregata per marketing

La vista aggrega solo da `workout_logs` (stato completato). Usa `COALESCE(athlete_id, atleta_id)` per compatibilità.

```sql
-- 4. Vista KPI marketing (solo conteggi per atleta, nessun dettaglio)
CREATE OR REPLACE VIEW public.athlete_marketing_metrics AS
SELECT
  COALESCE(wl.athlete_id, wl.atleta_id) AS athlete_id,
  COUNT(*) FILTER (WHERE wl.stato IN ('completato', 'completed')) AS workouts_total_count,
  COUNT(*) FILTER (WHERE wl.stato IN ('completato', 'completed') AND COALESCE(wl.execution_mode, 'solo') = 'solo') AS workouts_solo_count,
  COUNT(*) FILTER (WHERE wl.stato IN ('completato', 'completed') AND wl.execution_mode = 'coached') AS workouts_coached_count,
  MAX(
    CASE WHEN wl.stato IN ('completato', 'completed') THEN wl.updated_at END
  ) AS last_workout_at
FROM public.workout_logs wl
WHERE COALESCE(wl.athlete_id, wl.atleta_id) IS NOT NULL
GROUP BY COALESCE(wl.athlete_id, wl.atleta_id);

COMMENT ON VIEW public.athlete_marketing_metrics IS
  'KPI aggregati per atleta (solo counts). Per ruolo marketing; non espone dettagli workout_logs.';
```

### 3.3 – Accesso alla vista (admin + marketing)

In Postgres le view normali **non** supportano RLS. L’accesso si gestisce in due modi:

- **In app:** l’endpoint che legge `athlete_marketing_metrics` (es. GET /api/marketing/metrics) deve verificare che l’utente abbia `role = 'admin'` o `role = 'marketing'` e poi eseguire la SELECT sulla view (es. con service_role o con utente autenticato che ha GRANT SELECT). Così marketing non accede mai direttamente a `workout_logs`.
- **RPC SECURITY DEFINER (opzionale):** creare una funzione che fa `SELECT * FROM athlete_marketing_metrics` e restituisce il risultato, con `SECURITY DEFINER`; nella funzione verificare `get_current_user_role() IN ('admin', 'marketing')` e in caso contrario restituire vuoto. Poi dare a marketing solo l’autorizzazione a chiamare quell’RPC.

```sql
-- 5. (Opzionale) RPC per marketing: legge solo la vista se ruolo admin/marketing
CREATE OR REPLACE FUNCTION public.get_athlete_marketing_metrics()
RETURNS SETOF public.athlete_marketing_metrics
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.athlete_marketing_metrics
  WHERE public.get_current_user_role() IN ('admin', 'marketing');
$$;
GRANT EXECUTE ON FUNCTION public.get_athlete_marketing_metrics() TO authenticated;
COMMENT ON FUNCTION public.get_athlete_marketing_metrics() IS
  'Restituisce KPI aggregati per marketing/admin. Nessun dettaglio workout.';
```

Se non usi l’RPC, l’app deve controllare il ruolo prima di esporre i dati della view.

### 3.4 – Marketing NON deve vedere `workout_logs`

Le policy esistenti su `workout_logs` non devono dare SELECT al ruolo `marketing`. Verifica:

```sql
-- 6. Verifica policy su workout_logs (nessuna deve dare accesso a marketing)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'workout_logs';
```

### 3.5 – Grant sulla view

```sql
-- 7. Grant SELECT sulla view (per RPC o per lettura da app con ruolo verificato)
GRANT SELECT ON public.athlete_marketing_metrics TO authenticated;
```

---

## (4) File TS/React toccati e patch

| File | Modifica |
|------|----------|
| `src/app/home/allenamenti/oggi/page.tsx` | In `handleTrainerSessionConfirm`, nell’oggetto passato a `.from('workout_logs').insert(...)` aggiungere `execution_mode: withTrainer ? 'coached' : 'solo'`. |
| `src/lib/supabase/types.ts` | In `workout_logs` Row/Insert/Update aggiungere `execution_mode: 'solo' | 'coached' | null` (Insert con default `'solo'` se omesso). |
| `src/components/workout/trainer-session-modal.tsx` | (Opzionale) Testi pulsanti: "Con trainer" al posto di "Con Personal Trainer", "Eseguito da solo" al posto di "Da Solo". |

Patch applicate sotto.

---

## (5) Riepilogo policy/funzioni (DB)

| Oggetto | Azione |
|--------|--------|
| `workout_logs` | Aggiunta colonna `execution_mode` + CHECK. Nessuna nuova policy per marketing (marketing non deve vedere workout_logs). |
| `athlete_marketing_metrics` (VIEW) | Creata; aggregati da workout_logs; SELECT solo per chi in app è admin o marketing (gestito in app o con RLS su view se supportato). |
| Ruolo `marketing` | Se non esiste in `roles`/`profiles`, va aggiunto separatamente; le policy della view (o l’RPC che legge la view) filtrano per `get_current_user_role() = 'marketing'` o `is_admin()`. |

---

## (6) Query di test

```sql
-- Inserimento log con execution_mode
INSERT INTO public.workout_logs (
  atleta_id, athlete_id, data, stato, esercizi_completati, esercizi_totali,
  execution_mode
)
SELECT
  p.id, p.id, CURRENT_DATE, 'completato', 3, 3,
  'coached'
FROM public.profiles p
WHERE p.role IN ('atleta', 'athlete')
LIMIT 1
RETURNING id, atleta_id, stato, execution_mode;

-- Conteggio dalla view
SELECT * FROM public.athlete_marketing_metrics
WHERE athlete_id = (SELECT id FROM public.profiles WHERE role IN ('atleta','athlete') LIMIT 1);
```

---

## (7) Resoconto prima/dopo

| Aspetto | Prima | Dopo |
|--------|--------|------|
| Modalità esecuzione | Solo in `note` (“Completato con trainer” / “Completato da solo”) | Campo `workout_logs.execution_mode` ('solo' | 'coached') |
| KPI marketing | Non presenti | Vista `athlete_marketing_metrics`: workouts_total_count, workouts_solo_count, workouts_coached_count, last_workout_at |
| Privacy marketing | N/A | Marketing non accede a workout_logs/workout_plans/dettagli; solo aggregati in vista |
| UX completamento | Modale “Con PT” / “Da Solo” già presente | Invariata; valore salvato anche in `execution_mode` |

---

## (8) Checklist test

- [ ] **DB:** Colonna `execution_mode` presente; CHECK accetta solo 'solo' e 'coached'.
- [ ] **Insert:** Completare un allenamento da atleta scegliendo “Con trainer” → una riga in `workout_logs` con `execution_mode = 'coached'`; “Da solo” → `execution_mode = 'solo'`.
- [ ] **View:** `SELECT * FROM athlete_marketing_metrics` restituisce una riga per atleta con total/solo/coached e last_workout_at.
- [ ] **Marketing:** Utente con ruolo marketing non può fare SELECT su `workout_logs`; può leggere solo la vista (o RPC che la usa).
- [ ] **Admin:** Continua a vedere tutto (workout_logs e vista).

---

## (9) Placeholder visite nutrizionista / massaggi

Se in futuro avrai tabelle “eventi” (es. visite nutrizionista, massaggi), potrai aggiungere alla stessa vista colonne tipo `visits_nutritionist_count`, `visits_massage_count` aggregando da quelle tabelle. Per ora la vista contiene solo KPI da `workout_logs`. TODO in codice: commento in vista o in doc “Aggiungere conteggi visite nutrizionista/massaggi quando tabelle disponibili”.
