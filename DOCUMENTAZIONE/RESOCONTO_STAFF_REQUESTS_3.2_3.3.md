# Resoconto 3.2/3.3 — Staff_atleti + Staff_requests (estrazione + hardening)

## FASE 1 — ESTRAZIONE (da 20260301230000_staff_requests_and_staff_atleti_types.sql)

### 1) RPC `staff_requests_apply_transition` (versione originale, 3 argomenti)

```sql
CREATE OR REPLACE FUNCTION public.staff_requests_apply_transition(
  p_request_id uuid,
  p_actor_profile_id uuid,
  p_new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.staff_requests%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.staff_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'request_not_found');
  END IF;
  IF r.status = p_new_status THEN
    RETURN jsonb_build_object('ok', true, 'unchanged', true);
  END IF;
  -- Solo UPDATE: il trigger AFTER UPDATE esegue staff_atleti + audit
  UPDATE public.staff_requests SET status = p_new_status, updated_at = now() WHERE id = p_request_id;
  RETURN jsonb_build_object('ok', true, 'new_status', p_new_status);
END;
$$;
```

### 2) Funzione trigger `staff_requests_after_status_change` (versione originale)

```sql
CREATE OR REPLACE FUNCTION public.staff_requests_after_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid;
  v_org uuid;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;
  v_actor := public.get_actor_profile_id_from_jwt();
  IF v_actor IS NULL THEN
    SELECT id INTO v_actor FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  END IF;
  v_org := NEW.org_id;

  IF NEW.status = 'staff_confirmed' THEN
    UPDATE public.staff_atleti
    SET status = 'inactive', deactivated_at = now(), updated_at = now()
    WHERE atleta_id = NEW.athlete_id AND staff_type = NEW.staff_type AND status = 'active';
    INSERT INTO public.staff_atleti (org_id, atleta_id, staff_id, staff_type, status, activated_at, deactivated_at, updated_at)
    VALUES (NEW.org_id, NEW.athlete_id, NEW.staff_id, NEW.staff_type, 'active', now(), NULL, now());
    PERFORM public.audit_write(
      'STAFF_REQUEST_CONFIRMED',
      'staff_requests',
      NEW.id,
      to_jsonb(OLD) - 'created_at' - 'updated_at',
      jsonb_build_object('athlete_id', NEW.athlete_id, 'staff_id', NEW.staff_id, 'staff_type', NEW.staff_type, 'status', NEW.status),
      v_actor, v_org, NULL
    );
  ELSIF NEW.status = 'rejected' THEN
    PERFORM public.audit_write('STAFF_REQUEST_REJECTED', 'staff_requests', NEW.id, NULL, jsonb_build_object('status', NEW.status), v_actor, v_org, NULL);
  ELSIF NEW.status = 'cancelled' THEN
    PERFORM public.audit_write('STAFF_REQUEST_CANCELLED', 'staff_requests', NEW.id, NULL, jsonb_build_object('status', NEW.status), v_actor, v_org, NULL);
  ELSIF NEW.status = 'athlete_accepted' THEN
    PERFORM public.audit_write('STAFF_REQUEST_ACCEPTED', 'staff_requests', NEW.id, NULL, jsonb_build_object('status', NEW.status), v_actor, v_org, NULL);
  END IF;
  RETURN NEW;
END;
$$;
```

### 3) Definizione trigger

```sql
CREATE TRIGGER staff_requests_audit_and_activate
  AFTER UPDATE OF status ON public.staff_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.staff_requests_after_status_change();
```

### 4) CREATE POLICY toccate dalla migration

**staff_atleti**

- `"Admin all staff_atleti in org"` — FOR ALL, USING/WITH CHECK: admin e org_id = get_org_id_for_current_user()
- `"Athletes can view own staff_atleti links"` — FOR SELECT: athlete/atleta, atleta_id = get_profile_id_from_user_id(auth.uid()), org_id = get_org_id_for_current_user()
- `"Staff can view own staff_atleti links"` — FOR SELECT: nutrizionista/massaggiatore, staff_id = get_profile_id_from_user_id(auth.uid()), org_id = get_org_id_for_current_user()

**staff_requests**

