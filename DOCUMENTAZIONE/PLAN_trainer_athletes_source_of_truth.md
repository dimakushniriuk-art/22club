# Piano: trainer_athletes come unica source-of-truth (trainer ↔ athlete)

**Obiettivo:** `trainer_athletes` unica fonte per relazione trainer↔athlete, con storico e vincolo DB “1 trainer attivo per athlete”.

---

## (1) Riferimenti a `pt_atleti` e `trainer_athletes`

### pt_atleti – per file e riga

| File                                                                              | Righe                                      | Uso                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| **Migrations SQL**                                                                |                                            |                                                                                   |
| `supabase/migrations/20260246_workout_plans_staff_condition_security_definer.sql` | 3, 17, 25                                  | Commenti + JOIN in `workout_plans_staff_assigned_condition`                       |
| `supabase/migrations/20260245_workout_plans_rls_created_by_visibility.sql`        | 3, 7–8, 19, 27, 30, 42, 82                 | Stessa funzione + policy workout_plans                                            |
| `supabase/migrations/20260241_appointments_staff_insert_policy.sql`               | 5                                          | Solo commento                                                                     |
| `supabase/migrations/20260235_get_my_trainer_profile_profile_id_fallback.sql`     | 49                                         | `FROM pt_atleti pa` in get_my_trainer_profile                                     |
| `supabase/migrations/20260234_get_my_trainer_profile_pt_id.sql`                   | 52                                         | Idem                                                                              |
| `supabase/migrations/20260233_get_trainer_profile_full.sql`                       | 3, 32, 80                                  | Accesso atleta assegnato + EXISTS pt_atleti                                       |
| `supabase/migrations/20260227_get_my_trainer_profile_return_text.sql`             | 42                                         | FROM pt_atleti in get_my_trainer_profile                                          |
| `supabase/migrations/20260223_chat_messages_insert_allow_pt_athlete.sql`          | 5, 8, 17, 23, 43                           | `chat_receiver_is_assigned_pt` + policy INSERT                                    |
| `supabase/migrations/20260222_profiles_athlete_view_trainer_restore.sql`          | 9, 17                                      | Policy “Athletes can view assigned trainer” (pt_id da pt_atleti)                  |
| `supabase/migrations/20260220_progress_photos_rls_athlete_trainer.sql`            | 3, 42–43, 48, 58, 68, 75, 85               | Policy trainer su progress_photos (EXISTS pt_atleti)                              |
| `supabase/migrations/20260213_fix_profiles_recursion_use_rpc.sql`                 | 49                                         | FROM pt_atleti in funzione                                                        |
| `supabase/migrations/20260213_profiles_athlete_view_trainer.sql`                  | 5, 14                                      | Policy atleta vede PT (pt_atleti)                                                 |
| `supabase/migrations/20260110_fix_trainer_view_athletes_rls.sql`                  | 99, 164–172                                | `is_athlete_assigned_to_current_trainer` + policy pt_atleti                       |
| `supabase/migrations/20260108_trainer_data_isolation_rls_03_pt_atleti.sql`        | 4–62                                       | Policy SELECT/INSERT/UPDATE/DELETE su pt_atleti                                   |
| `supabase/migrations/20260108_complete_storage_buckets.sql`                       | 133, 168, 203, 278, 313, 348               | Policy storage con EXISTS pt_atleti                                               |
| `supabase/migrations/20260109_*` (3 file)                                         | varie                                      | Funzione is_athlete_assigned + pt_atleti                                          |
| `supabase/migrations/20260122_*` (fix/diagnose/verify)                            | varie                                      | Policy profiles + verifiche pt_atleti                                             |
| `supabase/migrations/20260126_delete_*` (3 file)                                  | varie                                      | DISABLE RLS + DELETE da pt_atleti                                                 |
| `supabase/migrations/FIX_FINALE_RLS_POLICIES.sql`                                 | 94, 138, 190                               | Policy workouts/workout_logs (JOIN pt_atleti)                                     |
| `supabase/migrations/FIX_WORKOUT_LOGS_MIRATO.sql`                                 | 241, 248, 255, 262, 335, 342, 349          | Policy workout_logs (pt_atleti)                                                   |
| `supabase/migrations/20260207_payments_update_policy_created_by.sql`              | 25, 36                                     | Policy payments con `is_athlete_assigned_to_trainer`                              |
| `supabase-config-export/schema-with-data.sql`                                     | 3028–3106, 6577–6586, 7162–8398, 9386–9819 | Funzioni is*athlete*\*, pt_atleti table, policy workout_plans/workout_logs, viste |
| **Codice TS/Next**                                                                |                                            |                                                                                   |
| `src/lib/supabase/types.ts`                                                       | 1982–2031                                  | Tipo `pt_atleti` (Row/Insert/Update/Relationships)                                |
| `src/app/home/chat/page.tsx`                                                      | 243                                        | `.from('pt_atleti').select('pt_id').eq('atleta_id', …)`                           |
| `src/hooks/chat/use-chat-conversations.ts`                                        | 330–331                                    | `.from('pt_atleti').select('pt_id, pt:profiles!...')`                             |
| `src/hooks/use-clienti.ts`                                                        | 459, 844                                   | Commenti (pt_atleti)                                                              |
| `src/app/api/admin/users/route.ts`                                                | 92–93, 457–458                             | Select pt_atleti per trainer; safeDelete pt_atleti                                |
| `src/app/api/athletes/[id]/route.ts`                                              | 79, 152, 268, 303–304                      | Select/verifica relazione; safeDelete pt_atleti                                   |
| `src/app/api/register/complete-profile/route.ts`                                  | 25, 154–159                                | INSERT pt_atleti su invito accettato                                              |
| `src/app/api/athletes/create/route.ts`                                            | 147, 159–170                               | INSERT pt_atleti quando staff è trainer/pt                                        |
| **Docs**                                                                          |                                            |                                                                                   |
| `docs/sql/assign_aaa_athletes_to_trainer.sql`                                     | 8                                          | INSERT pt_atleti                                                                  |
| `docs/sql/delete_two_profiles_complete.sql`                                       | 21–22                                      | DELETE pt_atleti                                                                  |
| `docs/sql/fix_pt_atleti_assign_and_trainer_permissions.sql`                       | 7–59                                       | Policy + INSERT pt_atleti                                                         |
| `docs/TRAINER_PROFILE_DB_STATE.md`                                                | 40, 50, 161–165, 224–230, 295, 339         | Documentazione trainer_athletes vs pt_atleti                                      |

