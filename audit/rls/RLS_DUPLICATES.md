# RLS — duplicati, sovrapposizioni, legacy (schema.sql)

## 1. Policy duplicate / stesso effetto (OR tra policy)

| Area                                          | Dettaglio                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **appointments DELETE**                       | 4 policy: `Staff (nutrizionista massaggiatore) can delete`, `appointments_delete_own_org`, `appointments_delete_staff_or_admin`, `athlete_delete_own_athlete_created_appointments`. Staff nut/mass è sottoinsieme di scenari già coperti da `appointments_delete_own_org` / `appointments_delete_staff_or_admin` in molti casi. |
| **appointments UPDATE**                       | 4 policy: stesso staff nut/mass + `appointments_update_own_org` + `athlete_update_own_athlete_created` + `staff_can_update_own_appointments`. **Due modelli staff:** `get_profile_id_from_user_id` vs `get_current_staff_profile_id()`.                                                                                         |
| **appointments SELECT**                       | `appointments_select_own_org` vs `authenticated_select_appointments_in_open_slots` vs `athlete_select_open_booking_slots` — stesso dominio “slot aperti”, condizioni diverse (`org_id` / `is_open_booking_day`).                                                                                                                |
| **communications / communication_recipients** | Policy quoted “Staff can …” **e** snake_case `*_own_or_admin` — stessa tabella, doppio stile naming e possibile ridondanza SELECT/ALL.                                                                                                                                                                                          |
| **inviti_atleti**                             | Policy **quoted** (“PT can …”) **e** snake_case (`inviti_atleti_select_own_org`, …) — due epoche convivono.                                                                                                                                                                                                                     |
| **staff_calendar_settings**                   | Policy con/senza `TO authenticated` esplicito (stesso pattern calendario).                                                                                                                                                                                                                                                      |
| **profiles SELECT**                           | Molte policy SELECT sovrapposte (admin ×2, marketing, massaggiatori, nutrizionisti, atleti chat) — nessuna è “duplicato nome”, ma **modello autorizzazione frammentato**.                                                                                                                                                       |

## 2. Policy sovrapposte (stesso comando, predicati diversi)

- **chat_messages SELECT:** `chat_messages_select_conversation` vs `chat_messages_select_own_via_profile_id` — entrambe SELECT; unione = OK ma difficile ragionare su minimo comune.
- **credit_ledger INSERT:** policy staff multi-servizio + `ledger_insert_staff_only` + altre — verificare se WITH CHECK `true` rende una policy de facto superset.
- **payments / workout\_\*** / **documents:** molte policy per ruolo con EXISTS simili su `profiles` — candidati a consolidamento per lettura.

## 3. Legacy sospette

| Elemento                                                                     | Motivo                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ruoli **`pt`**, **`staff`** in ARRAY accanto a **`trainer`**, **`admin`**    | Evidente in `appointments_*_own_org`, `exercises`, `cliente_tags`, molte workout.                                                                                                                                               |
| **`atleta` / `athlete`** duplicati negli ARRAY                               | Pattern ripetuto su profiles, lesson_counters, appointments.                                                                                                                                                                    |
| **`pt_atleti`** + **`trainer_athletes`** + **`athlete_trainer_assignments`** | Tre modelli di legame PT–atleta; policy disomogenee.                                                                                                                                                                            |
| **`org_id` (uuid) vs `org_id_text` (text)**                                  | `appointments` usa `org_id_text` in alcune policy e `org_id` in altre; `exercises` SELECT solo `org_id_text`; marketing leads/events su `org_id_text`; automations su `org_id` + helper. Rischio incoerenza se i due divergono. |
| **`lead_to_athlete_links` / `marketing_trials`**                             | Solo **`request.jwt.claims`** → `org_id`; resto del DB usa funzioni SQL. Se JWT non popolato, comportamento diverso dal resto.                                                                                                  |
| **`nutrition_plan_versions_legacy`**                                         | Tabella + RLS parallela a versioni “correnti”.                                                                                                                                                                                  |
| Policy **quoted human-readable** vs **snake_case**                           | Indica migrazioni incrementali non consolidate.                                                                                                                                                                                 |

## 4. Tabelle con modelli di autorizzazione mischiati

| Tabella           | Modelli mischiati                                                                  |
| ----------------- | ---------------------------------------------------------------------------------- |
| **appointments**  | ruoli array legacy + `is_admin` + staff profile due helper + atleta + open booking |
| **profiles**      | `is_admin()`, `get_current_user_role()`, EXISTS su ruoli, service_role true        |
| **payments**      | staff profile id, org, ruoli, admin                                                |
| **progress_logs** | subquery profilo con ruolo vs `athlete_id = auth.uid()` (vedi mismatch)            |
| **inviti_atleti** | PT legacy quoted vs org moderna                                                    |

## 5. Mismatch helper / identità

| Problema                                                                              | Dove                                                                                                                                    |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`get_profile_id_from_user_id(auth.uid())`** vs **`get_current_staff_profile_id()`** | appointments UPDATE; insert usa secondo, delete/update nut/mass usa primo.                                                              |
| **`athlete_id = auth.uid()`** su tabella dove `athlete_id` è **FK a profiles.id**     | **progress_logs** DELETE/INSERT/UPDATE atleta — tipicamente sempre falso se non coincide miracolo con UUID. SELECT usa EXISTS corretto. |
| **web_vitals**                                                                        | admin lettura via ruoli `admin`/`pt` in EXISTS, non `is_admin()` — diverso dal resto admin.                                             |

## 6. Policy troppo permissive (`true`)

| Tabella                              | Policy / effetto                                              |
| ------------------------------------ | ------------------------------------------------------------- |
| **appointment_cancellations**        | INSERT/SELECT `authenticated` + **true**                      |
| **profiles**                         | service_role DELETE/INSERT **true** (accettabile per service) |
| **audit_logs**                       | service_role INSERT **WITH CHECK true**                       |
| **marketing\_\*** (varie)            | UPDATE **WITH CHECK true**                                    |
| **notifications**                    | UPDATE **WITH CHECK true**                                    |
| **credit_ledger** / **workout_sets** | almeno una policy con **WITH CHECK true** su insert           |

## 7. RLS attivo senza policy (tabella “chiusa”)

`athlete_administrative_data`, `athlete_fitness_data`, `athlete_massage_data`, `athlete_medical_data`, `athlete_nutrition_data`, `athlete_smart_tracking_data`, tutte **`trainer_*`** (8 tabelle). Accesso client quasi certamente **negato** salvo service_role / bypass.