- `"Admin all staff_requests in org"` — FOR ALL, org_id = get_org_id_for_current_user(), admin
- `"Staff can insert pending request same org"` — FOR INSERT: staff, staff_id = get_profile_id_from_user_id(), staff_type coerente con role, org_id = get_org_id_for_current_user() e org_id = athlete.org_id
- `"Staff can view own staff_requests"` — FOR SELECT: nutrizionista/massaggiatore, staff_id = get_profile_id_from_user_id()
- `"Staff can update request to confirmed or cancelled"` — FOR UPDATE: staff, WITH CHECK status IN ('staff_confirmed','cancelled') — **RIMOSSA in hardening**
- `"Athletes can view own staff_requests"` — FOR SELECT: athlete/atleta, athlete_id = get_profile_id_from_user_id()
- `"Athletes can update request accept or reject"` — FOR UPDATE: athlete, WITH CHECK status IN ('athlete_accepted','rejected') — **RIMOSSA in hardening**

**profiles**

- `"Nutrizionisti can view invited athletes"` — FOR SELECT: nutrizionista, EXISTS staff_atleti (atleta_id = profiles.id, staff_id = me, **status = 'active'**)
- `"Massaggiatori can view invited athletes"` — FOR SELECT: massaggiatore, EXISTS staff_atleti (..., **status = 'active'**)

**appointments**

- `"Staff (nutrizionista massaggiatore) can create appointments for invited athletes"` — FOR INSERT: EXISTS staff_atleti (athlete_id, staff_id = me, **status = 'active'**)
- `"Staff (nutrizionista massaggiatore) can update own appointments"` — FOR UPDATE: staff_id = me
- `"Staff (nutrizionista massaggiatore) can delete own appointments"` — FOR DELETE: staff_id = me

**workout_logs**

- `"Staff can view invited athletes workout logs"` — FOR SELECT: COALESCE(athlete_id, atleta_id) IN (SELECT atleta_id FROM staff_atleti WHERE staff_id = me AND **status = 'active'**)

### 5) Backfill org_id su staff_atleti (parte rilevante)

```sql
-- Backfill
UPDATE public.staff_atleti sa
SET
  staff_type = ...,
  status = COALESCE(sa.status, 'active'),
  org_id = (SELECT p.org_id FROM public.profiles p WHERE p.id = sa.atleta_id LIMIT 1)
WHERE sa.staff_type IS NULL OR sa.org_id IS NULL;

UPDATE public.staff_atleti sa SET org_id = (SELECT p.org_id FROM public.profiles p WHERE p.id = sa.atleta_id LIMIT 1) WHERE sa.org_id IS NULL;
UPDATE public.staff_atleti sa SET org_id = (SELECT p.org_id FROM public.profiles p WHERE p.id = sa.staff_id LIMIT 1) WHERE sa.org_id IS NULL;
DO $$
DECLARE
  missing int;
BEGIN
  SELECT COUNT(*) INTO missing FROM public.staff_atleti WHERE org_id IS NULL;
  IF missing > 0 THEN
    UPDATE public.staff_atleti sa
    SET org_id = (SELECT id FROM public.organizations ORDER BY created_at NULLS LAST LIMIT 1)
    WHERE sa.org_id IS NULL;
  END IF;
END $$;
```

**Fallback da rimuovere:** l’ultimo blocco DO che assegna `org_id = (SELECT id FROM organizations ORDER BY created_at LIMIT 1)` quando ancora NULL.

### 6) Helper usati

- `get_org_id_for_current_user()` — uuid, SECURITY DEFINER
- `get_profile_id_from_user_id(uuid)` — da auth.uid() a profiles.id
- `get_current_user_role()` — text, da profiles per user_id = auth.uid()
- `get_actor_profile_id_from_jwt()` — usato nel trigger originale (sostituito in hardening con auth.uid() → profiles.id)
- `audit_write(p_action, p_table_name, p_record_id, p_before, p_after, p_actor_profile_id, p_org_id, p_impersonated_profile_id)` — nessun `safe_text_to_uuid` in questa migration

---

## OUTPUT FINALE

### 1) File creati/modificati