### trainer_athletes – riferimenti in repo

- **Nessuna** migration o codice TS che usa `trainer_athletes` (solo doc in `TRAINER_PROFILE_DB_STATE.md`, `TRAINER_PROFILE_IMPLEMENTATION_PLAN.md`, `DATABASE_SCHEMA_REFERENCE.md`). La tabella esiste in DB (2 righe) con `trainer_id`, `athlete_id`, FK a `profiles(id)`, `UNIQUE(trainer_id, athlete_id)`.

---

## (2) SQL in blocchi eseguibili (manuali, non file migration)

**Convenzione:** `trainer_athletes` usa `trainer_id` e `athlete_id` (come da tua descrizione). Se nel tuo DB i nomi sono diversi (es. `pt_id`/`atleta_id`), adatta gli script.

---

### Step 0 – Verifica/creazione tabella trainer_athletes

Eseguire solo se `trainer_athletes` **non** esiste. Controllo: `SELECT to_regclass('public.trainer_athletes');` → se NULL, eseguire 0.1.

**0.1** Crea tabella (solo se mancante)

```sql
CREATE TABLE IF NOT EXISTS public.trainer_athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (trainer_id, athlete_id)
);
CREATE INDEX IF NOT EXISTS idx_trainer_athletes_athlete_id ON public.trainer_athletes(athlete_id);
CREATE INDEX IF NOT EXISTS idx_trainer_athletes_trainer_id ON public.trainer_athletes(trainer_id);
ALTER TABLE public.trainer_athletes ENABLE ROW LEVEL SECURITY;
```

