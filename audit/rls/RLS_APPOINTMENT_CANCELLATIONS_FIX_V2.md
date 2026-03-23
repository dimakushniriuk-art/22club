# `appointment_cancellations` — proposta RLS v2 (identity-based)

## Colonne reali (`schema.sql`)

`public.appointment_cancellations`:

| Colonna                   | Tipo          | Uso nella policy                                       |
| ------------------------- | ------------- | ------------------------------------------------------ |
| `id`                      | uuid          | —                                                      |
| `appointment_id`          | uuid NOT NULL | FK → `appointments.id`                                 |
| `athlete_id`              | uuid          | atleta coinvolto nella cancellazione (può essere NULL) |
| `cancelled_at`            | timestamptz   | —                                                      |
| `cancelled_by_profile_id` | uuid          | profilo che ha registrato la cancellazione             |
| `cancellation_type`       | text          | —                                                      |
| `lesson_deducted`         | boolean       | —                                                      |

`public.appointments` (per ownership): `athlete_id`, `staff_id` NOT NULL, `trainer_id` (nullable).

**Mapping:** “atleta dell’appuntamento” = `appointments.athlete_id`. “Owner staff/trainer” = `appointments.staff_id` / `appointments.trainer_id`. La riga `appointment_cancellations.athlete_id` è il soggetto della cancellazione (storico), non sostituisce il controllo su `appointments.athlete_id` per INSERT.

## Policy attuali da rimuovere

- `appointment_cancellations_insert_authenticated` — `WITH CHECK (true)`
- `appointment_cancellations_select_authenticated` — `USING (true)`

## Nuove policy proposte (file SQL)

| Nome                                        | Tipo   | Logica                                                                                                                                                                |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appointment_cancellations_select_identity` | SELECT | `is_admin()` **oppure** `cancelled_by` / `athlete_id` sulla riga **oppure** su `appointments`: `athlete_id`, `staff_id` o `trainer_id` = profilo corrente             |
| `appointment_cancellations_insert_identity` | INSERT | `cancelled_by_profile_id` = profilo corrente **e** (`is_admin()` **oppure** EXISTS su `appointments` con `athlete_id` / `staff_id` / `trainer_id` = profilo corrente) |

Helper usati (presenti nello schema): `public.is_admin()`, `public.get_profile_id_from_user_id(auth.uid())`.

## Rischio regressione

| Scenario                                          | Rischio                                                                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Subquery su `appointments` sotto RLS              | La policy su `appointments` filtra le righe: staff/atleta che **non** passano SELECT su quell’appuntamento potrebbero fallire INSERT anche se “owner” logico. Mitigazione: test con ruoli reali. |
| Admin cross-org                                   | SELECT cancellazioni: `is_admin()` copre. INSERT come admin: ramo `is_admin()` senza EXISTS; validità `appointment_id` dal **FK**.                                                               |
| `get_profile_id_from_user_id` NULL                | Nessun INSERT/SELECT (comportamento voluto).                                                                                                                                                     |
| Reception / ruoli non mappati su staff_id         | Se non sono `staff_id`/`trainer_id`/`athlete_id` né admin, perdono SELECT/INSERT.                                                                                                                |
| Righe storiche con `cancelled_by_profile_id` NULL | Visibili solo a `is_admin()` o se staff/trainer sull’appuntamento o `athlete_id` riga = profilo.                                                                                                 |

## Query SQL di verifica (dopo applicazione su staging)

```sql
-- Policy presenti
SELECT polname, polcmd, polroles::regrole[]
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'appointment_cancellations';

-- Conteggio righe visibili come utente corrente (da eseguire con JWT diversi)
SELECT count(*) FROM public.appointment_cancellations;
```

## Test manuali consigliati

1. **Admin:** SELECT tutte le righe attese; INSERT con `appointment_id` esistente e `cancelled_by_profile_id` = proprio profilo.
2. **Atleta:** INSERT solo se `appointments.athlete_id` = proprio `profiles.id`; SELECT righe proprie + dove `appointment_cancellations.athlete_id` = sé.
3. **Staff (staff_id su appointment):** SELECT/INSERT per appuntamenti di cui è `staff_id`.
4. **Trainer (trainer_id):** stesso con `trainer_id`.
5. **Utente altra org / non coinvolto:** SELECT vuoto su righe altrui; INSERT negato.
6. **Slot open (`appointments.athlete_id` NULL):** solo staff/trainer/admin possono INSERT storico cancellazione (atleta non passa EXISTS su `athlete_id`).