| File                                                                             | Azione                                                                                                   |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260301240000_staff_requests_hardening.sql`                | **Creato** — validazione org_id, RPC (2 arg), trigger con check attore, drop policy UPDATE staff/athlete |
| `supabase/migrations/README_20260301240000_staff_requests_hardening_verifica.md` | **Creato** — query verifica org_id, RPC vs UPDATE, workout_logs pre-conferma, audit                      |
| `supabase/migrations/RESOCONTO_STAFF_REQUESTS_3.2_3.3.md`                        | **Creato** — questo resoconto (FASE 1 + output)                                                          |

Nessuna modifica alla migration originale `20260301230000`: il fallback org_id resta in quella migration; la hardening **valida** i dati esistenti e **corregge** i mismatch (org_id = athlete.org_id) e **fallisce** se restano incoerenze o athlete con org_id NULL.

### 2) Diff sintetico DB (hardening)

| Oggetto                                | Prima                                                                            | Dopo                                                                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Backfill org_id**                    | Fallback su “prima org” se NULL                                                  | Validazione: org_id deve coincidere con athlete; correzione mismatch; RAISE se incoerenze o athlete.org_id NULL                     |
| **staff_requests_apply_transition**    | (p_request_id, **p_actor_profile_id**, p_new_status); solo UPDATE                | (p_request_id, p_new_status); actor da auth.uid(); validazione transizioni (chi può fare cosa); validazione staff_type/role; UPDATE |
| **staff_requests_after_status_change** | v_actor da get_actor_profile_id_from_jwt() / auth.uid()                          | v_actor solo da auth.uid() → profiles; per staff_confirmed: RAISE se attore non è staff della richiesta o admin stessa org          |
| **RLS staff_requests UPDATE**          | Policy per staff (confirmed/cancelled) e athlete (accept/reject)                 | Policy UPDATE per staff e athlete **rimosse**; transizioni solo via RPC (DEFINER bypassa RLS); admin mantiene FOR ALL               |
| **Invited athletes**                   | Già solo staff_atleti con status='active' (profiles, appointments, workout_logs) | Nessun cambio; confermato nessun accesso su staff_requests                                                                          |

### 3) Query di verifica (dal README hardening)

- **org_id:** `SELECT ... FROM staff_atleti sa JOIN profiles p ON p.id = sa.atleta_id WHERE sa.org_id IS DISTINCT FROM p.org_id` → 0 righe.
- **Workflow via RPC:** `SELECT * FROM staff_requests_apply_transition('<id>'::uuid, 'athlete_accepted');` e idem per staff_confirmed; verificare risultato e stato in tabella.
- **UPDATE diretto bloccato:** come atleta/staff, `UPDATE staff_requests SET status = ...` → 0 row updated o errore RLS.
- **Staff non vede log pre-conferma:** prima di staff_confirmed non esiste riga staff_atleti active → SELECT workout_logs per quello staff non restituisce log di quell’atleta.
- **Audit:** `SELECT ... FROM audit_logs WHERE table_name = 'staff_requests' AND action LIKE 'STAFF_REQUEST_%'` → org_id e actor_profile_id coerenti.

### 4) Edge cases

- **Righe già con org_id da fallback:** la hardening allinea org_id ad athlete.org_id dove l’atleta ha org_id NOT NULL; se esistono atleti con org_id NULL in staff_atleti la migration fa RAISE e non assegna org arbitrari.
- **Chiamata RPC senza auth:** auth.uid() NULL → RPC ritorna `{ok: false, error: 'not_authenticated'}`.
- **Admin conferma al posto dello staff:** la RPC non permette staff*confirmed se v_actor_profile_id <> r.staff_id (solo staff può confermare). Per permettere anche admin bisogna estendere la RPC (es. se v_actor_role = 'admin' e org_id = r.org_id allora consentire staff_confirmed). \_Nota: nella hardening attuale staff_confirmed è consentito solo allo staff; per “admin può cancellare” abbiamo cancellato; per “admin può confermare” andrebbe aggiunta la stessa logica della cancellazione.*
- **Trigger e RPC:** l’UPDATE fatto dalla RPC attiva il trigger; il trigger verifica che per staff_confirmed l’attore sia staff o admin stessa org — quindi se in futuro si aggiunge la possibilità che admin confermi dalla RPC, il trigger deve accettare anche actor = admin con stessa org (già fatto nel trigger hardening).
- **App deve usare RPC:** l’app non deve più fare UPDATE su staff_requests per cambiare status; deve chiamare `staff_requests_apply_transition(request_id, new_status)`.