---

### Step A – Estendere trainer_athletes per lo storico

**A.1** Aggiungere colonne (lock breve)

```sql
ALTER TABLE public.trainer_athletes
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS activated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz NULL;
```

**A.2** Vincolo valori status (opzionale)

```sql
ALTER TABLE public.trainer_athletes
  DROP CONSTRAINT IF EXISTS trainer_athletes_status_check;
ALTER TABLE public.trainer_athletes
  ADD CONSTRAINT trainer_athletes_status_check CHECK (status IN ('active', 'inactive'));
```

---

### Step B – Vincolo “1 attivo per athlete”

**B.1** Indice unico parziale (solo una riga `active` per athlete)

```sql
-- Rimuovi se esiste un unique totale su (trainer_id, athlete_id) che non considera status
-- Poi crea unique parziale
CREATE UNIQUE INDEX IF NOT EXISTS idx_trainer_athletes_one_active_per_athlete
  ON public.trainer_athletes (athlete_id)
  WHERE status = 'active';
```

Se la tabella aveva già `UNIQUE(trainer_id, athlete_id)` senza condizione, resta; l’unico aggiuntivo è “uno solo active per athlete”.

---

### Step C – Migrazione dati da pt_atleti a trainer_athletes

**C.1** Inserire da pt_atleti le righe mancanti (mappando pt_id→trainer_id, atleta_id→athlete_id), tutte come `active` e con una sola active per athlete. Se un athlete ha più righe in pt_atleti, solo la “più recente” (es. max created_at) va in active; le altre vanno inserite come `inactive` con `deactivated_at = now()`.

```sql
-- Inserisci da pt_atleti: una riga active per (athlete_id) (la più recente), le altre inactive
INSERT INTO public.trainer_athletes (trainer_id, athlete_id, status, activated_at, deactivated_at, created_at)
SELECT
  pa.pt_id,
  pa.atleta_id,
  CASE
    WHEN pa.id = (
      SELECT pa2.id
      FROM public.pt_atleti pa2
      WHERE pa2.atleta_id = pa.atleta_id
      ORDER BY COALESCE(pa2.created_at, pa2.assigned_at) DESC NULLS LAST
      LIMIT 1
    ) THEN 'active'
    ELSE 'inactive'
  END,
  COALESCE(pa.created_at, pa.assigned_at, now()),
  CASE
    WHEN pa.id <> (
      SELECT pa2.id
      FROM public.pt_atleti pa2
      WHERE pa2.atleta_id = pa.atleta_id
      ORDER BY COALESCE(pa2.created_at, pa2.assigned_at) DESC NULLS LAST
      LIMIT 1
    ) THEN now()
    ELSE NULL
  END,
  COALESCE(pa.created_at, pa.assigned_at, now())
FROM public.pt_atleti pa
ON CONFLICT (trainer_id, athlete_id) DO NOTHING;
```

Nota: se `trainer_athletes` ha un UNIQUE su `(trainer_id, athlete_id)`, lo stesso (pt_id, atleta_id) non può apparire due volte; per duplicati su stesso atleta con trainer diversi, la logica sopra inserisce una riga per (pt_id, atleta_id): una sola per atleta sarà `active` (quella con created_at più recente tra tutte le righe pt_atleti per quell’atleta). Per fare “una sola active per athlete” quando si inseriscono più (trainer, athlete) da pt_atleti, serve gestire i conflitti. Versione più sicura: inserire prima tutte come inactive, poi aggiornare a active la più recente per ogni athlete.

**C.2** Versione alternativa: inserire solo la coppia “attiva” per athlete (una riga per atleta, trainer = quello con created_at max in pt_atleti)

```sql
INSERT INTO public.trainer_athletes (trainer_id, athlete_id, status, activated_at, created_at)
SELECT pt_id, atleta_id, 'active', COALESCE(created_at, assigned_at, now()), COALESCE(created_at, assigned_at, now())
FROM (
  SELECT DISTINCT ON (atleta_id) id, pt_id, atleta_id, created_at, assigned_at
  FROM public.pt_atleti
  ORDER BY atleta_id, COALESCE(created_at, assigned_at) DESC NULLS LAST
) sub
ON CONFLICT (trainer_id, athlete_id) DO UPDATE SET
  status = EXCLUDED.status,
  activated_at = EXCLUDED.activated_at,
  deactivated_at = NULL;
```

**C.3** Allineare righe già presenti in trainer_athletes: impostare `status = 'active'` e `deactivated_at = NULL` dove non c’è ancora storico, e assicurare “una sola active per athlete” (es. per athlete_id con più righe, tenere active solo la più recente)

```sql
-- Esempio: imposta tutte le righe esistenti senza status a 'active' (se non hai ancora lo storico)
UPDATE public.trainer_athletes SET status = 'active', activated_at = COALESCE(activated_at, created_at), deactivated_at = NULL WHERE status IS NULL OR status = '';

-- Poi, se ci sono più active per stesso athlete_id, disattiva le più vecchie
WITH ranked AS (
  SELECT id, athlete_id, activated_at,
         ROW_NUMBER() OVER (PARTITION BY athlete_id ORDER BY activated_at DESC NULLS LAST) AS rn
  FROM public.trainer_athletes
  WHERE status = 'active'
)
UPDATE public.trainer_athletes ta
SET status = 'inactive', deactivated_at = now()
FROM ranked r
WHERE ta.id = r.id AND r.rn > 1;
```

---

### Step D – Funzioni helper (solo trainer_athletes, status = 'active')

**D.1** `is_athlete_assigned_to_current_trainer(athlete_profile_id uuid)` – legge solo `trainer_athletes` e solo `status = 'active'` (usa alias tabella per evitare conflitto nome parametro/colonna)

```sql
CREATE OR REPLACE FUNCTION public.is_athlete_assigned_to_current_trainer(athlete_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur_trainer_id uuid;
BEGIN
  cur_trainer_id := get_current_trainer_profile_id();
  IF cur_trainer_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.trainer_athletes ta
    WHERE ta.trainer_id = cur_trainer_id
      AND ta.athlete_id = athlete_profile_id
      AND ta.status = 'active'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
COMMENT ON FUNCTION public.is_athlete_assigned_to_current_trainer(uuid) IS 'Verifica se l''atleta è assegnato al trainer corrente. Legge solo trainer_athletes con status=active.';
```

**D.2** `is_athlete_assigned_to_trainer(athlete_profile_id uuid)` – stessa logica, solo trainer_athletes + active

```sql
CREATE OR REPLACE FUNCTION public.is_athlete_assigned_to_trainer(athlete_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur_trainer_id uuid;
BEGIN
  cur_trainer_id := get_current_trainer_profile_id();
  IF cur_trainer_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.trainer_athletes ta
    WHERE ta.trainer_id = cur_trainer_id
      AND ta.athlete_id = athlete_profile_id
      AND ta.status = 'active'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
COMMENT ON FUNCTION public.is_athlete_assigned_to_trainer(uuid) IS 'Come is_athlete_assigned_to_current_trainer; legge solo trainer_athletes con status=active.';
```

**D.3** `workout_plans_staff_assigned_condition(plan_athlete_id uuid)` – solo trainer_athletes, active

```sql
CREATE OR REPLACE FUNCTION public.workout_plans_staff_assigned_condition(plan_athlete_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles staff
    JOIN trainer_athletes ta ON ta.trainer_id = staff.id AND ta.status = 'active'
    WHERE staff.user_id = auth.uid()
      AND staff.role::text IN ('pt', 'trainer')
      AND ta.athlete_id = plan_athlete_id
  );
$$;
COMMENT ON FUNCTION public.workout_plans_staff_assigned_condition(uuid) IS 'True se utente è pt/trainer e plan_athlete_id è tra i suoi atleti in trainer_athletes (active).';
```

**D.4** `chat_receiver_is_assigned_pt(sender_id uuid, receiver_id uuid)` – solo trainer_athletes, active (sender = atleta, receiver = trainer)

```sql
CREATE OR REPLACE FUNCTION public.chat_receiver_is_assigned_pt(sender_id uuid, receiver_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trainer_athletes ta
    WHERE ta.athlete_id = sender_id AND ta.trainer_id = receiver_id AND ta.status = 'active'
  );
$$;
COMMENT ON FUNCTION public.chat_receiver_is_assigned_pt(uuid, uuid) IS 'Per RLS chat_messages: true se receiver è il trainer attivo del sender (trainer_athletes, status=active).';
```

**D.5** `get_my_trainer_profile()` – restituisce il trainer **attivo** dall’atleta corrente (trainer_athletes)

```sql
CREATE OR REPLACE FUNCTION get_my_trainer_profile()
RETURNS TABLE (
  pt_id uuid,
  pt_nome text,
  pt_cognome text,
  pt_email text,
  pt_telefono text,
  pt_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  my_profile_id uuid;
BEGIN
  PERFORM set_config('row_security', 'off', true);
  SELECT id INTO my_profile_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
  IF my_profile_id IS NULL THEN
    SELECT id INTO my_profile_id FROM profiles WHERE id = auth.uid() LIMIT 1;
  END IF;
  IF my_profile_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.nome::text,
    t.cognome::text,
    t.email::text,
    t.telefono::text,
    t.avatar_url::text
  FROM trainer_athletes ta
  JOIN profiles t ON t.id = ta.trainer_id
  WHERE ta.athlete_id = my_profile_id AND ta.status = 'active'
  LIMIT 1;
END;
$$;
COMMENT ON FUNCTION get_my_trainer_profile() IS 'Trainer assegnato all''atleta corrente. Legge trainer_athletes con status=active.';
```

**D.6** `get_trainer_profile_full(p_profile_id uuid)` – accesso se atleta assegnato tramite trainer_athletes (active)

```sql
CREATE OR REPLACE FUNCTION get_trainer_profile_full(p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  my_profile_id uuid;
  can_access boolean := false;
  result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin') THEN
    can_access := true;
  END IF;

  IF NOT can_access THEN
    SELECT id INTO my_profile_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
    IF my_profile_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM trainer_athletes WHERE trainer_id = p_profile_id AND athlete_id = my_profile_id AND status = 'active'
    ) THEN
      can_access := true;
    END IF;
  END IF;

  IF NOT can_access THEN RETURN NULL; END IF;

  SELECT jsonb_build_object(
    'profile', (SELECT to_jsonb(tp) FROM trainer_profiles tp WHERE tp.profile_id = p_profile_id LIMIT 1),
    'education', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at) FROM trainer_education e WHERE e.profile_id = p_profile_id), '[]'::jsonb),
    'certifications', COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at) FROM trainer_certifications c WHERE c.profile_id = p_profile_id), '[]'::jsonb),
    'courses', COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at) FROM trainer_courses c WHERE c.profile_id = p_profile_id), '[]'::jsonb),
    'specializations', COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.created_at) FROM trainer_specializations s WHERE s.profile_id = p_profile_id), '[]'::jsonb),
    'experience', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.data_inizio) FROM trainer_experience x WHERE x.profile_id = p_profile_id), '[]'::jsonb),
    'testimonials', COALESCE((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.created_at) FROM trainer_testimonials t WHERE t.profile_id = p_profile_id), '[]'::jsonb),
    'transformations', COALESCE((SELECT jsonb_agg(to_jsonb(tr) ORDER BY tr.created_at) FROM trainer_transformations tr WHERE tr.profile_id = p_profile_id), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
COMMENT ON FUNCTION get_trainer_profile_full(uuid) IS 'Profilo esteso trainer. Solo admin o atleta assegnato (trainer_athletes, status=active).';
```

---

### Step E – Policy RLS che devono usare trainer_athletes (active)

**E.1** profiles – “Athletes can view assigned trainer profile”: atleta vede il profilo del trainer **attivo** (trainer_athletes)

```sql
DROP POLICY IF EXISTS "Athletes can view assigned trainer profile" ON profiles;
CREATE POLICY "Athletes can view assigned trainer profile"
  ON profiles FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT ta.trainer_id
      FROM trainer_athletes ta
      WHERE ta.athlete_id = get_profile_id_from_user_id(auth.uid())
        AND ta.status = 'active'
    )
  );
COMMENT ON POLICY "Athletes can view assigned trainer profile" ON profiles IS 'Atleta vede profilo del trainer attivo (trainer_athletes).';
```

**E.2** progress_photos – policy trainer: solo atleti in trainer_athletes con status = 'active'

Sostituire ogni `EXISTS (SELECT 1 FROM pt_atleti pa WHERE pa.atleta_id = progress_photos.athlete_id AND pa.pt_id = ...)` con:

```sql
EXISTS (
  SELECT 1 FROM trainer_athletes ta
  WHERE ta.athlete_id = progress_photos.athlete_id
    AND ta.trainer_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND ta.status = 'active'
)
```

Eseguire DROP delle 4 policy trainer su progress_photos e ricrearle con la condizione sopra (progress_photos_trainer_select/insert/update/delete).

**E.3** workouts – policy SELECT/UPDATE che usano pt_atleti

Sostituire il blocco “PT vede schede dei propri atleti” con EXISTS su trainer_athletes (trainer_id = profilo corrente, athlete_id = workouts.athlete_id, status = 'active'). Stesso criterio per workout_logs se la policy fa JOIN pt_atleti.

**E.4** workout_plans – già coperte da `workout_plans_staff_assigned_condition` se aggiornata in D.3. Verificare che non restino policy che referenziano direttamente pt_atleti (es. “Staff can create workout plans for assigned athletes” che usa sottoquery su pt_atleti): sostituire con “athlete_id IN (SELECT ta.athlete_id FROM trainer_athletes ta WHERE ta.trainer_id = get_current_trainer_profile_id() AND ta.status = 'active')”.

**E.5** pt_atleti – opzionale: lasciare le policy esistenti ma non usare più pt_atleti dall’app; oppure (Step F) rendere pt_atleti read-only o bloccare INSERT/UPDATE.

---

### Step F (opzionale) – pt_atleti read-only / blocco scritture

**F.1** Revoca INSERT/UPDATE/DELETE ai ruoli che non siano service_role (o creare policy WITH CHECK false per authenticated su INSERT/UPDATE/DELETE). In alternativa, un trigger che blocca INSERT/UPDATE/DELETE su pt_atleti per tutti.

```sql
-- Esempio: policy che vieta INSERT a authenticated (solo admin già poteva; se vuoi bloccare anche admin, rimuovi INSERT per tutti)
-- Non creare policy INSERT/UPDATE/DELETE per pt_atleti per authenticated; oppure:
CREATE POLICY "pt_atleti_read_only_authenticated"
  ON pt_atleti FOR SELECT TO authenticated
  USING (true);
-- E rimuovere o non creare policy INSERT/UPDATE/DELETE per authenticated, così le scritture restano solo a service_role o via backend.
```

Oppure lasciare le policy attuali e limitarsi a non scrivere più su pt_atleti dal codice applicativo.

---

## (3) Policy e funzioni toccate + motivo

| Oggetto                                                 | Tipo     | Motivo                                                                         |
| ------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `is_athlete_assigned_to_current_trainer`                | Funzione | Usata da RLS profiles; deve leggere solo trainer_athletes, status=active       |
| `is_athlete_assigned_to_trainer`                        | Funzione | Usata da payments (e altro); stessa logica trainer_athletes+active             |
| `workout_plans_staff_assigned_condition`                | Funzione | Usata da policy workout_plans; da pt_atleti → trainer_athletes+active          |
| `chat_receiver_is_assigned_pt`                          | Funzione | RLS INSERT chat_messages; da pt_atleti → trainer_athletes+active               |
| `get_my_trainer_profile`                                | Funzione | Atleta vede il suo trainer; da pt_atleti → trainer_athletes+active             |
| `get_trainer_profile_full`                              | Funzione | Accesso atleta assegnato; da pt_atleti → trainer_athletes+active               |
| profiles “Athletes can view assigned trainer profile”   | Policy   | Atleta vede PT; da pt_atleti.pt_id → trainer_athletes.trainer_id + active      |
| profiles “Trainers can view assigned athletes”          | Policy   | Già usa is_athlete_assigned_to_current_trainer → OK dopo D.1                   |
| progress_photos (trainer select/insert/update/delete)   | Policy   | Da EXISTS pt_atleti → EXISTS trainer_athletes + active                         |
| workout_plans (select/update/delete assigned)           | Policy   | Usano workout_plans_staff_assigned_condition → OK dopo D.3                     |
| workout_plans “Staff can create…” / “Staff can delete…” | Policy   | Se contengono sottoquery su pt_atleti → sostituire con trainer_athletes+active |
| workouts (select/update)                                | Policy   | Da JOIN pt_atleti → EXISTS trainer_athletes+active                             |
| workout_logs (select/update/delete staff)               | Policy   | Da JOIN pt_atleti → EXISTS trainer_athletes+active                             |
| payments “Trainers can update assigned…”                | Policy   | Usa is_athlete_assigned_to_trainer → OK dopo D.2                               |
| pt_atleti (tutte le policy)                             | Policy   | Opzionale: lasciare o rendere read-only (Step F)                               |

Eventuali **viste** (es. athlete_fitness_data, athlete_massage_data, athlete_nutrition_data) che in schema-with-data.sql filtrano con pt_atleti vanno aggiornate a usare trainer_athletes con status = 'active'.

---

## (4) Query di verifica post-migrazione

```sql
-- Conteggi
SELECT 'pt_atleti' AS tabella, COUNT(*) AS righe FROM public.pt_atleti
UNION ALL
SELECT 'trainer_athletes', COUNT(*) FROM public.trainer_athletes
UNION ALL
SELECT 'trainer_athletes (active)', COUNT(*) FROM public.trainer_athletes WHERE status = 'active';

-- Vincolo “1 active per athlete”: nessuna riga deve essere restituita
SELECT athlete_id, COUNT(*) AS cnt
FROM public.trainer_athletes
WHERE status = 'active'
GROUP BY athlete_id
HAVING COUNT(*) > 1;

-- Sample visibilità trainer: atleti attivi per un trainer (sostituire trainer_profile_id)
SELECT ta.athlete_id, p.nome, p.cognome
FROM trainer_athletes ta
JOIN profiles p ON p.id = ta.athlete_id
WHERE ta.trainer_id = 'TRAINER_PROFILE_ID_QUI' AND ta.status = 'active';

-- Admin vede tutto: con utente admin, SELECT da profiles dove role in ('atleta','athlete') deve restituire tutti (policy “Admins can view all”).
```

---

## (5) Checklist test manuali

- **Admin:** vede tutti gli atleti; vede tutti i workout_plans, progress_photos, workouts, workout_logs; può creare/aggiornare assegnazioni (se esposta UI su trainer_athletes).
- **Trainer:** vede solo atleti con riga trainer_athletes (trainer_id = suo id, status = active); vede solo schede/workout/foto di quegli atleti; non vede atleti di altri trainer.
- **Atleta:** vede solo il proprio profilo e il profilo del trainer attivo (get_my_trainer_profile / “Athletes can view assigned trainer profile”); chat con il PT assegnato funziona; get_trainer_profile_full accessibile solo per il proprio trainer attivo.
- **Assegnazione nuovo trainer:** creare riga in trainer_athletes con status = 'active' e (opzionale) disattivare la precedente per lo stesso athlete_id (status = 'inactive', deactivated_at = now()); vincolo UNIQUE parziale non deve dare errore.

---

## (6) Resoconto breve

- **Prima:** relazione trainer↔atleta su `pt_atleti` (pt_id, atleta_id), senza storico e senza vincolo “1 attivo per athlete”; molte policy e funzioni e codice TS leggevano/scrivevano pt_atleti.
- **Dopo:** `trainer_athletes` è l’unica source-of-truth, con `status` ('active'/'inactive'), `activated_at`/`deactivated_at`, e vincolo DB “al più una riga active per athlete”. Tutte le funzioni helper e le policy RLS che dipendevano da pt_atleti leggono solo trainer_athletes con status = 'active'. pt_atleti resta in DB ma non più usato dall’app (e opzionalmente reso read-only). Il codice TS va aggiornato per leggere/scrivere solo trainer_athletes (e tipi in types.ts).

---

## (7) Rollback / sicurezza PROD

- **Backup:** fare backup/export del DB prima degli step (in particolare prima di C e D).
- **Ordine:** eseguire A → B → C → D → E; verificare dopo ogni blocco (conteggi, vincolo unique, una login trainer e una admin).
- **Rollback funzioni:** tenere copia del corpo delle funzioni che sostituisci (is_athlete_assigned_to_current_trainer, is_athlete_assigned_to_trainer, workout_plans_staff_assigned_condition, chat_receiver_is_assigned_pt, get_my_trainer_profile, get_trainer_profile_full); in caso di problema ripristinare la versione che legge da pt_atleti e rieseguire solo dopo aver corretto.
- **Lock:** ALTER TABLE add column è breve; CREATE UNIQUE INDEX su tabella già popolata è bloccante ma di solito veloce; in PROD preferire finestra a basso carico.
- **service_role:** le API che usano service_role bypassano RLS; le policy servono per client autenticati (dashboard, app). Assicurarsi che le API che scrivono assegnazioni usino trainer_athletes (e logica “disattiva precedente, attiva nuova”) e non più pt_atleti dopo il taglio.

---

## (8) Modifiche codice TypeScript/Next (da fare dopo DB)

| File                                             | Modifica                                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/supabase/types.ts`                      | Aggiungere tipo `trainer_athletes` (trainer_id, athlete_id, status, activated_at, deactivated_at, …). Opzionale: mantenere pt_atleti per compatibilità lettura fino a rimozione.  |
| `src/app/home/chat/page.tsx`                     | Sostituire query su `pt_atleti` con `trainer_athletes` filtrando `status = 'active'` e colonna `trainer_id` (pt_id → trainer_id).                                                 |
| `src/hooks/chat/use-chat-conversations.ts`       | Idem: da `pt_atleti` a `trainer_athletes`, `pt_id` → `trainer_id`, aggiungere `.eq('status','active')`.                                                                           |
| `src/app/api/admin/users/route.ts`               | Leggere trainer da `trainer_athletes` (active); safeDelete su `trainer_athletes` dove oggi su pt_atleti.                                                                          |
| `src/app/api/athletes/[id]/route.ts`             | Verifica relazione con `trainer_athletes` (trainer_id, athlete_id, status=active); safeDelete su trainer_athletes.                                                                |
| `src/app/api/register/complete-profile/route.ts` | INSERT in `trainer_athletes` (trainer_id, athlete_id, status='active') invece di pt_atleti; se l’atleta aveva già un trainer, disattivare la riga precedente e inserire la nuova. |
| `src/app/api/athletes/create/route.ts`           | INSERT in `trainer_athletes` invece di pt_atleti (stessa logica “solo active” e disattiva precedente se necessario).                                                              |

Fine piano.
